import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  RESET_REQUEST_COOLDOWN_SECONDS,
  RESET_TOKEN_TTL_MINUTES,
  adminResetWhatsAppNumber,
  generateResetToken,
} from "@/lib/auth/reset-token";
import { isWhatsAppConfigured, sendWhatsAppResetLink } from "@/lib/whatsapp";

/** Last 4 digits only, so the response confirms the channel without exposing the number. */
function maskedNumber(): string {
  return `******${adminResetWhatsAppNumber().replace(/\D/g, "").slice(-4)}`;
}

/**
 * Public endpoint: sends a one-time password reset link to the admin
 * WhatsApp number. Only active ADMIN accounts can be reset this way. The
 * response is identical whether or not the username matched, so it can't be
 * used to discover admin usernames.
 */
export async function POST(request: NextRequest) {
  let body: { username?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const isDev = process.env.NODE_ENV !== "production";
  if (!isWhatsAppConfigured() && !isDev) {
    return NextResponse.json(
      { error: "Password reset via WhatsApp is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const genericResponse = NextResponse.json(
    {
      ok: true,
      message: `If this is an admin account, a reset link has been sent on WhatsApp to ${maskedNumber()}.`,
    },
    { status: 200 }
  );

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive || user.role !== "ADMIN") return genericResponse;

  // Throttle repeated requests so the WhatsApp number can't be spammed. The
  // reply stays generic so the cooldown doesn't reveal an admin username.
  const recent = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_SECONDS * 1000) },
    },
    select: { id: true },
  });
  if (recent) return genericResponse;

  const { token, tokenHash } = generateResetToken();
  const created = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    },
  });

  // Prefer the configured public URL; the request origin is a dev fallback.
  const baseUrl = (process.env.APP_BASE_URL || request.nextUrl.origin).replace(/\/+$/, "");
  const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  if (!isWhatsAppConfigured()) {
    // Local development without WhatsApp credentials: print the link instead.
    console.log(`[forgot-password] WhatsApp not configured. Reset link for ${user.username}: ${link}`);
    return genericResponse;
  }

  try {
    await sendWhatsAppResetLink(adminResetWhatsAppNumber(), link);
  } catch (error) {
    console.error("Failed to send WhatsApp reset link:", error);
    // Don't leave a usable token behind for a link nobody received.
    await prisma.passwordResetToken.delete({ where: { id: created.id } });
    return NextResponse.json(
      { error: "Could not send the WhatsApp message. Please try again later." },
      { status: 502 }
    );
  }

  return genericResponse;
}

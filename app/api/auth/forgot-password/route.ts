import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  RESET_REQUEST_COOLDOWN_SECONDS,
  RESET_TOKEN_TTL_MINUTES,
  generateResetToken,
} from "@/lib/auth/reset-token";
import { isMailerConfigured, sendResetEmail } from "@/lib/mailer";

/**
 * Public endpoint: emails a one-time password reset link for an admin
 * account. Only active ADMIN accounts can be reset this way. The response is
 * identical whether or not the username matched (and doesn't reveal the
 * address), so it can't be used to discover admin usernames or emails.
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
  if (!isMailerConfigured() && !isDev) {
    return NextResponse.json(
      { error: "Password reset by email is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const genericResponse = NextResponse.json(
    {
      ok: true,
      message:
        "If this is an admin account, a reset link has been sent to its registered email address.",
    },
    { status: 200 }
  );

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive || user.role !== "ADMIN") return genericResponse;

  // Throttle repeated requests so the inbox can't be spammed. The reply
  // stays generic so the cooldown doesn't reveal an admin username.
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
  const recipient = process.env.ADMIN_RESET_EMAIL || user.email;

  if (!isMailerConfigured()) {
    // Local development without SMTP credentials: print the link instead.
    console.log(`[forgot-password] Email not configured. Reset link for ${user.username}: ${link}`);
    return genericResponse;
  }

  try {
    await sendResetEmail(recipient, link);
  } catch (error) {
    console.error("Failed to send reset email:", error);
    // Don't leave a usable token behind for a link nobody received.
    await prisma.passwordResetToken.delete({ where: { id: created.id } });
    return NextResponse.json(
      { error: "Could not send the reset email. Please try again later." },
      { status: 502 }
    );
  }

  return genericResponse;
}

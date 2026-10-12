import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isStrongPassword } from "@/lib/auth/password";
import { hashResetToken } from "@/lib/auth/reset-token";

/** Finds an unused, unexpired reset token for an active admin, or null. */
async function findValidToken(token: string) {
  if (!token) return null;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: { select: { id: true, username: true, isActive: true, role: true } } },
  });
  if (
    !record ||
    record.usedAt ||
    record.expiresAt.getTime() < Date.now() ||
    !record.user.isActive ||
    record.user.role !== "ADMIN"
  ) {
    return null;
  }
  return record;
}

/** Lets the reset page check the link before showing the form. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const record = await findValidToken(token);
  if (!record) {
    return NextResponse.json(
      { valid: false, error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { valid: true, username: record.user.username },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  let body: { token?: unknown; newPassword?: unknown; confirmNewPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmNewPassword =
    typeof body.confirmNewPassword === "string" ? body.confirmNewPassword : "";

  const errors: string[] = [];
  if (!isStrongPassword(newPassword)) {
    errors.push("Password must be at least 8 characters and include a letter and a number");
  }
  if (newPassword !== confirmNewPassword) {
    errors.push("Passwords do not match");
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const record = await findValidToken(token);
  if (!record) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    // Claim the token atomically so two concurrent submits can't both succeed.
    const claim = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: now },
    });
    if (claim.count === 0) return false;

    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    // Any other outstanding links for this account are no longer needed.
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: now },
    });
    return true;
  });

  if (!updated) {
    return NextResponse.json(
      { error: "This reset link has already been used." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

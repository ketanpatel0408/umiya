import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { hashPassword, isStrongPassword, verifyPassword } from "@/lib/auth/password";

/**
 * Lets the currently authenticated user (Admin or normal User) change their
 * own password. Requires the current password to be verified server-side
 * before allowing the change. The existing HMAC session cookie remains
 * valid afterwards (session is not keyed to the password), so no re-login
 * is required.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmNewPassword?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmNewPassword =
    typeof body.confirmNewPassword === "string" ? body.confirmNewPassword : "";

  const errors: string[] = [];
  if (!currentPassword) errors.push("currentPassword is required");
  if (!isStrongPassword(newPassword)) {
    errors.push(
      "newPassword must be at least 8 characters and include a letter and a number"
    );
  }
  if (newPassword !== confirmNewPassword) {
    errors.push("newPassword and confirmNewPassword do not match");
  }
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { id: auth.user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

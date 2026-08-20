import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword, isStrongPassword } from "@/lib/auth/password";

/**
 * Admin-only: reset/change any user's password. Does not require or verify
 * the target user's current password (Admin is trusted to reset it), but
 * does require Admin authorization server-side. Never returns the password
 * hash.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  const userId = Number(id);

  let body: { newPassword?: unknown; confirmNewPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmNewPassword =
    typeof body.confirmNewPassword === "string" ? body.confirmNewPassword : "";

  const errors: string[] = [];
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

  try {
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Failed to change password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

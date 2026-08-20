import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword, isStrongPassword } from "@/lib/auth/password";

const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
  sellerName: true,
  sellerPhone: true,
  sellerAddress: true,
  sellerGSTIN: true,
  sellerPAN: true,
  sellerState: true,
  sellerStateCode: true,
} as const;

const VALID_ROLES = Object.values(UserRole);

type IncomingPatch = {
  fullName?: unknown;
  email?: unknown;
  role?: unknown;
  isActive?: unknown;
  password?: unknown;
  sellerName?: unknown;
  sellerPhone?: unknown;
  sellerAddress?: unknown;
  sellerGSTIN?: unknown;
  sellerPAN?: unknown;
  sellerState?: unknown;
  sellerStateCode?: unknown;
};

const SELLER_FIELDS = [
  "sellerName",
  "sellerPhone",
  "sellerAddress",
  "sellerGSTIN",
  "sellerPAN",
  "sellerState",
  "sellerStateCode",
] as const;

export async function PATCH(
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

  let body: IncomingPatch;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors: string[] = [];
  const data: Prisma.UserUpdateInput = {};

  if (body.fullName !== undefined) {
    if (typeof body.fullName !== "string" || body.fullName.trim() === "") {
      errors.push("fullName must be a non-empty string");
    } else {
      data.fullName = body.fullName.trim();
    }
  }

  if (body.email !== undefined) {
    if (typeof body.email !== "string" || body.email.trim() === "") {
      errors.push("email must be a non-empty string");
    } else {
      data.email = body.email.trim();
    }
  }

  if (body.role !== undefined) {
    if (typeof body.role !== "string" || !VALID_ROLES.includes(body.role as UserRole)) {
      errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
    } else {
      if (userId === auth.user.id && body.role !== "ADMIN") {
        errors.push("You cannot remove your own admin role");
      }
      data.role = body.role as UserRole;
    }
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      errors.push("isActive must be a boolean");
    } else {
      if (userId === auth.user.id && body.isActive === false) {
        errors.push("You cannot deactivate your own account");
      }
      data.isActive = body.isActive;
    }
  }

  if (body.password !== undefined) {
    if (typeof body.password !== "string" || !isStrongPassword(body.password)) {
      errors.push(
        "password must be at least 8 characters and include a letter and a number"
      );
    } else {
      data.passwordHash = await hashPassword(body.password);
    }
  }

  for (const field of SELLER_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (value !== null && typeof value !== "string") {
      errors.push(`${field} must be a string`);
      continue;
    }
    const trimmed = typeof value === "string" ? value.trim() : "";
    (data as Record<string, string | null>)[field] = trimmed === "" ? null : trimmed;
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * Admin-only user deletion. Since Invoice.ownerId -> User has an ON DELETE
 * RESTRICT foreign key, a user with existing invoices cannot be hard-deleted
 * without breaking historical data; in that case we deactivate the account
 * instead (safe/soft delete) so invoice history remains intact. Users with
 * no invoices are hard-deleted.
 */
export async function DELETE(
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

  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const invoiceCount = await prisma.invoice.count({ where: { ownerId: userId } });

  try {
    if (invoiceCount > 0) {
      // Preserve historical invoice data: deactivate instead of hard delete.
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: USER_SELECT,
      });
      return NextResponse.json(
        {
          deactivated: true,
          message:
            "User has existing invoices and was deactivated instead of deleted to preserve historical data.",
          user,
        },
        { status: 200 }
      );
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

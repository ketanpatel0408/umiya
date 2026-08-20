import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword, isStrongPassword } from "@/lib/auth/password";

const VALID_ROLES = Object.values(UserRole);

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
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
    },
  });

  return NextResponse.json(users, { status: 200 });
}

type IncomingUser = {
  username?: unknown;
  password?: unknown;
  fullName?: unknown;
  email?: unknown;
  role?: unknown;
  sellerName?: unknown;
  sellerPhone?: unknown;
  sellerAddress?: unknown;
  sellerGSTIN?: unknown;
  sellerPAN?: unknown;
  sellerState?: unknown;
  sellerStateCode?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: IncomingUser;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors: string[] = [];
  if (!isNonEmptyString(body.username)) errors.push("username is required");
  if (!isNonEmptyString(body.fullName)) errors.push("fullName is required");
  if (!isNonEmptyString(body.email)) errors.push("email is required");
  if (!isNonEmptyString(body.password) || !isStrongPassword(body.password as string)) {
    errors.push(
      "password must be at least 8 characters and include a letter and a number"
    );
  }
  const role = isNonEmptyString(body.role) ? body.role : "USER";
  if (!VALID_ROLES.includes(role as UserRole)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hashPassword(body.password as string);
    const user = await prisma.user.create({
      data: {
        username: (body.username as string).trim(),
        passwordHash,
        fullName: (body.fullName as string).trim(),
        email: (body.email as string).trim(),
        role: role as UserRole,
        sellerName: optionalString(body.sellerName),
        sellerPhone: optionalString(body.sellerPhone),
        sellerAddress: optionalString(body.sellerAddress),
        sellerGSTIN: optionalString(body.sellerGSTIN),
        sellerPAN: optionalString(body.sellerPAN),
        sellerState: optionalString(body.sellerState),
        sellerStateCode: optionalString(body.sellerStateCode),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        sellerName: true,
        sellerPhone: true,
        sellerAddress: true,
        sellerGSTIN: true,
        sellerPAN: true,
        sellerState: true,
        sellerStateCode: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

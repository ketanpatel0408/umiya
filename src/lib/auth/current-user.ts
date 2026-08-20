import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export type CurrentUser = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerAddress: string | null;
  sellerGSTIN: string | null;
  sellerPAN: string | null;
  sellerState: string | null;
  sellerStateCode: string | null;
};

/**
 * Resolves the authenticated user for the current request from the signed
 * session cookie. Always re-checks the database (not just the token) so a
 * deactivated account is rejected immediately, even with a still-valid token.
 *
 * Returns null when there is no valid session or the account is inactive.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    sellerName: user.sellerName,
    sellerPhone: user.sellerPhone,
    sellerAddress: user.sellerAddress,
    sellerGSTIN: user.sellerGSTIN,
    sellerPAN: user.sellerPAN,
    sellerState: user.sellerState,
    sellerStateCode: user.sellerStateCode,
  };
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "ADMIN";
}

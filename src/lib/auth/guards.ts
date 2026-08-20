import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "./current-user";

export type AuthResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; response: NextResponse };

/** Requires any authenticated (and active) user. Use in API route handlers. */
export async function requireUser(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

/** Requires an authenticated user with the ADMIN role. */
export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireUser();
  if (!result.ok) return result;
  if (result.user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

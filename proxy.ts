import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_PAGE_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  const isApi = pathname.startsWith("/api/");
  const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
  const isPublicPage = PUBLIC_PAGE_PATHS.some((p) => pathname.startsWith(p));

  if (session) {
    // Already logged in; keep them off the login page.
    if (isPublicPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/users") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};

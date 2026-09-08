import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userId = request.cookies.get("atom_user_id")?.value;
  const role = request.cookies.get("atom_role")?.value;

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/knowledge") ||
    pathname.startsWith("/automations") ||
    pathname.startsWith("/voice-agent") ||
    pathname.startsWith("/funnels") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  // If visiting protected route without an active session cookie, redirect to /login
  if (isProtectedPath && !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC enforcement on Agency Master Admin
  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN" && role !== "AGENCY_STAFF") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/crm/:path*",
    "/knowledge/:path*",
    "/automations/:path*",
    "/voice-agent/:path*",
    "/funnels/:path*",
    "/billing/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};

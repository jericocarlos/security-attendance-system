import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow access to /admin/login without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect unauthenticated users
  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Role-based access control
  const role = token.role;

  // Only admin can access /admin/user-management
  if (pathname.startsWith("/admin/user-management") && role !== "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Only admin, supervisor, or manager can access /admin/employees-management and /admin/lists
  if (
    (pathname.startsWith("/admin/employees-management") ||
      pathname.startsWith("/admin/lists")) &&
    !["admin", "supervisor", "manager"].includes(role)
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Only supervisor or manager can access /admin/attendance-logs
  if (
    pathname.startsWith("/admin/attendance-logs") &&
    !["supervisor", "manager"].includes(role)
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
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

  // SUPERADMIN and ADMIN have access to everything
  if (["superadmin", "admin"].includes(role)) {
    return NextResponse.next();
  }

  // SECURITY and HR can only access the dashboard and attendance logs
  if (["security", "hr"].includes(role)) {
    // Allow access to dashboard
    if (pathname === "/admin") {
      return NextResponse.next();
    }

    // Allow access to attendance logs
    if (pathname.startsWith("/admin/attendance-logs")) {
      return NextResponse.next();
    }

    // Redirect to dashboard for all other paths
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // If a user has an unknown role, redirect to login
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/registro"];

const roleRoutes: Record<string, string[]> = {
  STUDENT: ["/alumno"],
  TEACHER: ["/profesor"],
  SUPER_ADMIN: ["/admin", "/profesor", "/alumno"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes, join routes, static assets, and API auth
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/unirse") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const session = req.auth;

  // Not authenticated → redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Check role-based access
  const protectedPrefixes = ["/alumno", "/profesor", "/admin"];
  const matchedPrefix = protectedPrefixes.find((prefix) => pathname.startsWith(prefix));

  if (matchedPrefix) {
    const allowedPrefixes = roleRoutes[role ?? ""] || [];
    if (!allowedPrefixes.includes(matchedPrefix)) {
      const redirectTo =
        role === "TEACHER" ? "/profesor" : role === "SUPER_ADMIN" ? "/admin" : "/alumno";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};

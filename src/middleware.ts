import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/registro", "/api/auth"];

const roleRoutes: Record<string, string[]> = {
  STUDENT: ["/alumno"],
  TEACHER: ["/profesor"],
  SUPER_ADMIN: ["/admin", "/profesor", "/alumno"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes and unirse (join) routes
  if (
    publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
    pathname.startsWith("/unirse")
  ) {
    return NextResponse.next();
  }

  // Allow static assets and API auth
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) {
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
    const allowedPrefixes = roleRoutes[role] || [];
    if (!allowedPrefixes.includes(matchedPrefix)) {
      // Redirect to their own dashboard
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

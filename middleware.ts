import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/vendor": ["vendor"],
  "/serviceboy": ["serviceBoy"],
  "/user": ["user"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/vendor/register",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get the access token from cookies or check localStorage via a cookie
  // Note: We use a simple cookie-based check here since localStorage isn't available in middleware
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // If on a public route and authenticated, redirect to appropriate dashboard
  if (isPublicRoute && accessToken && userRole) {
    const dashboards: Record<string, string> = {
      admin: "/admin/dashboard",
      vendor: "/vendor/dashboard",
      serviceBoy: "/serviceboy/dashboard",
      user: "/user/dashboard",
    };
    
    const dashboard = dashboards[userRole] || "/user/dashboard";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // Check if route requires protection
  const matchedRoute = Object.keys(protectedRoutes).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (matchedRoute) {
    // No token - redirect to login
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role authorization
    const allowedRoles = protectedRoutes[matchedRoute];
    if (userRole && !allowedRoles.includes(userRole)) {
      // User has wrong role - redirect to their correct dashboard
      const dashboards: Record<string, string> = {
        admin: "/admin/dashboard",
        vendor: "/vendor/dashboard",
        serviceBoy: "/serviceboy/dashboard",
        user: "/user/dashboard",
      };
      
      const correctDashboard = dashboards[userRole] || "/login";
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  // Handle root path
  if (pathname === "/") {
    if (accessToken && userRole) {
      const dashboards: Record<string, string> = {
        admin: "/admin/dashboard",
        vendor: "/vendor/dashboard",
        serviceBoy: "/serviceboy/dashboard",
        user: "/user/dashboard",
      };
      
      const dashboard = dashboards[userRole] || "/user/dashboard";
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

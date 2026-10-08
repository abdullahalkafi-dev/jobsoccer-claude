import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;

  const { pathname } = request.nextUrl;

  // Define protected routes (require authentication)
  const isProtectedRoute =
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notification") ||
    pathname.startsWith("/my-network") ||
    pathname.startsWith("/profile");

  // Define auth routes (should not be accessible when authenticated)
  const isAuthRoute =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/create-new-password") ||
    pathname.startsWith("/create-profile");

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/messages/:path*",
    "/notification/:path*",
    "/my-network/:path*",
    "/profile/:path*",
    "/signup/:path*",
    "/forgot-password",
    "/create-new-password/:path*",
  ],
};

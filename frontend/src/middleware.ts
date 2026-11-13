import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route guard. It can only see cookies, so it reads the "token" cookie, which the app keeps
 * in step with the saved login (see lib/authCookie.ts and AuthSync in lib/Provider.tsx).
 */
export function middleware(request: NextRequest) {
  const isAuthenticated = !!request.cookies.get("token")?.value;
  const { pathname, search } = request.nextUrl;

  // Pages that need a signed-in user
  const isProtectedRoute =
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notification") ||
    pathname.startsWith("/my-network") ||
    pathname.startsWith("/profile");

  // Pages for signed-out visitors only. (/create-profile is NOT here: a new user is signed in
  // right after the email code and must still reach it.)
  const isAuthRoute =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/create-new-password");

  if (!isAuthenticated && isProtectedRoute) {
    // Remember where the user wanted to go; Sign in sends them there afterwards. If the browser
    // still has a saved login (only the cookie had expired), Sign in restores it and continues.
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/messages/:path*",
    "/notification/:path*",
    "/my-network/:path*",
    "/profile/:path*",
    "/signin/:path*",
    "/signup/:path*",
    "/forgot-password",
    "/create-new-password/:path*",
  ],
};

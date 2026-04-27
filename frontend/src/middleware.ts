import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes
  if (path.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect user account/checkout/order routes
  if (
    path.startsWith("/account") ||
    path.startsWith("/checkout") ||
    path.startsWith("/order")
  ) {
    const userToken = request.cookies.get("user-token");
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/order/:path*"],
};

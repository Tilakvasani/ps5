import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin routes: anyone without an admin session cookie gets a genuine
  // 404 at the edge — never a redirect to a login page, which would
  // confirm the panel exists at this URL. admin/layout.tsx additionally
  // re-verifies the JWT against the backend on every page load (a cookie
  // can exist yet be expired/invalid — that check is the real gate).
  if (path.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken) {
      return NextResponse.rewrite(new URL("/admin/__not_found__", request.url));
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
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/order/:path*", "/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin auth is handled by admin/layout.tsx (reads localStorage via useEffect)
  // Middleware cannot read localStorage — so no admin check here.

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
  matcher: ["/account/:path*", "/checkout/:path*", "/order/:path*"],
};

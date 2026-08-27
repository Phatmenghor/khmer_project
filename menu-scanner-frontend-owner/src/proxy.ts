import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip unparseable router state header to prevent 500 on first request
  // after a Next.js version upgrade (browser still holds old cached state).
  const routerState = req.headers.get("Next-Router-State-Tree");
  if (routerState) {
    try {
      JSON.parse(decodeURIComponent(routerState));
    } catch {
      const headers = new Headers(req.headers);
      headers.delete("Next-Router-State-Tree");
      return NextResponse.next({ request: { headers } });
    }
  }

  // Skip static assets, API routes, and WebSocket routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/ws") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value ||
    req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;

  // Public routes — always allow through
  const publicPaths = ["/", "/register"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Login page: redirect to dashboard if already authenticated
  if (pathname === "/login") {
    return token
      ? NextResponse.redirect(new URL("/admin/platform-users", req.url))
      : NextResponse.next();
  }

  // Protected routes: require token
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|ws|_next/static|_next/image|favicon.ico|\\.well-known).*)"],
};

import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip unparseable router state header that causes a 500 on first request
  // after a Next.js version upgrade (browser still holds old cached state).
  // Stripping forces Next.js to do a clean full-page render instead.
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

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/admin/platform-users", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(
      new URL("/dashboard/admin/platform-users", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)"],
};

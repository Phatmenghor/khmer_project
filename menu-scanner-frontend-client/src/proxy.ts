// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for both customer and admin tokens
  const customerToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;
  const hasAuth = customerToken || adminToken;

  // Locale handling
  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;

  // =============================
  // ADMIN ROUTES - REQUIRE AUTH
  // =============================
  if (pathname.startsWith("/admin")) {
    if (!hasAuth) {
      // No token - redirect to login immediately
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Continue request with locale header
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

// Matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};

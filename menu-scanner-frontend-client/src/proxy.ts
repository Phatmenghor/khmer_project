// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for both customer and admin tokens
  const customerToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;

  // Locale handling
  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;

  // =============================
  // ADMIN ROUTES - REQUIRE ADMIN TOKEN
  // =============================
  if (pathname.startsWith("/admin")) {
    // Need admin token for /admin
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // =============================
  // PUBLIC ROUTES - ALLOW ALL
  // =============================
  // If on public page, just need some auth (admin can use customer auth, or customer)
  // Don't block, don't redirect - let user use whichever auth they have

  // Continue request with locale header
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

// Matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};

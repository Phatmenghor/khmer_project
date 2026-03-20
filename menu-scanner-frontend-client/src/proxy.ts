// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for both customer and admin tokens
  const customerToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;

  // Determine user type
  const isAdmin = !!adminToken;
  const userInfoCookie = req.cookies.get(
    isAdmin ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO
  )?.value;
  const userInfo = userInfoCookie
    ? JSON.parse(decodeURIComponent(userInfoCookie))
    : null;
  const userType = userInfo?.userType;

  // Locale handling
  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;

  // =============================
  // ADMIN ROUTES - REQUIRE TOKEN
  // =============================
  if (pathname.startsWith("/admin")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // =============================
  // LOGIN PAGE - ONLY ADMIN
  // =============================
  if (pathname === "/login") {
    // Customer trying to access /login → redirect to /
    if (customerToken && !adminToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // =============================
  // PUBLIC ROUTES - BLOCK ADMIN ONLY
  // =============================
  if (pathname === "/" && isAdmin && userType === "BUSINESS_USER") {
    // Admin on public home → redirect to /admin
    return NextResponse.redirect(new URL("/admin", req.url));
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

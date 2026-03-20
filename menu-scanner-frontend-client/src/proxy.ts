// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for BOTH customer and admin tokens
  const customerToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;

  const isAdminAuth = !!adminToken;
  const isCustomerAuth = !!customerToken;

  // Determine user type from cookies
  const userInfoCookie = req.cookies.get(
    isAdminAuth ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO
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
  // ADMIN ROUTES - REQUIRE ADMIN TOKEN
  // =============================
  if (pathname.startsWith("/admin")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userType !== "BUSINESS_USER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // =============================
  // PUBLIC ROUTES - BLOCK ADMIN USERS
  // =============================
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/login") && isAdminAuth && userType === "BUSINESS_USER") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // =============================
  // LOGIN PAGE - ADMIN ONLY
  // =============================
  if (pathname === "/login") {
    // Admin logged in → redirect to /admin
    if (isAdminAuth && userType === "BUSINESS_USER") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    // Customer logged in → BLOCK from /login, redirect to public
    if (isCustomerAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Continue request
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

// Matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};

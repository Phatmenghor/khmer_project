
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;


  const customerToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;


  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;


  if (pathname.startsWith("/admin")) {

    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }


  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}


export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};

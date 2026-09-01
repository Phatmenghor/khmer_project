import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

const LOGIN_PATH = "/login";
const ADMIN_PATH = "/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminToken = Boolean(
    request.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value ||
    request.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value
  );

  if (pathname.startsWith(ADMIN_PATH) && !hasAdminToken) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

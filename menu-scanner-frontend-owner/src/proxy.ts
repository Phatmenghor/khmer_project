import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookie-keys";
import { ROUTE_LOG_CONFIG } from "@/constants/app-resource/config/route-log-config";

const LOGIN_PATH = "/login";
const ADMIN_PATH = "/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const hasAdminToken = Boolean(
    request.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value
  );

  if (pathname.startsWith(ADMIN_PATH)) {
    if (!hasAdminToken) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.headers.set(ROUTE_LOG_CONFIG.HEADERS.PATHNAME, pathname);
  response.headers.set(ROUTE_LOG_CONFIG.HEADERS.TIMESTAMP, timestamp);
  response.headers.set(ROUTE_LOG_CONFIG.HEADERS.REQUEST_ID, requestId);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|public/|api/|.*\\..*).*)",
  ],
};

import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

const ACCESS_TOKEN_KEY = COOKIE_KEYS.ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = COOKIE_KEYS.REFRESH_TOKEN;
const ADMIN_ACCESS_TOKEN_KEY = COOKIE_KEYS.ADMIN_ACCESS_TOKEN;
const ADMIN_REFRESH_TOKEN_KEY = COOKIE_KEYS.ADMIN_REFRESH_TOKEN;

function getMaxAgeFromToken(
  token: string,
  fallbackSeconds: number
): number {
  try {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      if (remaining > 0) return remaining;
    }
  } catch {
    // fallback to default maxAge
  }
  return fallbackSeconds;
}

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = getMaxAgeFromToken(token, 365 * 24 * 60 * 60);
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function getToken(): string | undefined {
  return getCookie(ACCESS_TOKEN_KEY) as string | undefined;
}

export function storeToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60);
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function storeRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) return;
  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60);
  setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge, path: "/" });
}

export function getRefreshToken(): string | undefined {
  return getCookie(REFRESH_TOKEN_KEY) as string | undefined;
}

export function storeTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeToken(accessToken);
  storeRefreshToken(refreshToken);
}

export function clearToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY, { path: "/" });
}

export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY, { path: "/" });
}

export function clearClientTokens(): void {
  clearToken();
  clearRefreshToken();
}

export function storeAdminToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60);
  setCookie(ADMIN_ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function storeAdminRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) return;
  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60);
  setCookie(ADMIN_REFRESH_TOKEN_KEY, refreshToken, { maxAge, path: "/" });
}

export function storeAdminTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeAdminToken(accessToken);
  storeAdminRefreshToken(refreshToken);
}

export function getAdminToken(): string | undefined {
  return getCookie(ADMIN_ACCESS_TOKEN_KEY) as string | undefined;
}

export function getAdminRefreshToken(): string | undefined {
  return getCookie(ADMIN_REFRESH_TOKEN_KEY) as string | undefined;
}

export function clearAdminTokens(): void {
  deleteCookie(ADMIN_ACCESS_TOKEN_KEY, { path: "/" });
  deleteCookie(ADMIN_REFRESH_TOKEN_KEY, { path: "/" });
}

export function clearAllTokens(): void {
  clearClientTokens();
  clearAdminTokens();
}

export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return !!token;
}

export function hasRefreshToken(): boolean {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return !!token;
}

export function decodeToken(token: string): {
  sub?: string;
  userId?: string;
  userType?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getToken() || getAdminToken();
  if (!token) return true;
  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}


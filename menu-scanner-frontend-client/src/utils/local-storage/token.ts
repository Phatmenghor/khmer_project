import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

// Cookie names - use centralized constants
const ACCESS_TOKEN_KEY = COOKIE_KEYS.ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = COOKIE_KEYS.REFRESH_TOKEN;

/**
 * Calculate maxAge in seconds from a JWT token's exp claim.
 * Falls back to the provided default if decoding fails.
 */
function getMaxAgeFromToken(
  token: string,
  fallbackSeconds: number
): number {
  try {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      // Use the remaining time if it's positive, otherwise use fallback
      if (remaining > 0) return remaining;
    }
  } catch {
    // ignore decode errors
  }
  return fallbackSeconds;
}

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }

  const maxAge = getMaxAgeFromToken(token, 365 * 24 * 60 * 60);
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge });
}

export function getToken() {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return token;
}

/**
 * Store access token with expiry matching the JWT exp claim
 */
export function storeToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }

  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60); // fallback: 7 days
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge });
}

/**
 * Store refresh token with expiry matching the JWT exp claim
 */
export function storeRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) {
    return;
  }

  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60); // fallback: 30 days
  setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge });
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | undefined {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return token as string | undefined;
}

/**
 * Store both access and refresh tokens with expiry from JWT exp claims
 */
export function storeTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeToken(accessToken);
  storeRefreshToken(refreshToken);
}

/**
 * Logout the current user
 */
export function clearToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
}

/**
 * Clear refresh token
 */
export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Clear all authentication tokens
 */
export function clearAllTokens(): void {
  clearToken();
  clearRefreshToken();
}

// ─── Admin (BUSINESS_USER) token helpers ────────────────────────────────────

export function storeAdminToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60);
  setCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN, token, { maxAge });
}

export function storeAdminRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) return;
  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60);
  setCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN, refreshToken, { maxAge });
}

export function storeAdminTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeAdminToken(accessToken);
  storeAdminRefreshToken(refreshToken);
}

export function getAdminToken(): string | undefined {
  return getCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN) as string | undefined;
}

export function getAdminRefreshToken(): string | undefined {
  return getCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN) as string | undefined;
}

export function clearAdminTokens(): void {
  deleteCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
  deleteCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return !!token;
}

/**
 * Check if refresh token exists
 */
export function hasRefreshToken(): boolean {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return !!token;
}

/**
 * Decode JWT token to get payload (without verification)
 */
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

/**
 * Check if access token is expired or about to expire
 * @param bufferSeconds - seconds before actual expiry to consider as expired (default 5 minutes)
 */
export function isTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}

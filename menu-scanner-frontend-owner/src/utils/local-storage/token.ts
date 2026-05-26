import { deleteCookie, getCookie, setCookie } from "cookies-next";

const ACCESS_TOKEN_KEY = "platform-auth-token";
const REFRESH_TOKEN_KEY = "platform-auth-refresh-token";

function getMaxAgeFromToken(token: string, fallbackSeconds: number): number {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return fallbackSeconds;
    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (decoded?.exp) {
      const remaining = decoded.exp - Math.floor(Date.now() / 1000);
      if (remaining > 0) return remaining;
    }
  } catch {}
  return fallbackSeconds;
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

export function storeTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeToken(accessToken);
  storeRefreshToken(refreshToken);
}

export function getToken(): string | undefined {
  return getCookie(ACCESS_TOKEN_KEY) as string | undefined;
}

export function getRefreshToken(): string | undefined {
  return getCookie(REFRESH_TOKEN_KEY) as string | undefined;
}

export function clearToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
}

export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function clearAllTokens(): void {
  clearToken();
  clearRefreshToken();
}

export function isAuthenticated(): boolean {
  return !!getCookie(ACCESS_TOKEN_KEY);
}

// utils/local-storage/userInfo.ts
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

const USER_INFO_KEY = COOKIE_KEYS.USER_INFO;

export function storeUserInfo(userInfo: any): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(USER_INFO_KEY, JSON.stringify(userInfo), {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}

export function getUserInfo() {
  const userInfo = getCookie(USER_INFO_KEY);

  if (userInfo) {
    try {
      return JSON.parse(userInfo as string);
    } catch (error) {
      console.error("Failed to parse user info:", error);
      return null;
    }
  }

  return null;
}

export function clearUserInfo(): void {
  deleteCookie(USER_INFO_KEY);
}

// ─── Admin (BUSINESS_USER) userInfo helpers ──────────────────────────────────

export function storeAdminUserInfo(userInfo: any): void {
  if (typeof window === "undefined") return;
  setCookie(COOKIE_KEYS.ADMIN_USER_INFO, JSON.stringify(userInfo), {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}

export function getAdminUserInfo() {
  const userInfo = getCookie(COOKIE_KEYS.ADMIN_USER_INFO);
  if (userInfo) {
    try {
      return JSON.parse(userInfo as string);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearAdminUserInfo(): void {
  deleteCookie(COOKIE_KEYS.ADMIN_USER_INFO);
}

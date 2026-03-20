// utils/local-storage/userInfo.ts
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

// Native browser cookie API (works reliably on client-side)
function setNativeCookie(name: string, value: string): void {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
  console.log(`## [COOKIE] Set ${name}`);
}

function deleteNativeCookie(name: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  console.log(`## [COOKIE] Deleted ${name}`);
}

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
  setNativeCookie(COOKIE_KEYS.ADMIN_USER_INFO, JSON.stringify(userInfo));
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
  deleteNativeCookie(COOKIE_KEYS.ADMIN_USER_INFO);
}

import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";
import type { UserAuthResponseModel } from "@/redux/features/auth/store/models/response/auth-resposne";

function setNativeCookie(name: string, value: string): void {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
}

function deleteNativeCookie(name: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

const USER_INFO_KEY = COOKIE_KEYS.USER_INFO;

export function storeUserInfo(userInfo: UserAuthResponseModel | Record<string, unknown> | undefined): void {
  if (typeof window === "undefined" || !userInfo) {
    return;
  }

  setCookie(USER_INFO_KEY, JSON.stringify(userInfo), {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}

export function getUserInfo(): UserAuthResponseModel | null {
  const userInfo = getCookie(USER_INFO_KEY);

  if (userInfo) {
    try {
      return JSON.parse(userInfo as string);
    } catch {
      return null;
    }
  }

  return null;
}

export function clearUserInfo(): void {
  deleteCookie(USER_INFO_KEY);
}

export function storeAdminUserInfo(userInfo: Record<string, unknown>): void {
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

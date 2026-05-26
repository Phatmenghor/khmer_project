import { UserAuthResponseModel } from "@/redux/features/auth/store/models/response/auth-resposne";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const USER_INFO_KEY = "platform-user-info";

export function storeUserInfo(user: UserAuthResponseModel | undefined): void {
  if (typeof window === "undefined" || !user) return;
  setCookie(USER_INFO_KEY, JSON.stringify(user), {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export function getUserInfo(): UserAuthResponseModel | null {
  const value = getCookie(USER_INFO_KEY);
  try {
    return value ? JSON.parse(value as string) : null;
  } catch {
    return null;
  }
}

export function clearUserInfo(): void {
  deleteCookie(USER_INFO_KEY);
}

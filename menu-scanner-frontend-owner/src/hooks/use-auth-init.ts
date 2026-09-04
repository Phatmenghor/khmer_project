"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setUser,
  setAuthReady,
} from "@/features/auth/store/slice/auth-slice";
import { selectAuthReady, selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

function getCookieValue(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function useAuthInit() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const authReady = useAppSelector(selectAuthReady);
  const currentUser = useAppSelector(selectUser);
  const prevIsAdminRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/login") {
      if (!authReady) {
        dispatch(setAuthReady());
      }
      return;
    }

    const isAdminRoute = pathname?.startsWith("/admin") === true;

    // Skip redundant syncs if auth is ready and user is navigating within the same zone
    if (authReady && prevIsAdminRef.current === isAdminRoute) {
      return;
    }
    prevIsAdminRef.current = isAdminRoute;

    const tokenCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_ACCESS_TOKEN : COOKIE_KEYS.ACCESS_TOKEN;
    const userInfoCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO;

    const token = getCookieValue(tokenCookieName);
    const userInfoStr = getCookieValue(userInfoCookieName);

    let userInfo: any = null;
    if (userInfoStr) {
      try {
        userInfo = JSON.parse(decodeURIComponent(userInfoStr));
      } catch {
        userInfo = null;
      }
    }

    if (token && userInfo) {
      const currentId = (currentUser as any)?.userId || (currentUser as any)?.id;
      const targetId = userInfo?.userId || userInfo?.id;

      if (!currentUser || (targetId && currentId !== targetId)) {
        dispatch(setUser(userInfo));
      }
      if (!authReady) {
        dispatch(setAuthReady());
      }
    } else {
      if (currentUser) {
        dispatch(setUser(null));
      }
      if (!authReady) {
        dispatch(setAuthReady());
      }
    }
  }, [pathname, dispatch, authReady, currentUser]);

  return { authReady };
}

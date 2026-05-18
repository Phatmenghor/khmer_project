"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setUser,
  setAuthReady,
} from "@/features/auth/store/slice/auth-slice";
import { selectAuthReady } from "@/features/auth/store/selectors/auth-selectors";
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

  useEffect(() => {

    const isAdminRoute = pathname?.startsWith("/admin") === true;


    const tokenCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_ACCESS_TOKEN : COOKIE_KEYS.ACCESS_TOKEN;
    const userInfoCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO;

    const token = getCookieValue(tokenCookieName);
    const userInfoStr = getCookieValue(userInfoCookieName);
    const userInfo = userInfoStr ? JSON.parse(decodeURIComponent(userInfoStr)) : null;


    if (token && userInfo) {
      dispatch(setUser(userInfo));
      dispatch(setAuthReady());
    } else {

      if (!authReady) {
        dispatch(setAuthReady());
      }
    }
  }, [pathname, dispatch, authReady]);

  return { authReady };
}

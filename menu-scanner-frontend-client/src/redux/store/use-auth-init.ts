"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { selectAuthReady } from "@/redux/features/auth/store/selectors/auth-selectors";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

// Helper to read cookies directly from browser (works on client-side refresh)
function getCookieValue(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Simplified auth initialization hook
 * - Runs on every route change
 * - Properly detects which tokens to read based on current route
 * - Restores auth state from cookies to Redux
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const authReady = useAppSelector(selectAuthReady);

  useEffect(() => {
    // Detect if we're on an admin route
    const isAdminRoute = pathname?.startsWith("/admin") === true;

    // Read cookies directly from browser (not using cookies-next due to client-side refresh issues)
    const tokenCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_ACCESS_TOKEN : COOKIE_KEYS.ACCESS_TOKEN;
    const userInfoCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO;

    const token = getCookieValue(tokenCookieName);
    const userInfoStr = getCookieValue(userInfoCookieName);
    const userInfo = userInfoStr ? JSON.parse(decodeURIComponent(userInfoStr)) : null;

    // If we have both token and user info, restore to Redux
    // Profile will be auto-fetched by middleware when setUser is dispatched
    if (token && userInfo) {
      dispatch(setUser(userInfo)); // This triggers profile auto-fetch via middleware
      dispatch(setAuthReady());
    } else {
      // No auth data, mark as ready (not authenticated)
      if (!authReady) {
        dispatch(setAuthReady());
      }
    }
  }, [pathname, dispatch, authReady]);

  return { authReady };
}

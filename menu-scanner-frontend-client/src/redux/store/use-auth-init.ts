"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { selectAuthReady, selectProfile } from "@/redux/features/auth/store/selectors/auth-selectors";
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
  const profile = useAppSelector(selectProfile);
  const profileFetchedRef = useRef(false);

  // Step 1: Initialize auth from cookies
  useEffect(() => {
    // Detect if we're on an admin route
    const isAdminRoute = pathname?.startsWith("/admin") === true;

    console.log("## [AUTH INIT] Route:", pathname, "| isAdminRoute:", isAdminRoute);

    // Read cookies directly from browser (not using cookies-next due to client-side refresh issues)
    const tokenCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_ACCESS_TOKEN : COOKIE_KEYS.ACCESS_TOKEN;
    const userInfoCookieName = isAdminRoute ? COOKIE_KEYS.ADMIN_USER_INFO : COOKIE_KEYS.USER_INFO;

    const token = getCookieValue(tokenCookieName);
    const userInfoStr = getCookieValue(userInfoCookieName);
    const userInfo = userInfoStr ? JSON.parse(decodeURIComponent(userInfoStr)) : null;

    console.log("## [AUTH INIT] Cookie check:", {
      isAdminRoute,
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      userType: userInfo?.userType,
    });

    // If we have both token and user info, restore to Redux
    if (token && userInfo) {
      console.log("## [AUTH INIT] ✓ Restoring auth from cookies");
      dispatch(setUser(userInfo));
      dispatch(setAuthReady());
    } else {
      // No auth data, mark as ready (not authenticated)
      if (!authReady) {
        console.log("## [AUTH INIT] ⚠ No auth data found");
        dispatch(setAuthReady());
      }
    }
  }, [pathname, dispatch, authReady]);

  // Step 2: Fetch profile only once after auth is ready and if not already loaded
  useEffect(() => {
    if (authReady && !profile && !profileFetchedRef.current) {
      console.log("## [AUTH INIT] Fetching profile...");
      profileFetchedRef.current = true;
      dispatch(getProfileService()).catch((err) => {
        console.warn("⚠ Profile fetch failed:", err);
        profileFetchedRef.current = false; // Reset flag on error to allow retry
      });
    }
  }, [authReady, profile, dispatch]);

  return { authReady };
}

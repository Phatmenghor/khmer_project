"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { getToken, getAdminToken } from "@/utils/local-storage/token";
import { getUserInfo, getAdminUserInfo } from "@/utils/local-storage/userInfo";
import { selectAuthReady } from "@/redux/features/auth/store/selectors/auth-selectors";

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

    console.log("## [AUTH INIT] Route:", pathname, "| isAdminRoute:", isAdminRoute);

    // Get the correct token pair for this route
    const token = isAdminRoute ? getAdminToken() : getToken();
    const userInfo = isAdminRoute ? getAdminUserInfo() : getUserInfo();

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

      // Try to fetch fresh profile (optional)
      dispatch(getProfileService()).catch((err) => {
        console.warn("⚠ Profile fetch failed:", err);
        // Don't block auth on profile fetch failure
      });
    } else {
      // No auth data, mark as ready (not authenticated)
      if (!authReady) {
        console.log("## [AUTH INIT] ⚠ No auth data found");
        dispatch(setAuthReady());
      }
    }
  }, [pathname, dispatch, authReady]);

  return { authReady };
}

// hooks/use-auth-init.ts
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { getToken, getAdminToken } from "@/utils/local-storage/token";
import { getUserInfo, getAdminUserInfo } from "@/utils/local-storage/userInfo";

export function useAuthInit() {
  const { dispatch, isAuthenticated, authReady } = useAuthState();
  const isInitialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only run once on mount
    if (isInitialized.current) return;
    isInitialized.current = true;

    const isAdminRoute = pathname?.startsWith("/admin") ?? false;

    const initAuth = async () => {
      // Pick the correct cookie pair based on the current route
      const token = isAdminRoute ? getAdminToken() : getToken();
      const userInfo = isAdminRoute ? getAdminUserInfo() : getUserInfo();

      if (token && userInfo) {
        // Restore user to Redux state (this also sets authReady = true)
        dispatch(setUser(userInfo));

        // Fetch fresh profile data
        try {
          await dispatch(getProfileService()).unwrap();
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      } else {
        // No token / no user info — mark auth as ready (not authenticated)
        dispatch(setAuthReady());
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // pathname is only used on first mount — isInitialized.current prevents re-runs

  return { isAuthenticated, authReady };
}

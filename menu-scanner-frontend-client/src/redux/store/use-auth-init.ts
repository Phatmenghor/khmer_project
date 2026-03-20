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
  const lastPathnameRef = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only re-initialize if pathname changed (prevents duplicate work on re-renders)
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    const isAdminRoute = pathname?.startsWith("/admin") ?? false;

    const initAuth = async () => {
      console.log("🔐 Initializing auth for route:", pathname, { isAdminRoute });

      // Pick the correct cookie pair based on the current route
      const token = isAdminRoute ? getAdminToken() : getToken();
      const userInfo = isAdminRoute ? getAdminUserInfo() : getUserInfo();

      console.log("📦 Found auth data:", {
        hasToken: !!token,
        hasUserInfo: !!userInfo,
        isAdminRoute,
        userType: userInfo?.userType,
      });

      if (token && userInfo) {
        // Restore user to Redux state (this also sets authReady = true)
        console.log("✓ Restoring user from cookies:", userInfo.userType);
        dispatch(setUser(userInfo));

        // Fetch fresh profile data
        try {
          await dispatch(getProfileService()).unwrap();
          console.log("✓ Profile fetched successfully");
        } catch (error) {
          console.error("⚠ Failed to fetch profile:", error);
          // Still mark as authenticated even if profile fetch fails
        }
      } else {
        // No token / no user info — mark auth as ready (not authenticated)
        console.log("⚠ No auth data found, marking auth as ready");
        dispatch(setAuthReady());
      }
    };

    initAuth();
  }, [dispatch, pathname]); // pathname MUST be in deps to re-init on route change

  return { isAuthenticated, authReady };
}

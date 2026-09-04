"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store";
import { logoutService } from "@/features/auth/store/thunks/social-auth-thunks";
import { logout } from "@/features/auth/store/slice/auth-slice";
import { clearAdminTokens, clearClientTokens } from "@/utils/local-storage/token";
import { clearAdminUserInfo, clearUserInfo } from "@/utils/local-storage/userInfo";
import { ROUTES } from "@/constants/app-routes/routes";

export function useLogout() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const isAdminPage = typeof window !== "undefined" && (pathname.startsWith("/admin") || window.location.pathname.startsWith("/admin"));

    // Step 1: Instantly purge local tokens from storage & reset Redux state BEFORE API call to prevent concurrent auto-refresh
    if (isAdminPage) {
      clearAdminTokens();
      clearAdminUserInfo();
    } else {
      clearClientTokens();
      clearUserInfo();
    }
    dispatch(logout());

    // Step 2: Inform backend to revoke server session & blacklist token
    try {
      await dispatch(logoutService()).unwrap();
    } catch {
      // Ignore network errors during logout
    } finally {
      setIsLoggingOut(false);

      // Step 3: Redirect to the corresponding login page per routed zone
      const redirectTarget = ROUTES.AUTH.LOGIN;
      if (typeof window !== "undefined") {
        window.location.href = redirectTarget;
      }
    }
  }, [dispatch, pathname, isLoggingOut]);

  return { logout: handleLogout, isLoggingOut };
}


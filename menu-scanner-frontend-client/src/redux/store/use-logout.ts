"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
  selectIsAdmin,
  selectUserType,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { logoutService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { logout } from "@/redux/features/auth/store/slice/auth-slice";
import { ROUTES } from "@/constants/app-routes/routes";

/**
 * Custom hook for handling user logout
 * Clears auth state and redirects to appropriate login page based on user type
 */
export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const userType = useAppSelector(selectUserType);

  const handleLogout = useCallback(async () => {
    try {
      console.log("📤 Logging out user...", { userType, isAdmin });

      // Call logout API to invalidate session on server
      await dispatch(logoutService()).unwrap();

      console.log("✓ Logout successful");
    } catch (error) {
      // Even if API call fails, clear local state
      console.error("✗ Logout API failed, clearing local state:", error);
      dispatch(logout());
    } finally {
      // Redirect to login page based on user type
      const redirectUrl = isAdmin ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.LOGIN;
      console.log("📍 Redirecting to:", redirectUrl);
      router.push(redirectUrl);
    }
  }, [dispatch, router, isAdmin, userType]);

  return { logout: handleLogout };
}

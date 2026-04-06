"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsAdmin,
  selectUserType,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { logoutService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { logout } from "@/redux/features/auth/store/slice/auth-slice";
import { ROUTES } from "@/constants/app-routes/routes";

/**
 * Custom hook for handling user logout
 * - For public pages: refreshes current page to clear auth data
 * - For admin pages: redirects to admin login
 * - For auth pages: redirects to customer login
 */
export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const userType = useAppSelector(selectUserType);

  const handleLogout = useCallback(async () => {
    try {
      console.log("📤 Logging out user...", { userType, isAdmin, currentPath: pathname });

      // Call logout API to invalidate session on server
      await dispatch(logoutService()).unwrap();

      console.log("✓ Logout successful");
    } catch (error) {
      // Even if API call fails, clear local state
      console.error("✗ Logout API failed, clearing local state:", error);
      dispatch(logout());
    } finally {
      // Determine redirect behavior based on current page
      const isPublicPage = ["/", "/products", "/categories", "/brands", "/promotions", "/favorites", "/cart"].some(
        (path) => pathname === path || pathname.startsWith(path + "?")
      );

      if (isPublicPage) {
        // For public pages, just refresh to clear auth state
        console.log("🔄 Refreshing public page after logout");
        window.location.reload();
      } else {
        // For admin or auth pages, redirect to login
        const redirectUrl = isAdmin ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.LOGIN;
        console.log("📍 Redirecting to:", redirectUrl);
        router.push(redirectUrl);
      }
    }
  }, [dispatch, router, isAdmin, userType, pathname]);

  return { logout: handleLogout };
}

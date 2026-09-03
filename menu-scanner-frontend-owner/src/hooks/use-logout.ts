"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectIsAdmin,
  selectUserType,
} from "@/features/auth/store/selectors/auth-selectors";
import { logoutService } from "@/features/auth/store/thunks/social-auth-thunks";
import { logout } from "@/features/auth/store/slice/auth-slice";
import { ROUTES } from "@/constants/app-routes/routes";

export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const userType = useAppSelector(selectUserType);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await dispatch(logoutService()).unwrap();
    } catch {
      // Purge local auth tokens even if network fails
    } finally {
      dispatch(logout());
      setIsLoggingOut(false);

      const isAdminPage = pathname.startsWith("/admin");
      if (!isAdminPage) {
        window.location.href = ROUTES.HOME;
      } else {
        router.push(ROUTES.HOME);
      }
    }
  }, [dispatch, router, isAdmin, userType, pathname, isLoggingOut]);

  return { logout: handleLogout, isLoggingOut };
}

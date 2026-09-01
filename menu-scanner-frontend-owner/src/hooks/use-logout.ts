"use client";

import { useCallback } from "react";
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

  const handleLogout = useCallback(async () => {
    try {

      await dispatch(logoutService()).unwrap();

    } catch (error) {

      dispatch(logout());
    } finally {

      const isPublicPage = ["/", "/products", "/categories", "/brands", "/promotions", "/favorites", "/cart"].some(
        (path) => pathname === path || pathname.startsWith(path + "?")
      );

      if (isPublicPage) {

        window.location.reload();
      } else {

        const redirectUrl = isAdmin ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.LOGIN;
        router.push(redirectUrl);
      }
    }
  }, [dispatch, router, isAdmin, userType, pathname]);

  return { logout: handleLogout };
}

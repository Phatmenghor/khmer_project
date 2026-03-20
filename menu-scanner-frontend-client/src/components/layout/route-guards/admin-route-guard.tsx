"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store/hooks";
import {
  selectIsAuthenticated,
  selectAuthReady,
  selectIsAdmin,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { ROUTES } from "@/constants/app-routes/routes";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard - Protects admin routes from unauthorized access
 * Redirects non-admin users back to login
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const authReady = useAppSelector(selectAuthReady);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  useEffect(() => {
    if (!authReady) return; // Wait for auth to initialize

    // Redirect if not authenticated OR not an admin
    if (!isAuthenticated || !isAdmin) {
      console.warn(
        "🚫 Unauthorized admin access. Redirecting to login.",
        {
          isAuthenticated,
          isAdmin,
        }
      );
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [authReady, isAuthenticated, isAdmin, router]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Unauthorized Access</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

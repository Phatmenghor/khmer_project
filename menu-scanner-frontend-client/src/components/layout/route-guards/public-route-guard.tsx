"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import {
  selectIsAuthenticated,
  selectAuthReady,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { ROUTES } from "@/constants/app-routes/routes";

interface PublicRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, redirects unauthenticated users to login
}

/**
 * PublicRouteGuard - Protects public routes
 * Optionally redirects unauthenticated users to login
 */
export function PublicRouteGuard({
  children,
  requireAuth = false,
}: PublicRouteGuardProps) {
  const router = useRouter();
  const authReady = useAppSelector(selectAuthReady);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!authReady) return; // Wait for auth to initialize

    // Redirect if auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.warn("🚫 Unauthorized access. Redirecting to login.", {
        requireAuth,
        isAuthenticated,
      });
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [authReady, isAuthenticated, requireAuth, router]);

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

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Login Required</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

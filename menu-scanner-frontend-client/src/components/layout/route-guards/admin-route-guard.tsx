"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import {
  selectAuthReady,
  selectIsAuthenticated,
  selectUserType,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { ROUTES } from "@/constants/app-routes/routes";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard V2 - Simplified version
 * Protects admin routes with clear, simple logic
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const authReady = useAppSelector(selectAuthReady);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userType = useAppSelector(selectUserType);
  const [showContent, setShowContent] = useState(false);

  const isAdmin = userType === "BUSINESS_USER";

  useEffect(() => {
    // Debug redux state
    console.log("## [ADMIN GUARD] Redux state:", {
      authReady,
      isAuthenticated,
      userType,
      isAdmin,
    });

    // Still loading auth
    if (!authReady) {
      console.log("## [ADMIN GUARD] ⏳ Auth still initializing, waiting...");
      setShowContent(false);
      return;
    }

    // Not authenticated
    if (!isAuthenticated) {
      console.log("## [ADMIN GUARD] ❌ Not authenticated, redirecting to login");
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    // Authenticated but not admin
    if (!isAdmin) {
      console.log(
        "## [ADMIN GUARD] ❌ Not admin (userType: " + userType + "), redirecting to login"
      );
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    // All checks passed
    console.log("## [ADMIN GUARD] ✓ Access granted!");
    setShowContent(true);
  }, [authReady, isAuthenticated, userType, isAdmin, router]);

  // Still loading
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and admin
  return <>{showContent ? children : null}</>;
}

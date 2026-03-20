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

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

/**
 * PublicRouteGuard - Protects public routes from admin access
 * Allows CUSTOMER users and unauthenticated users
 * Blocks BUSINESS_USER (admin) accounts from public pages
 */
export function PublicRouteGuard({ children }: PublicRouteGuardProps) {
  const router = useRouter();
  const authReady = useAppSelector(selectAuthReady);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userType = useAppSelector(selectUserType);
  const [showContent, setShowContent] = useState(false);

  const isAdmin = userType === "BUSINESS_USER";

  useEffect(() => {
    console.log("## [PUBLIC GUARD] Checking access:", {
      authReady,
      isAuthenticated,
      userType,
      isAdmin,
    });

    // Still loading auth
    if (!authReady) {
      console.log("## [PUBLIC GUARD] Auth still initializing...");
      setShowContent(false);
      return;
    }

    // Block admin/business users from public pages
    if (isAdmin) {
      console.log("## [PUBLIC GUARD] ❌ Admin user blocked, redirecting to /admin");
      router.replace(ROUTES.ADMIN.DASHBOARD);
      return;
    }

    // Allow customers and unauthenticated users
    console.log("## [PUBLIC GUARD] ✓ Access granted");
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

  // Block admin users
  if (isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Admin Access Not Allowed</p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show content for customers and unauthenticated users
  return <>{showContent ? children : null}</>;
}

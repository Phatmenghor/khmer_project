"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import {
  selectAuthReady,
  selectUserType,
} from "@/redux/features/auth/store/selectors/auth-selectors";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard - Checks if user is admin (BUSINESS_USER)
 * Middleware handles auth/redirect, this only checks user type
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const authReady = useAppSelector(selectAuthReady);
  const userType = useAppSelector(selectUserType);
  const [showContent, setShowContent] = useState(false);

  const isAdmin = userType === "BUSINESS_USER";

  useEffect(() => {
    // Wait for auth to be ready
    if (!authReady) {
      setShowContent(false);
      return;
    }

    // Show content only if admin
    if (isAdmin) {
      setShowContent(true);
    } else {
      // Not admin - show error (middleware should prevent this)
      setShowContent(false);
    }
  }, [authReady, isAdmin]);

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

  // Show content if admin
  return <>{showContent ? children : null}</>;
}

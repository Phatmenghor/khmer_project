"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import {
  selectAuthReady,
  selectUserType,
} from "@/redux/features/auth/store/selectors/auth-selectors";

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

/**
 * PublicRouteGuard - Allows access to public pages
 * Middleware handles auth checks, this just renders content
 */
export function PublicRouteGuard({ children }: PublicRouteGuardProps) {
  const authReady = useAppSelector(selectAuthReady);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content when auth is ready
    if (authReady) {
      setShowContent(true);
    }
  }, [authReady]);

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

  // Show content (public page accessible to all)
  return <>{showContent ? children : null}</>;
}

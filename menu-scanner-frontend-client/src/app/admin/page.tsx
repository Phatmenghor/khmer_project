"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { ROUTES } from "@/constants/app-routes/routes";

const AdminPage = () => {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return <div>AdminPage</div>;
};

export default AdminPage;

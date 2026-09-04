"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { RegisterModal } from "@/components/landing/register-modal";
import { LoginModal } from "@/components/landing/login-modal";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { selectProfile } from "@/features/auth/store/selectors/auth-selectors";
import { getBusinessProfileService } from "@/features/auth/store/thunks/auth-thunks";
import { PlanHistorySection } from "../(dashboard)/admin/profile/_components/plan-history-section";

import { SubscriptionHistorySkeleton } from "@/components/shared/skeletons";

export default function PublicBusinessSubscriptionPage() {
  const dispatch = useAppDispatch();
  const { accessToken, authReady } = useAuthState();
  const userProfile = useAppSelector(selectProfile);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (authReady && accessToken && !userProfile) {
      dispatch(getBusinessProfileService());
    }
  }, [authReady, accessToken, dispatch, userProfile]);

  if (!authReady) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-3 pb-6 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                My Subscription & Plans
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Manage your active plan features, subscription renewals, and billing history.
              </p>
            </div>
            <SubscriptionHistorySkeleton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-3 pb-6 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-5">
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              My Subscription & Plans
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Manage your active plan features, subscription renewals, and billing history.
            </p>
          </div>

          {/* Dedicated Subscription Overview & Plan History Section */}
          <PlanHistorySection userProfile={userProfile} />
        </div>
      </main>
      <Footer />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
    </>
  );
}

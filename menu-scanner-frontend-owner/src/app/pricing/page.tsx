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
import { useSubscriptionHistoryState } from "@/features/subscription/store/state/subscription-history-state";
import { fetchMySubscriptionSummaryService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { useRouter } from "next/navigation";
import { PlanUpgradePaymentModal } from "@/features/subscription/components/plan-upgrade-payment-modal";
import { SubscriptionHistorySkeleton } from "@/components/shared/skeletons";
import { useSubscriptionPlanState } from "@/features/master-data/store/state/subscription-plan-state";
import { fetchAllPublicSubscriptionPlansService } from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { SubscriptionPlanResponseModel } from "@/features/master-data/store/models/response/subscription-plan-response";
import { PricingCardItem } from "@/components/landing/pricing-card-item";
import { PricingSupportFooter } from "@/components/landing/pricing-support-footer";

export default function PricingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessToken, authReady } = useAuthState();
  const userProfile = useAppSelector(selectProfile);
  const { mySummary, dispatch: subDispatch } = useSubscriptionHistoryState();

  const { publicPlans, isFetchingPublic, dispatch: planDispatch } = useSubscriptionPlanState();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlanResponseModel | null>(null);

  useEffect(() => {
    if (authReady && accessToken) {
      if (!userProfile) dispatch(getBusinessProfileService());
      subDispatch(fetchMySubscriptionSummaryService());
    }
  }, [authReady, accessToken, dispatch, subDispatch, userProfile]);

  useEffect(() => {
    if (!publicPlans && !isFetchingPublic) {
      planDispatch(fetchAllPublicSubscriptionPlansService());
    }
  }, [publicPlans, isFetchingPublic, planDispatch]);

  const plans: SubscriptionPlanResponseModel[] = (publicPlans && publicPlans.length > 0)
    ? publicPlans.filter((p) => p.durationType !== "FREE_TRIAL")
    : [
        { id: "monthly", name: "1 Month", description: "Full platform access for 30 days", price: 29, durationType: "MONTHLY", periodLabel: "/ month", createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", status: "ACTIVE", activeSubscriptionsCount: 0 },
        { id: "six_months", name: "6 Months", description: "Save on 6-month commitment", price: 149, durationType: "SIX_MONTHS", periodLabel: "/ 6 months", createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", status: "ACTIVE", activeSubscriptionsCount: 0 },
        { id: "yearly", name: "1 Year", description: "Best value year-long access", price: 269, durationType: "YEARLY", periodLabel: "/ year", createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", status: "ACTIVE", activeSubscriptionsCount: 0 },
      ];

  const isLoadingPlans = isFetchingPublic && !publicPlans;
  const currentPlanName = mySummary?.planName || userProfile?.planName || "";

  const handleSelectPlan = (plan: SubscriptionPlanResponseModel) => {
    if (!accessToken) {
      setIsRegisterModalOpen(true);
      return;
    }
    setSelectedPlanForUpgrade(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen">
        <main className="pt-3 pb-12 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-5">
          {/* Header with Gradient Title */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-primary via-emerald-500 to-indigo-500 bg-clip-text text-transparent w-fit">
                Subscription & Upgrade Plans
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Choose the ideal subscription package to power your restaurant menu scanner & digital management features.
              </p>
            </div>
          </div>

          {/* Fully Responsive Compact Plans Grid */}
          {isLoadingPlans ? (
            <SubscriptionHistorySkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch pt-1">
              {plans.map((plan) => {
                const isCurrent =
                  currentPlanName.toLowerCase().includes(plan.name.toLowerCase()) ||
                  (plan.durationType === "FREE_TRIAL" && currentPlanName.toLowerCase().includes("trial"));

                const isPopular = plan.durationType === "MONTHLY" || plan.durationType === "YEARLY";

                return (
                  <PricingCardItem
                    key={plan.id || plan.name}
                    id={plan.id}
                    name={plan.name}
                    price={plan.price}
                    durationType={plan.durationType}
                    description={plan.description}
                    isCurrent={isCurrent}
                    isPopular={isPopular}
                    periodLabel={plan.periodLabel || "/ month"}
                    buttonText={accessToken ? "Upgrade Plan" : "Get Started"}
                    onSelect={() => handleSelectPlan(plan)}
                  />
                );
              })}
            </div>
          )}

          {/* Support Footer Bar */}
          <PricingSupportFooter />
        </main>

        <Footer />
      </div>

      {/* Modals */}
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

      <PlanUpgradePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlanForUpgrade}
        userProfile={userProfile}
        onSuccess={() => {
          subDispatch(fetchMySubscriptionSummaryService());
          dispatch(getBusinessProfileService());
        }}
      />
    </>
  );
}

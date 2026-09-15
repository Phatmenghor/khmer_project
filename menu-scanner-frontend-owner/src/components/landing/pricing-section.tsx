"use client";

import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { RegisterModal } from "./register-modal";
import { LoginModal } from "./login-modal";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useSubscriptionPlanState } from "@/features/master-data/store/state/subscription-plan-state";
import { fetchAllPublicSubscriptionPlansService } from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { PlanUpgradePaymentModal } from "@/features/subscription/components/plan-upgrade-payment-modal";
import { PricingCardItem } from "./pricing-card-item";
import { cn } from "@/lib/utils";

import { SubscriptionPlanResponseModel } from "@/features/master-data/store/models/response/subscription-plan-response";

export interface PlanData {
  id?: string;
  name: string;
  price: number;
  period: string;
  description: string;
  durationType?: string;
}

export function getDurationPeriodLabel(durationType?: string): string {
  switch (durationType) {
    case "FREE_TRIAL":
      return "/ 7 days";
    case "DAILY":
      return "/ day";
    case "WEEKLY":
      return "/ week";
    case "MONTHLY":
      return "/ month";
    case "SIX_MONTHS":
      return "/ 6 months";
    case "YEARLY":
      return "/ year";
    default:
      return "-";
  }
}

export function mapToPlanData(apiPlan: Partial<SubscriptionPlanResponseModel> | any): PlanData {
  return {
    id: apiPlan.id,
    name: apiPlan.name || "-",
    price: apiPlan.price ?? 0,
    period: apiPlan.period || getDurationPeriodLabel(apiPlan.durationType),
    description: apiPlan.description || "-",
    durationType: apiPlan.durationType || "-",
  };
}

interface PricingSectionProps {
  onSelectPlan?: (plan: PlanData) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);

  const { isLoggedIn, profile } = useAuthState();
  const { publicPlans, isFetchingPublic, dispatch } = useSubscriptionPlanState();

  useEffect(() => {
    if (!publicPlans && !isFetchingPublic) {
      dispatch(fetchAllPublicSubscriptionPlansService()).catch(() => {});
    }
  }, [publicPlans, isFetchingPublic, dispatch]);

  const getDefaultPlans = (): PlanData[] => {
    return LANDING_CONFIG.pricing.plans.map((p) => mapToPlanData(p));
  };

  const plans: PlanData[] = (publicPlans && publicPlans.length > 0)
    ? publicPlans
        .filter((apiPlan) => apiPlan?.durationType !== "FREE_TRIAL")
        .map((apiPlan) => mapToPlanData(apiPlan))
    : getDefaultPlans();

  const isLoading = isFetchingPublic && !publicPlans;

  const handlePlanClick = (plan: PlanData) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }

    if (isLoggedIn) {
      setSelectedPlanForUpgrade({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        durationType: plan.durationType || "-",
        description: plan.description,
      });
      setIsPaymentModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  // Smart Responsive Grid Class based on plan count (e.g. 3 plans -> 3 cols centered)
  const getGridColsClass = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
    if (count === 3) return "grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
  };

  return (
    <section id="pricing" className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/50" />
        <div
          className="absolute top-0 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Transparent Pricing Plans
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                {LANDING_CONFIG.pricing.title}
              </span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              {LANDING_CONFIG.pricing.subtitle}
            </p>
            {LANDING_CONFIG.pricing.note && (
              <p className="text-xs text-primary leading-relaxed max-w-2xl mx-auto mt-1 font-bold">
                {LANDING_CONFIG.pricing.note}
              </p>
            )}
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="mt-3 text-xs text-slate-600 font-semibold">Loading subscription plans...</p>
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-5 sm:gap-6 items-stretch w-full", getGridColsClass(plans.length))}>
            {plans.map((plan, i) => (
              <FadeIn key={plan.id || plan.name} direction="up" delay={i * 120} className="h-full">
                <PricingCardItem
                  plan={plan}
                  buttonText={isLoggedIn ? "Upgrade Plan" : "Get Started Free"}
                  onSelect={() => handlePlanClick(plan)}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {!onSelectPlan && (
        <>
          <RegisterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLoginClick={() => {
              setIsModalOpen(false);
              setIsLoginModalOpen(true);
            }}
          />
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onRegisterClick={() => {
              setIsLoginModalOpen(false);
              setIsModalOpen(true);
            }}
          />
        </>
      )}

      <PlanUpgradePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlanForUpgrade}
        userProfile={profile}
      />
    </section>
  );
}

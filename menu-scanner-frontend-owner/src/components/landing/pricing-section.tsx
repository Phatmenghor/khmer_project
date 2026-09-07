"use client";

import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { RegisterModal } from "./register-modal";
import { LoginModal } from "./login-modal";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useSubscriptionPlanState } from "@/features/master-data/store/state/subscription-plan-state";
import { fetchAllPublicSubscriptionPlansService } from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { PricingCardItem } from "./pricing-card-item";

interface PricingSectionProps {
  onSelectPlan?: () => void;
}

interface PlanData {
  id?: string;
  name: string;
  price: string;
  period: string;
  description: string;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData>();

  const { publicPlans, isFetchingPublic, dispatch } = useSubscriptionPlanState();

  useEffect(() => {
    if (!publicPlans && !isFetchingPublic) {
      dispatch(fetchAllPublicSubscriptionPlansService());
    }
  }, [publicPlans, isFetchingPublic, dispatch]);

  const getDefaultPlans = () => {
    return LANDING_CONFIG.pricing.plans.map(
      ({ name, price, period, description, highlighted }) => ({
        id: undefined,
        name,
        price: `$${price}`,
        period,
        description,
        highlighted,
      })
    );
  };

  const plans = (publicPlans && publicPlans.length > 0)
    ? publicPlans
        .filter((apiPlan) => apiPlan.durationType !== "FREE_TRIAL")
        .map((apiPlan) => {
          const staticPlan = LANDING_CONFIG.pricing.plans.find(
            (p) => p.durationType === apiPlan.durationType
          );
          const period = apiPlan.periodLabel || "/ month";

          return {
            id: apiPlan.id,
            name: staticPlan?.name || apiPlan.name || "Plan",
            price: `$${apiPlan.price}`,
            period,
            description: staticPlan?.description || apiPlan.description || "",
            highlighted: staticPlan?.highlighted || apiPlan.durationType === "MONTHLY" || apiPlan.durationType === "YEARLY",
            durationType: apiPlan.durationType,
          };
        })
    : getDefaultPlans().map((p) => ({ ...p, durationType: "MONTHLY" }));

  const isLoading = isFetchingPublic && !publicPlans;

  const handlePlanClick = (plan: PlanData) => {
    if (onSelectPlan) {
      onSelectPlan();
    } else {
      setSelectedPlan(plan);
      setIsModalOpen(true);
    }
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
          <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 items-stretch">
            {plans.map(
              ({ id, name, price, period, description, highlighted, durationType }, i) => {
                const planData: PlanData = { id, name, price, period, description };
                return (
                  <FadeIn key={name} direction="up" delay={i * 120}>
                    <PricingCardItem
                      id={id}
                      name={name}
                      price={price}
                      durationType={durationType}
                      description={description}
                      isPopular={highlighted}
                      periodLabel={period}
                      buttonText="Get Started Free"
                      onSelect={() => handlePlanClick(planData)}
                    />
                  </FadeIn>
                );
              }
            )}
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
    </section>
  );
}

"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG, ALL_PLATFORM_FEATURES } from "@/constants/landing-config";
import { RegisterModal } from "./register-modal";
import { useState, useEffect } from "react";
import { axiosClient } from "@/utils/axios";

interface PlanData {
  id?: string;
  name: string;
  price: string;
  period: string;
  description: string;
}

interface SubscriptionPlanResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  durationType: string;
  status: string;
}

export default function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData>();
  const [plans, setPlans] = useState<(PlanData & { features?: string[]; highlighted?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosClient.get<{ data: SubscriptionPlanResponse[] }>(
          "/api/v1/public/subscription-plans"
        );
        const fetchedPlans = response.data.data || [];

        // Map API response to display format. Names/prices come from the
        // API (source of truth for billing), but copy and features are
        // driven entirely by LANDING_CONFIG so every plan shows the same
        // feature list ('all features on every plan').
        const displayPlans = fetchedPlans.map((apiPlan) => {
          const staticPlan = LANDING_CONFIG.pricing.plans.find(
            p => p.durationType === apiPlan.durationType
          );
          const period = getPeriodLabel(apiPlan.durationType);

          return {
            id: apiPlan.id,
            name: staticPlan?.name || apiPlan.name || "Plan",
            price: `$${apiPlan.price}`,
            period,
            description: staticPlan?.description || apiPlan.description || "",
            // Always the universal feature list — fallback guarantees
            // every plan shows the same features even if durationType
            // matching fails.
            features: ALL_PLATFORM_FEATURES,
            highlighted: staticPlan?.highlighted || false,
          };
        });

        setPlans(displayPlans);
      } catch (error) {
        // Fallback: display static plans without IDs (user will need API to work for registration)
        setPlans(getDefaultPlans());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPeriodLabel = (durationType: string): string => {
    const typeMap: { [key: string]: string } = {
      DAILY: "/ day",
      WEEKLY: "/ week",
      MONTHLY: "/ month",
      YEARLY: "/ year",
    };
    return typeMap[durationType] || "/ month";
  };

  const getDefaultPlans = () => {
    // Return static plans without IDs (API must be working for actual registration with plan)
    return LANDING_CONFIG.pricing.plans.map(({ name, price, period, description, features, highlighted }) => ({
      name,
      price: `$${price}`,
      period,
      description,
      features,
      highlighted,
    }));
  };

  const handlePlanClick = (plan: PlanData) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <FadeIn direction="up">
          <div className="text-center mb-11">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {LANDING_CONFIG.pricing.title}
              </span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.pricing.subtitle}
            </p>
            {LANDING_CONFIG.pricing.note && (
              <p className="text-xs text-primary leading-relaxed max-w-3xl mx-auto mt-3 font-semibold">
                {LANDING_CONFIG.pricing.note}
              </p>
            )}
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block w-5 h-5 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-3 text-slate-600">Loading pricing plans...</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4 mt-11 items-start">
            {plans.map(({ id, name, price, period, description, features = [], highlighted = false }, i) => {
              const planData: PlanData = { id, name, price, period, description };
              return (
              <FadeIn key={name} direction="up" delay={i * 140}>
              <Card
                className={cn(
                  "relative border-2 transition-all duration-300 flex flex-col h-full group",
                  highlighted
                    ? "border-primary bg-gradient-to-br from-primary/8 via-primary/3 to-primary/5 shadow-2xl hover:shadow-3xl"
                    : "border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-primary/40 hover:shadow-xl"
                )}
              >
                {/* Animated bg dot */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-11 -mt-11 pointer-events-none"></div>

                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="text-xs px-4 py-1 bg-gradient-to-r from-primary to-primary/90 text-white border-0 shadow-lg font-bold whitespace-nowrap rounded-full">
                      🌟 Most Popular
                    </div>
                  </div>
                )}


                {/* Header */}
                <div className={cn(
                  "px-5 pb-5 relative z-10",
                  highlighted ? "bg-gradient-to-r from-primary/10 to-transparent pt-11" : "pt-8"
                )}>
                  <h3 className="text-xs font-bold text-slate-900 mb-3">{name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={cn("text-xs font-bold", highlighted ? "text-primary" : "text-slate-900")}>
                      {price}
                    </span>
                    {period && <span className="text-xs text-slate-700 font-semibold">{period}</span>}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{description}</p>
                </div>

                {/* Features */}
                <CardContent className="px-5 py-5 flex flex-col flex-1 relative z-10">
                  <ul className="space-y-3 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <CustomButton
                    onClick={() => handlePlanClick(planData)}
                    variant={highlighted ? "default" : "outline"}
                    className="w-full h-[36px] mt-5 font-semibold text-xs rounded-[12px] shadow-2xs transition-all cursor-pointer"
                  >
                    Get Started Free
                  </CustomButton>
                </CardContent>
              </Card>
            </FadeIn>
              );
              })}
            </div>
          )}
      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </section>
  );
}

"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";
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
        console.log("PricingSection - API response plans:", fetchedPlans);

        // Map API response to display format, matching by durationType with static config
        const displayPlans = fetchedPlans.map((apiPlan) => {
          // Find matching static plan by durationType
          const staticPlan = LANDING_CONFIG.pricing.plans.find(
            p => p.durationType === apiPlan.durationType
          );
          const period = getPeriodLabel(apiPlan.durationType);

          const mapped = {
            id: apiPlan.id,
            name: apiPlan.name || staticPlan?.name || "Plan",
            price: `$${apiPlan.price}`,
            period,
            description: apiPlan.description || staticPlan?.description || "",
            features: staticPlan?.features || [],
            highlighted: staticPlan?.highlighted || false,
          };
          console.log("PricingSection - Mapped plan:", mapped);
          return mapped;
        });

        console.log("PricingSection - Display plans:", displayPlans);
        setPlans(displayPlans);
      } catch (error) {
        console.warn("Failed to fetch subscription plans, using defaults", error);
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
    console.log("PricingSection - Plan selected:", plan);
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Simple Pricing</span>
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.pricing.subtitle}
            </p>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600">Loading pricing plans...</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-6 mt-16 items-start">
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-16 -mt-16 pointer-events-none"></div>

                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="text-sm px-6 py-2 bg-gradient-to-r from-primary to-primary/90 text-white border-0 shadow-lg font-bold whitespace-nowrap rounded-full">
                      🌟 Most Popular
                    </div>
                  </div>
                )}


                {/* Header */}
                <div className={cn(
                  "px-8 pb-8 relative z-10",
                  highlighted ? "bg-gradient-to-r from-primary/10 to-transparent pt-16" : "pt-12"
                )}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={cn("text-6xl font-bold", highlighted ? "text-primary" : "text-slate-900")}>
                      {price}
                    </span>
                    {period && <span className="text-lg text-slate-700 font-semibold">{period}</span>}
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{description}</p>
                </div>

                {/* Features */}
                <CardContent className="px-8 py-8 flex flex-col flex-1 relative z-10">
                  <ul className="space-y-4 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-scale-in" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanClick(planData)}
                    className={cn(
                      "w-full h-14 mt-8 font-bold text-base rounded-xl transition-all duration-300",
                      highlighted
                        ? "bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary/90"
                        : "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white"
                    )}
                  >
                    Get Started
                  </Button>
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

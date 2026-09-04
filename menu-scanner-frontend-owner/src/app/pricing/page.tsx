"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  HelpCircle,
  Flame,
  MessageCircle,
  Mail,
  Check,
} from "lucide-react";
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
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { axiosClient } from "@/utils/axios";
import { ALL_PLATFORM_FEATURES } from "@/constants/landing-config";
import { useRouter } from "next/navigation";
import { PlanUpgradePaymentModal } from "@/features/subscription/components/plan-upgrade-payment-modal";
import { SubscriptionHistorySkeleton } from "@/components/shared/skeletons";

interface ApiSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationType: string;
  status?: string;
}

let publicPlansPromise: Promise<ApiSubscriptionPlan[]> | null = null;

const fetchPublicSubscriptionPlans = (): Promise<ApiSubscriptionPlan[]> => {
  if (!publicPlansPromise) {
    publicPlansPromise = axiosClient
      .get<{ data: ApiSubscriptionPlan[] }>("/api/v1/public/subscription-plans")
      .then((res) => res.data.data || [])
      .catch((err) => {
        publicPlansPromise = null;
        throw err;
      });
  }
  return publicPlansPromise;
};

export default function PricingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessToken, authReady } = useAuthState();
  const userProfile = useAppSelector(selectProfile);
  const { mySummary, dispatch: subDispatch } = useSubscriptionHistoryState();

  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<ApiSubscriptionPlan | null>(null);

  useEffect(() => {
    if (authReady && accessToken) {
      if (!userProfile) dispatch(getBusinessProfileService());
      subDispatch(fetchMySubscriptionSummaryService());
    }
  }, [authReady, accessToken, dispatch, subDispatch, userProfile]);

  useEffect(() => {
    let isMounted = true;
    fetchPublicSubscriptionPlans()
      .then((data) => {
        if (isMounted) {
          setPlans(data);
          setIsLoadingPlans(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPlans([
            { id: "trial", name: "Free Trial", description: "7-day full access trial", price: 0, durationType: "FREE_TRIAL" },
            { id: "monthly", name: "1 Month", description: "Full platform access for 30 days", price: 29, durationType: "MONTHLY" },
            { id: "six_months", name: "6 Months", description: "Save on 6-month commitment", price: 149, durationType: "SIX_MONTHS" },
            { id: "yearly", name: "1 Year", description: "Best value year-long access", price: 269, durationType: "YEARLY" },
          ]);
          setIsLoadingPlans(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlanName = mySummary?.planName || userProfile?.planName || "";

  const formatPeriodLabel = (type: string) => {
    switch (type) {
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
        return "/ month";
    }
  };

  const getPlanIcon = (name: string, durationType: string) => {
    if (durationType === "FREE_TRIAL") return <Clock className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (durationType === "YEARLY") return <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />;
    if (durationType === "SIX_MONTHS") return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
    return <ShieldCheck className="w-4 h-4 text-primary shrink-0" />;
  };

  const handleSelectPlan = (plan: ApiSubscriptionPlan) => {
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
                  <Card
                    key={plan.id || plan.name}
                    className={cn(
                      "relative flex flex-col justify-between border transition-all duration-200 rounded-2xl overflow-hidden shadow-2xs group",
                      isPopular
                        ? "border-primary/80 bg-gradient-to-b from-primary/5 via-card to-card shadow-sm"
                        : "border-border/80 bg-card hover:border-border"
                    )}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-xl shadow-2xs flex items-center gap-1 z-10">
                        <Flame className="w-3 h-3 text-amber-300 fill-current" />
                        Popular
                      </div>
                    )}

                    <div>
                      <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-border/40 space-y-2">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(plan.name, plan.durationType)}
                          <CardTitle className="text-sm font-black text-foreground">
                            {plan.name}
                          </CardTitle>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-foreground">
                            ${plan.price}
                          </span>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {formatPeriodLabel(plan.durationType)}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>

                        {isCurrent && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ACTIVE PLAN
                            </span>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-3.5 sm:p-4 pt-3 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                          Included Features
                        </span>
                        <ul className="space-y-1.5">
                          {ALL_PLATFORM_FEATURES.map((feature, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground font-medium">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                              <span className="leading-tight text-[11px]">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>

                    <div className="p-3.5 sm:p-4 pt-0">
                      <CustomButton
                        variant={isCurrent ? "secondary" : isPopular ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full h-9 text-xs font-bold rounded-xl gap-1.5 transition-all cursor-pointer",
                          isCurrent
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                            : isPopular
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                            : "hover:bg-primary/10 hover:text-primary border-border/80"
                        )}
                        onClick={() => !isCurrent && handleSelectPlan(plan)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Plan</span>
                          </>
                        ) : (
                          <>
                            <span>{accessToken ? "Upgrade Plan" : "Get Started"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </CustomButton>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Support Footer Bar using CustomButton */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-center sm:text-left">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Need help choosing a plan or custom enterprise licensing?</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => { window.location.href = "mailto:support@menuscanner.com"; }}
                className="h-8 text-xs font-bold gap-1.5 border-border/60 bg-background text-primary hover:bg-muted"
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                <span>support@menuscanner.com</span>
              </CustomButton>
              <CustomButton
                variant="default"
                size="sm"
                onClick={() => { window.open("https://t.me/Hor_HOrz", "_blank"); }}
                className="h-8 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                icon={<MessageCircle className="w-3.5 h-3.5" />}
              >
                <span>Telegram Support</span>
              </CustomButton>
            </div>
          </div>
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
        }}
      />
    </>
  );
}

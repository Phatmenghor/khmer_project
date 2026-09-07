"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ALL_PLATFORM_FEATURES } from "@/constants/landing-config";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  Flame,
  Check,
} from "lucide-react";

interface PricingCardItemProps {
  id?: string;
  name: string;
  price: number | string;
  durationType: string;
  description: string;
  isCurrent?: boolean;
  isPopular?: boolean;
  periodLabel: string;
  buttonText?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export function PricingCardItem({
  name,
  price,
  durationType,
  description,
  isCurrent = false,
  isPopular = false,
  periodLabel,
  buttonText,
  onSelect,
  disabled = false,
}: PricingCardItemProps) {
  const getPlanIcon = (type: string) => {
    if (type === "FREE_TRIAL") return <Clock className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (type === "YEARLY") return <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />;
    if (type === "SIX_MONTHS") return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
    return <ShieldCheck className="w-4 h-4 text-primary shrink-0" />;
  };

  const formattedPrice = typeof price === "number" ? `$${price}` : price.startsWith("$") ? price : `$${price}`;

  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between border-2 transition-all duration-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 group h-full",
        isPopular
          ? "border-primary/80 bg-gradient-to-b from-primary/10 via-card to-card shadow-sm"
          : "border-border/80 bg-card hover:border-primary/50"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      <div>
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            {getPlanIcon(durationType)}
            <CardTitle className="text-base font-black text-foreground">{name}</CardTitle>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground tracking-tight">{formattedPrice}</span>
            <span className="text-xs font-bold text-muted-foreground">{periodLabel}</span>
          </div>

          <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
            {description}
          </p>

          {isCurrent && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE PLAN
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-3 space-y-2.5 relative z-10">
          <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
            Included Features
          </span>
          <ul className="space-y-2">
            {ALL_PLATFORM_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                <span className="leading-tight text-[11px]">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      {/* Styled Modern Vibrant Action Button */}
      <div className="p-4 sm:p-5 pt-0 relative z-10">
        <CustomButton
          variant="unstyled"
          size="unstyled"
          className={cn(
            "w-full h-10 text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs group/btn",
            isCurrent
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
              : isPopular
              ? "bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 hover:from-primary/90 hover:via-emerald-600/90 hover:to-indigo-600/90 text-white shadow-md hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              : "border-2 border-primary/40 bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-[1.02] active:scale-[0.98]"
          )}
          onClick={() => !disabled && !isCurrent && onSelect()}
          disabled={disabled || isCurrent}
        >
          {isCurrent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Active Plan</span>
            </>
          ) : (
            <>
              <span>{buttonText || "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </>
          )}
        </CustomButton>
      </div>
    </Card>
  );
}

"use client";

import React from "react";
import { Clock, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface PlanUpgradeHeaderSummaryProps {
  selectedPlan: {
    id?: string;
    name: string;
    price: number;
    durationType: string;
    description?: string;
  };
}

export function PlanUpgradeHeaderSummary({ selectedPlan }: PlanUpgradeHeaderSummaryProps) {
  const getPlanIcon = (type?: string) => {
    if (type === "FREE_TRIAL") return <Clock className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (type === "YEARLY") return <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />;
    if (type === "SIX_MONTHS") return <Zap className="w-5 h-5 text-amber-500 shrink-0" />;
    return <ShieldCheck className="w-5 h-5 text-primary shrink-0" />;
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
          {getPlanIcon(selectedPlan.durationType)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-foreground">{selectedPlan.name}</h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {selectedPlan.durationType.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {selectedPlan.description || "Full platform features & POS checkout access"}
          </p>
        </div>
      </div>

      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
        <div className="flex items-baseline justify-start sm:justify-end gap-1">
          <span className="text-2xl font-black text-primary">${selectedPlan.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground font-bold">USD</span>
        </div>
      </div>
    </div>
  );
}

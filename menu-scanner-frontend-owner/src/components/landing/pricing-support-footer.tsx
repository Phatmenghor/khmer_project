"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

export function PricingSupportFooter() {
  return (
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
  );
}

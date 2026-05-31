"use client";

import { ReactNode } from "react";
import { LogIn, ShoppingCart } from "lucide-react";
import { PageContainer } from "@/components/shared/common/page-container";
import { CustomButton } from "@/components/shared/button/custom-button";

interface SignInRequiredProps {
  title: string;
  description: string;
  icon: ReactNode;
  onSignIn: () => void;
  browseButtonText?: string;
  onBrowse?: () => void;
}

export function SignInRequired({
  title,
  description,
  icon,
  onSignIn,
  browseButtonText = "Browse Products",
  onBrowse,
}: SignInRequiredProps) {
  return (
    <PageContainer className="min-h-screen flex flex-col py-12 sm:py-20">
      <div className="max-w-md mx-auto text-center">
        {/* Icon Container */}
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mx-auto mb-6">
          <div className="text-6xl sm:text-7xl">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <CustomButton
            onClick={onSignIn}
            className="w-full gap-2 h-11"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </CustomButton>
          <CustomButton
            variant="outline"
            onClick={onBrowse}
            className="w-full gap-2 h-11"
            size="lg"
          >
            <ShoppingCart className="h-4 w-4" />
            {browseButtonText}
          </CustomButton>
        </div>

        {/* Optional divider */}
        <div className="mt-8 pt-6 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            Don't have an account? Sign up during checkout.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

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
    <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
      <div className="max-w-md mx-auto text-center">
        {/* Icon Container */}
        <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mx-auto mb-4">
          <div className="text-base sm:text-base">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h1 className="text-base sm:text-xs font-bold mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <CustomButton
            onClick={onSignIn}
            className="w-full gap-1.5 h-8"
            size="lg"
          >
            <LogIn className="h-3 w-3" />
            Sign In
          </CustomButton>
          <CustomButton
            variant="outline"
            onClick={onBrowse}
            className="w-full gap-1.5 h-8"
            size="lg"
          >
            <ShoppingCart className="h-3 w-3" />
            {browseButtonText}
          </CustomButton>
        </div>

        {/* Optional divider */}
        <div className="mt-5 pt-4 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            Don't have an account? Sign up during checkout.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

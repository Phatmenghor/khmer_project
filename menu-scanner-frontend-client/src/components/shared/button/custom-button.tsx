"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(({ onClick, className, children, type = "button", isLoading, disabled, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      ref={ref}
      type={type}
      onClick={handleClick}
      className={cn(className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
});

CustomButton.displayName = "CustomButton";

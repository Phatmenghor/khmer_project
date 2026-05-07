"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(({ onClick, className, children, type = "button", isLoading, ...props }, ref) => {
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
      {...props}
    >
      {children}
    </Button>
  );
});

CustomButton.displayName = "CustomButton";

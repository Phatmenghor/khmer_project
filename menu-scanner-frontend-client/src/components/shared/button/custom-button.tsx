"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(({ onClick, className, children, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
});

CustomButton.displayName = "CustomButton";

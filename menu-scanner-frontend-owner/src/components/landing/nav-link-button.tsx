"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface NavLinkButtonProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "pill" | "drawer" | "footer";
}

export function NavLinkButton({
  href,
  children,
  onClick,
  className,
  variant = "pill",
}: NavLinkButtonProps) {
  const isExternal = href.startsWith("http");

  const baseStyles = {
    pill: "px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer h-auto",
    drawer: "w-full justify-start px-4 py-2.5 rounded-[12px] text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer h-auto",
    footer: "p-0 h-auto font-medium text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer justify-start inline-flex",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }

    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <CustomButton
      variant="unstyled"
      size="unstyled"
      onClick={handleClick}
      className={cn(baseStyles[variant], className)}
    >
      {children}
    </CustomButton>
  );
}

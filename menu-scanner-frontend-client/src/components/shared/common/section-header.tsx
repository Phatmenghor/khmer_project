import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("mb-3 sm:mb-4", className)}>
      <h2 className="text-xs font-bold tracking-tight flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />}
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-xs sm:text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
};

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper = ({
  children,
  className,
}: SectionWrapperProps) => {
  return <section className={cn("mb-5 sm:mb-8", className)}>{children}</section>;
};

interface ViewAllButtonProps {
  href: string;
  text?: string;
  className?: string;
}

export const ViewAllButton = ({
  href,
  text = "View All Products",
  className,
}: ViewAllButtonProps) => {
  return (
    <div className={cn("flex justify-center mt-4 sm:mt-5", className)}>
      <Link href={href}>
        <Button
          size="default"
          variant="outline"
          className="gap-1 group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all px-3 sm:px-3"
        >
          {text}
          <ArrowRight className="h-3 w-3 sm:h-3 sm:w-3 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

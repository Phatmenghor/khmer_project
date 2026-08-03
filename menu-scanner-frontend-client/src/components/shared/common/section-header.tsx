import React from "react";
import Link from "next/link";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  action,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/40 pb-2.5", className)}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />}
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {badge && (
            <span className="text-[10px] sm:text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-xs text-muted-foreground pl-3.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
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
    <div className={cn("flex justify-center mt-5 sm:mt-6", className)}>
      <Link href={href}>
        <CustomButton
          size="default"
          variant="outline"
          className="gap-1.5 group rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-2xs hover:shadow transition-all duration-200 px-5 text-xs font-semibold active:scale-[0.97]"
        >
          {text}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </CustomButton>
      </Link>
    </div>
  );
};

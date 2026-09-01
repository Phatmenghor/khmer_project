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
    <div className={cn("mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {Icon ? (
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          ) : (
            <span className="w-1.5 h-5 rounded-full bg-primary shrink-0" />
          )}
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          {badge && (
            <span className="text-[10px] sm:text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground pl-3.5 font-medium">
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
  return <section className={cn("mb-6 sm:mb-9", className)}>{children}</section>;
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
    <div className={cn("flex justify-center mt-6 sm:mt-7", className)}>
      <Link href={href}>
        <CustomButton
          size="default"
          variant="outline"
          className="gap-2 group rounded-full border border-primary/30 bg-background/80 hover:bg-primary text-primary hover:text-primary-foreground hover:border-primary shadow-xs hover:shadow-md hover:shadow-primary/20 transition-all duration-300 px-6 h-9 text-xs font-bold active:scale-[0.97]"
        >
          <span>{text}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </CustomButton>
      </Link>
    </div>
  );
};

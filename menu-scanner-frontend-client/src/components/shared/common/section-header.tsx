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
    <div className={cn("mb-4 sm:mb-6", className)}>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />}
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">{subtitle}</p>
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
  return <section className={cn("mb-8 sm:mb-12", className)}>{children}</section>;
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
    <div className={cn("flex justify-center mt-6 sm:mt-8", className)}>
      <Link href={href}>
        <Button
          size="default"
          variant="outline"
          className="gap-2 group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all px-6 sm:px-8"
        >
          {text}
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

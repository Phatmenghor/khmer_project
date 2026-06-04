import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {

    return (
      <div className="bg-card rounded border border-border overflow-hidden">
        {}
        <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          {}
          <div className="absolute top-1 left-1">
            <div className="h-3 w-5 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="h-3 w-3 bg-muted/50 rounded-full animate-pulse" />
          </div>
        </div>

        {}
        <div className="p-1 space-y-1">
          {}
          <div className="space-y-0.5">
            <div className="h-2 w-7 bg-muted/50 rounded animate-pulse" />
            <div className="h-2 w-8 bg-muted/50 rounded animate-pulse" />
          </div>

          {}
          <div className="h-3.5 w-full bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border">
      {}
      <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        {}
        <div className="absolute top-1.5 left-1.5">
          <div className="h-3.5 w-8 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="absolute top-1.5 right-1.5">
          <div className="h-3.5 w-10 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>

      {}
      <div className="p-2 space-y-2">
        {}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted/50 rounded animate-pulse" />
        </div>

        {}
        <div className="space-y-1.5">
          <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
          <div className="h-2 w-14 bg-muted/50 rounded animate-pulse" />
        </div>

        {}
        <div className="h-5 w-full bg-muted/50 rounded animate-pulse" />
      </div>
    </Card>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton = ({
  count = 8,
  className,
}: ProductGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 animate-fade-in-up-stagger", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

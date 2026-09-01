import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {
    return (
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden shadow-2xs">
        {/* Compact Product Image */}
        <div className="relative aspect-square w-full">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute top-1.5 left-1.5">
            <Skeleton className="h-4 w-7 rounded-md" />
          </div>
          <div className="absolute top-1.5 right-1.5">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>

        {/* Compact Product Info */}
        <div className="p-2 space-y-1.5">
          <div className="space-y-1">
            <Skeleton className="h-3 w-3/4 rounded-md" />
            <Skeleton className="h-2.5 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-border/80 rounded-2xl shadow-2xs bg-card">
      {/* Product Image Skeleton */}
      <div className="relative aspect-square w-full">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-2 left-2">
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
        <div className="absolute top-2 right-2">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>

      {/* Product Details Skeleton */}
      <div className="p-3 space-y-2.5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-2.5 w-16 rounded-md" />
        </div>

        <Skeleton className="h-8 w-full rounded-xl" />
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

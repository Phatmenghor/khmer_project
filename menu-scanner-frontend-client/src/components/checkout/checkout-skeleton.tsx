"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-2 space-y-4">
        {/* Contact/Table Card Skeleton */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-2xs">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>

        {/* Order Items Skeleton */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Sidebar Summary Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-4 shadow-2xs">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

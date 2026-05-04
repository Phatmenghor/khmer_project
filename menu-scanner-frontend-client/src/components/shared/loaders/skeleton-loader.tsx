"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
}

export function Skeleton({
  className,
  width,
  height = 20,
  count = 1,
  circle = false,
}: SkeletonProps) {
  const skeletons = Array(count).fill(null);

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse",
            circle && "rounded-full",
            !circle && "rounded-md",
            className
          )}
          style={{
            width: width,
            height: height,
          }}
        />
      ))}
    </>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton height={32} className="w-1/3" />
      <Skeleton height={16} className="w-2/3" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton height={20} className="w-full" />
      <Skeleton height={16} className="w-full" />
      <Skeleton height={16} className="w-4/5" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} height={40} className="w-full rounded-lg" />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return <Skeleton circle width={40} height={40} />;
}

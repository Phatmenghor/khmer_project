import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BannerSkeleton = () => {
  return (
    <div className="w-full mb-8">
      <Skeleton className="w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl" />
    </div>
  );
};

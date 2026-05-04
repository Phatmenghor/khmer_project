import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SubcategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card">
      <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center gap-3">
        {/* Image skeleton */}
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl" />

        {/* Text skeleton */}
        <div className="text-center space-y-2 flex-1 w-full">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded mx-auto" />
        </div>

        {/* Arrow skeleton */}
        <Skeleton className="w-4 h-4 rounded" />
      </CardContent>
    </Card>
  );
}

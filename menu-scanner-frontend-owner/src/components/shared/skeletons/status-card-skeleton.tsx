import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardSkeletonProps {
  count?: number;
}

export function StatusCardSkeleton({ count = 1 }: StatusCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3.5 animate-in fade-in-50 duration-300"
        >
          {/* Top header row */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          {/* Progress bar / Stats section */}
          <div className="pt-1 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>

          {/* Bottom metadata row */}
          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}

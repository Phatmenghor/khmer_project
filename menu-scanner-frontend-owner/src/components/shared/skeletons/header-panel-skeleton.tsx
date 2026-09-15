import { Skeleton } from "@/components/ui/skeleton";

export function HeaderPanelSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border border-border/60 shadow-2xs gap-3 animate-in fade-in-50 duration-300">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-52 rounded-lg" />
        <Skeleton className="h-3.5 w-40 rounded-md" />
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  );
}

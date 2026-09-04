import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  columns = 5,
  rows = 5,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <Card className="border-border/80 shadow-2xs overflow-hidden animate-in fade-in-50 duration-300">
      {showHeader && (
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          <div className="bg-muted/40 px-4 py-3 flex items-center justify-between gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1 rounded-md" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="px-4 py-3.5 flex items-center justify-between gap-4">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={c} className="h-4 flex-1 rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

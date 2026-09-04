import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      {/* Profile Header Card Skeleton */}
      <Card className="border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-40 sm:w-48 rounded-lg mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-52 rounded-md mx-auto sm:mx-0" />
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 justify-center sm:justify-start">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Switcher Skeleton */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl w-fit">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Form Section Skeleton */}
      <Card className="border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="py-4 border-b border-border/50">
          <Skeleton className="h-5 w-36 rounded-md" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

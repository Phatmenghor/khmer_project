import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / cover */}
      <section className="relative">
        <Skeleton className="h-40 sm:h-52 lg:h-56 w-full rounded-none" />
        <div className="container mx-auto px-3 max-w-6xl">
          <div className="relative -mt-8 sm:-mt-11 flex items-end justify-between pb-2">
            <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-14 rounded" />
              <Skeleton className="h-6 w-16 rounded" />
            </div>
          </div>
          <div className="pb-3 space-y-1">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-3 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3 px-4 text-center space-y-1">
                <Skeleton className="h-5 w-11 mx-auto rounded" />
                <Skeleton className="h-2 w-8 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-3 max-w-6xl py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-3 w-24 rounded" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-5/6 rounded" />
                  <Skeleton className="h-3 w-4/6 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Right col */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-3 w-28 rounded" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

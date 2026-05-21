import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / cover */}
      <section className="relative">
        <Skeleton className="h-56 sm:h-72 lg:h-80 w-full rounded-none" />
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative -mt-12 sm:-mt-16 flex items-end justify-between pb-3">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
          <div className="pb-5 space-y-2">
            <Skeleton className="h-7 w-64 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-4 px-6 text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto rounded" />
                <Skeleton className="h-3 w-12 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32 rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-4/6 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Right col */}
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-40 rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

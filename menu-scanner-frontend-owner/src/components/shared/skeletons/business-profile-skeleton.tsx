import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / cover */}
      <section className="relative pt-3 sm:pt-4">
        <div className="container mx-auto px-3 max-w-6xl">
          <Skeleton className="h-40 sm:h-52 lg:h-56 w-full rounded-[24px]" />
          <div className="relative -mt-12 sm:-mt-14 flex items-end justify-between pb-3 px-3">
            <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-card shadow-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="pb-4 px-3 space-y-2">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-card border-y border-border/80 my-2">
        <div className="container mx-auto px-3 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/60">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3 px-4 text-center space-y-1.5">
                <Skeleton className="h-6 w-14 mx-auto rounded-md" />
                <Skeleton className="h-3 w-16 mx-auto rounded-md" />
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
              <Card key={i} className="rounded-2xl border border-border/80 shadow-2xs bg-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-5/6 rounded-md" />
                  <Skeleton className="h-3.5 w-4/6 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Right col */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="rounded-2xl border border-border/80 shadow-2xs bg-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-36 rounded-md" />
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

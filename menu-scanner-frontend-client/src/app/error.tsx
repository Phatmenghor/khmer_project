"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  useEffect(() => {}, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-muted-foreground/30">500</p>
        <h1 className="text-xl font-semibold">Something Went Wrong</h1>
        <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard")} className="gap-2">
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

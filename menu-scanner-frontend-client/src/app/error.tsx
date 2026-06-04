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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-3">
      <div className="text-center space-y-3">
        <p className="text-xs font-bold text-muted-foreground/30">500</p>
        <h1 className="text-xs font-semibold">Something Went Wrong</h1>
        <p className="text-xs text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-2 justify-center pt-1">
          <Button variant="outline" size="sm" onClick={reset} className="gap-1">
            <RefreshCw className="h-3 w-3" /> Try Again
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard")} className="gap-1">
            <Home className="h-3 w-3" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

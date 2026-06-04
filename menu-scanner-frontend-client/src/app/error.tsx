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
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="text-8xl font-bold text-primary/20">500</div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Something Went Wrong</h1>
          <p className="text-muted-foreground leading-relaxed">
            An unexpected error occurred. Please try again or return to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a
              href="mailto:support@menuscanner.com"
              className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

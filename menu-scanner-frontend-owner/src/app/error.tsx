// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-3">
      <div className="text-center space-y-4 max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-xs font-semibold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            We encountered an unexpected error. This has been logged and our
            team will investigate the issue.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-3 text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3">
          <Button onClick={reset} className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Go Home
          </Button>
        </div>

        {/* Support Information */}
        <div className="pt-5 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            If this problem persists, please{" "}
            <a
              href="mailto:support@menuscanner.com?subject=Application Error"
              className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

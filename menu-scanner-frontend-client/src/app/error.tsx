"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {}, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">Please try again or go back to the dashboard.</p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={reset} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
            Try Again
          </button>
          <button onClick={() => (window.location.href = "/dashboard")} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

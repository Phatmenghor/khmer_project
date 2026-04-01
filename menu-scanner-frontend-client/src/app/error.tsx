// src/app/error.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Home, MessageCircle, Copy, CheckCircle2 } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  const handleCopyError = () => {
    navigator.clipboard.writeText(error.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Error Icon with Animation */}
          <div className="flex justify-center animate-bounce">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative rounded-full bg-gradient-to-br from-red-500/20 to-red-500/10 p-6 backdrop-blur-sm border border-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-600 drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="destructive" className="px-4 py-2 text-sm font-medium gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Error Detected
            </Badge>
          </div>

          {/* Main Content Card */}
          <div className="space-y-6 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Heading */}
            <div className="space-y-3 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                We encountered an unexpected error while processing your request. Don't worry, our team has been notified and is investigating the issue.
              </p>
            </div>

            {/* Error Details Card (Development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="space-y-3 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Technical Details
                  </h3>
                  <button
                    onClick={handleCopyError}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Copy error message"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 border border-border/50 overflow-auto">
                  <pre className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words max-h-40">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Error ID:</span> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={reset}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 rounded-xl font-semibold"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                size="lg"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold border-2 hover:bg-muted/50"
              >
                <Home className="h-5 w-5" />
                Go to Dashboard
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Need Help?</span> If this problem persists, please{" "}
                <a
                  href="mailto:support@menuscanner.com?subject=Application Error"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-2 transition-colors"
                >
                  contact our support team
                </a>
                {" "}with the error ID for faster resolution.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Menu Scanner Platform • Status: <span className="text-yellow-600 font-semibold">Investigating</span>
            </p>
            <p className="text-xs text-muted-foreground/60">
              Your session data has been saved. You can safely refresh the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/app/error.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Home, MessageCircle, Copy, CheckCircle2, Zap } from "lucide-react";

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Animated background elements with primary color */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Error Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
              <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-7 backdrop-blur-sm border border-primary/30 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300">
                <div className="relative">
                  <AlertTriangle className="h-14 w-14 text-primary drop-shadow-lg animate-bounce" />
                  <Zap className="absolute top-0 right-0 h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="px-4 py-2 text-sm font-semibold gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 transition-all">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Error Detected
            </Badge>
          </div>

          {/* Main Content Card */}
          <div className="space-y-6 bg-card/90 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 sm:p-12 shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300">
            {/* Heading */}
            <div className="space-y-4 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
                Oops! Something Went Wrong
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
                We encountered an unexpected error while processing your request. Our team has been notified and is investigating the issue immediately.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-sm text-primary/70">
                <Zap className="w-4 h-4" />
                <span>Please try again or contact support for assistance</span>
              </div>
            </div>

            {/* Error Details Card (Development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="space-y-4 pt-8 border-t border-primary/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Technical Details
                  </h3>
                  <button
                    onClick={handleCopyError}
                    className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/20 hover:border-primary/40"
                    title="Copy error message"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary/60 hover:text-primary" />
                    )}
                  </button>
                </div>
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 overflow-auto">
                  <pre className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words max-h-48 text-primary/70">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <div className="bg-primary/3 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-muted-foreground font-mono">
                      <span className="font-bold text-foreground">Error ID:</span>
                      <br />
                      <span className="text-primary/80">{error.digest}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                onClick={reset}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 h-13 rounded-2xl font-bold text-base"
              >
                <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2 h-13 rounded-2xl font-bold text-base border-2 border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary transition-all"
              >
                <Home className="h-5 w-5" />
                Go to Dashboard
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3 hover:border-primary/40 transition-all">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Need Immediate Help?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If this problem persists, please{" "}
                    <a
                      href="mailto:support@menuscanner.com?subject=Application Error"
                      className="text-primary font-bold hover:underline underline-offset-2 transition-colors hover:text-primary/80"
                    >
                      contact our support team
                    </a>
                    {" "}with the error ID for immediate assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info with Status */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
              <p className="text-sm font-semibold text-foreground">
                Menu Scanner Platform
              </p>
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Your session data has been securely saved. You can safely refresh the page or try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

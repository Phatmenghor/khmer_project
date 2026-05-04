// src/app/error.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Home, MessageCircle, Copy, CheckCircle2, Zap, Mail, ChevronRight, ToggleRight, ToggleLeft } from "lucide-react";

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
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl space-y-12">
          {/* Error Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
              <div className="relative rounded-full bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 p-8 lg:p-10 backdrop-blur-xl border border-primary/40 shadow-2xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                <div className="relative">
                  <AlertTriangle className="h-16 lg:h-20 w-16 lg:w-20 text-primary drop-shadow-lg animate-bounce" />
                  <Zap className="absolute top-2 -right-2 h-6 lg:h-7 w-6 lg:w-7 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="px-6 py-3 text-base font-bold gap-3 bg-primary/15 text-primary border-2 border-primary/40 hover:bg-primary/20 hover:border-primary/60 transition-all shadow-lg">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Error Detected - Immediate Attention Required
            </Badge>
          </div>

          {/* Main Content Card */}
          <div className="space-y-8 bg-card/95 backdrop-blur-2xl border-2 border-primary/20 rounded-3xl lg:rounded-4xl p-8 sm:p-10 lg:p-16 shadow-2xl hover:shadow-primary/15 hover:border-primary/40 transition-all duration-300">
            {/* Heading Section */}
            <div className="space-y-6 text-center max-w-5xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent leading-tight">
                Oops! Something Went Wrong
              </h1>
              <p className="text-xl sm:text-2xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                We encountered an unexpected error while processing your request. Don't worry, our engineering team has been automatically notified and is investigating this issue immediately.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-base lg:text-lg text-primary/80 font-semibold">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                  <span>Auto-logged to our support system</span>
                </div>
                <span className="hidden sm:block text-primary/50">•</span>
                <span>Priority: High</span>
              </div>
            </div>

            {/* Error Details Card (Development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="space-y-5 pt-8 lg:pt-12 border-t-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-wider">
                    <MessageCircle className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                    Technical Details
                  </h3>
                  <button
                    onClick={handleCopyError}
                    className="p-3 lg:p-4 rounded-xl bg-primary/8 hover:bg-primary/15 transition-all border-2 border-primary/20 hover:border-primary/50 group"
                    title="Copy error message"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 lg:w-6 h-5 lg:h-6 text-primary animate-pulse" />
                    ) : (
                      <Copy className="w-5 lg:w-6 h-5 lg:h-6 text-primary/60 group-hover:text-primary transition-colors" />
                    )}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-primary/8 to-primary/3 rounded-2xl p-6 lg:p-8 border-2 border-primary/20 overflow-auto shadow-inner">
                  <pre className="text-sm lg:text-base text-muted-foreground font-mono whitespace-pre-wrap break-words max-h-56 text-primary/70 leading-relaxed">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <div className="bg-primary/5 rounded-xl p-4 lg:p-6 border-2 border-primary/20">
                    <p className="text-sm lg:text-base text-muted-foreground font-mono space-y-2">
                      <div>
                        <span className="font-bold text-foreground">Error ID:</span>
                      </div>
                      <div className="text-primary/80 font-semibold tracking-wider">
                        {error.digest}
                      </div>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons with Toggle Icons */}
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 pt-8 lg:pt-12">
              <Button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/95 hover:to-primary/70 text-white shadow-xl hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 h-11 lg:h-12 rounded-2xl font-bold text-base lg:text-lg group"
              >
                <ToggleRight className="h-5 lg:h-6 w-5 lg:w-6 text-green-400 transition-transform group-hover:scale-125" />
                <RefreshCw className="h-5 lg:h-6 w-5 lg:w-6 transition-transform group-hover:rotate-180 duration-500" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 flex items-center justify-center gap-3 h-11 lg:h-12 rounded-2xl font-bold text-base lg:text-lg border-2 border-primary/40 hover:border-primary/70 bg-primary/8 hover:bg-primary/15 text-primary hover:text-primary transition-all group"
              >
                <ToggleRight className="h-5 lg:h-6 w-5 lg:w-6 text-green-600 transition-transform group-hover:scale-125" />
                <Home className="h-5 lg:h-6 w-5 lg:w-6" />
                Go to Dashboard
                <ChevronRight className="h-5 lg:h-6 w-5 lg:w-6 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => window.location.href = "mailto:support@menuscanner.com?subject=Application Error"}
                className="flex-1 flex items-center justify-center gap-3 h-11 lg:h-12 rounded-2xl font-bold text-base lg:text-lg border-2 border-red-500/40 hover:border-red-500/70 bg-red-500/8 hover:bg-red-500/15 text-red-600 hover:text-red-700 transition-all group"
              >
                <ToggleLeft className="h-5 lg:h-6 w-5 lg:w-6 text-gray-400 transition-transform group-hover:scale-125" />
                <Mail className="h-5 lg:h-6 w-5 lg:w-6" />
                Contact Support
              </Button>
            </div>

            {/* Info Boxes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 pt-8 lg:pt-12 border-t-2 border-primary/20">
              {/* Primary Info Box */}
              <div className="bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30 hover:border-primary/60 rounded-2xl lg:rounded-3xl p-6 lg:p-8 space-y-4 transition-all hover:shadow-lg group">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex gap-2">
                    <ToggleRight className="w-6 lg:w-7 h-6 lg:h-7 text-green-600 group-hover:scale-125 transition-transform" />
                    <Zap className="w-6 lg:w-7 h-6 lg:h-7 text-primary mt-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-bold text-lg lg:text-xl text-foreground">What Happened?</p>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      An unexpected error occurred while we were processing your request. Our automated systems have logged this error with full context.
                    </p>
                  </div>
                </div>
              </div>

              {/* Red Info Box for Support */}
              <div className="bg-gradient-to-br from-red-500/15 to-red-500/5 border-2 border-red-500/30 hover:border-red-500/60 rounded-2xl lg:rounded-3xl p-6 lg:p-8 space-y-4 transition-all hover:shadow-lg group">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex gap-2">
                    <ToggleLeft className="w-6 lg:w-7 h-6 lg:h-7 text-gray-400 group-hover:scale-125 transition-transform" />
                    <Mail className="w-6 lg:w-7 h-6 lg:h-7 text-red-600 mt-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-bold text-lg lg:text-xl text-foreground">Need Help?</p>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      If reloading doesn't work, our support team is standing by. Include the Error ID in your message for faster resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info with Status */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
              <p className="text-base lg:text-lg font-bold text-foreground">
                Menu Scanner Platform
              </p>
              <div className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
            </div>
            <p className="text-sm lg:text-base text-muted-foreground/70 leading-relaxed font-medium max-w-3xl mx-auto">
              ✓ Your session data has been securely saved • ✓ Error auto-logged to support system • ✓ You can safely refresh or try again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

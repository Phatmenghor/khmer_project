"use client";

import { ReactNode, StrictMode, useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "@/store";
import { useRouter } from "next/navigation";
import { useBusinessTheme } from "@/hooks/use-business-theme";

import { RouteTracker } from "@/components/layout/route-tracker";
import { Suspense } from "react";

interface ClientProvidersProps {
  children: ReactNode;
}


function ThemeInitializer() {
  useBusinessTheme();
  return null;
}

// Forces a router refresh on bfcache restores (persisted=true) so React
// remounts the current route and re-runs useEffect on all pages.
// This is the global counterpart to the per-page pageshow handlers.
function BfcacheRefreshHandler() {
  const router = useRouter();
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        router.refresh();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);
  return null;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const isProduction = process.env.NODE_ENV === "production";

  const content = (
    <Provider store={store}>
      <ThemeInitializer />
      <BfcacheRefreshHandler />
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  );


  return isProduction ? (
    <StrictMode>{content}</StrictMode>
  ) : (
    content
  );
}

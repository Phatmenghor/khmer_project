"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/utils/axios";
import { getSubdomain } from "@/utils/subdomain/subdomain-resolver";
import { AppDefault } from "@/constants/app-resource/default/default";

interface ResolveResponse {
  businessId: string;
  businessName: string;
  subdomain: string;
}

type Status = "loading" | "ready" | "not-found";

export function SubdomainProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const subdomain = getSubdomain();

    // No subdomain (localhost / base domain) → use default businessId
    if (!subdomain) {
      if (!localStorage.getItem("businessId")) {
        localStorage.setItem("businessId", AppDefault.BUSINESS_ID);
      }
      setStatus("ready");
      return;
    }

    axiosClient
      .get<{ data: ResolveResponse }>(
        `/api/v1/public/businesses/resolve-subdomain?subdomain=${subdomain}`,
      )
      .then(({ data }) => {
        const biz = data.data;
        if (!biz?.businessId) {
          setStatus("ready");
          return;
        }

        localStorage.setItem("businessId", biz.businessId);

        if (biz.businessName) {
          const cacheKey = `theme_colors_${biz.businessId}`;
          const existing = (() => {
            try {
              return JSON.parse(localStorage.getItem(cacheKey) ?? "{}");
            } catch {
              return {};
            }
          })();
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              ...existing,
              businessName: biz.businessName,
            }),
          );
        }

        const prev = localStorage.getItem("resolvedSubdomain");
        if (prev && prev !== subdomain) {
          localStorage.setItem("resolvedSubdomain", subdomain);
          window.location.reload();
        } else {
          localStorage.setItem("resolvedSubdomain", subdomain);
        }

        setStatus("ready");
      })
      .catch(() => {
        // Fallback gracefully to default business context if subdomain is invalid/unresolvable
        setStatus("ready");
      });
  }, []);

  if (status === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-8xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground/80">
          Restaurant Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The restaurant you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <a
          href="https://emenu-cambodia.com"
          className="mt-8 rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Go to ScanMeKH
        </a>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

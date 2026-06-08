"use client";

import { useEffect } from "react";
import { axiosClient } from "@/utils/axios";
import { getSubdomain } from "@/utils/subdomain/subdomain-resolver";
import { AppDefault } from "@/constants/app-resource/default/default";

interface ResolveResponse {
  businessId: string;
  businessName: string;
  subdomain: string;
  primaryColor: string | null;
}

export function SubdomainProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const subdomain = getSubdomain();
    if (!subdomain) return;

    axiosClient
      .get<{ data: ResolveResponse }>(`/api/v1/public/businesses/resolve-subdomain?subdomain=${subdomain}`)
      .then(({ data }) => {
        const biz = data.data;
        if (!biz?.businessId) return;

        // Store so all other parts of the app (thunks, ThemeInitializer, etc.) pick it up
        localStorage.setItem("businessId", biz.businessId);

        // Persist theme so ThemeInitializer can read it on next load without a flash
        if (biz.primaryColor || biz.businessName) {
          const cacheKey = `theme_colors_${biz.businessId}`;
          const existing = (() => {
            try { return JSON.parse(localStorage.getItem(cacheKey) ?? "{}"); }
            catch { return {}; }
          })();
          localStorage.setItem(cacheKey, JSON.stringify({
            ...existing,
            businessName: biz.businessName,
            primaryColor: biz.primaryColor ?? existing.primaryColor,
          }));
        }

        // Reload only if we just switched to a different business
        const prev = localStorage.getItem("resolvedSubdomain");
        if (prev && prev !== subdomain) {
          localStorage.setItem("resolvedSubdomain", subdomain);
          window.location.reload();
        } else {
          localStorage.setItem("resolvedSubdomain", subdomain);
        }
      })
      .catch(() => {
        // Subdomain not found — fall back to default businessId silently
        if (!localStorage.getItem("businessId")) {
          localStorage.setItem("businessId", AppDefault.BUSINESS_ID);
        }
      });
  }, []);

  return <>{children}</>;
}

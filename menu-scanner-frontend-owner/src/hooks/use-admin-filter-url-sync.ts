"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Generic hook to sync admin page filters (search, arbitrary key-value pairs, pageNo, pageSize)
 * bidirectionally and dynamically with URL query parameters.
 *
 * On mount & URL changes: reads URL params and calls onInit so state/Redux can be hydrated dynamically.
 * On filter change: writes active filter state back to the URL using router.replace (debounced).
 * Automatically omits default/empty values like "ALL", "0", pageNo=1 to keep URLs short and clean.
 *
 * Action params (view, edit, delete, create, resetPassword) are preserved and never overwritten.
 */

export const ACTION_PARAMS = ["view", "edit", "delete", "create", "resetPassword"] as const;

export interface AdminFilterSyncConfig {
  /**
   * Current filter values keyed by URL param name.
   * e.g. { search: "foo", accountStatus: "ACTIVE", pageNo: 2, pageSize: 15 }
   * Empty strings, 0, "ALL", and default pageNo 1 are dynamically omitted to keep the URL clean.
   */
  filters: Record<string, string | number | boolean | null | undefined>;
  /** Called on mount and on URL parameter change with values read from URL. */
  onInit: (params: Record<string, string>) => void;
  /** Debounce delay for URL writes in ms (default: 300) */
  debounceMs?: number;
}

export function useAdminFilterUrlSync({
  filters,
  onInit,
  debounceMs = 300,
}: AdminFilterSyncConfig): boolean {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isHydrated, setIsHydrated] = useState(false);

  const isInitializedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onInitRef = useRef(onInit);
  useEffect(() => {
    onInitRef.current = onInit;
  }, [onInit]);

  // ── On mount & browser navigation (back/forward): sync URL params to state ──
  useEffect(() => {
    const currentUrlParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      // Skip action params — those are handled by useActionRouting
      if ((ACTION_PARAMS as readonly string[]).includes(key)) return;
      if (value) currentUrlParams[key] = value;
    });

    if (isInitializedRef.current) {
      // Listen to dynamic URL changes (e.g. back/forward navigation)
      onInitRef.current(currentUrlParams);
    } else {
      isInitializedRef.current = true;
      if (Object.keys(currentUrlParams).length > 0) {
        onInitRef.current(currentUrlParams);
      }
      setIsHydrated(true);
    }
  }, [searchParams]);

  // ── On filter change: write active filters to URL (debounced) ────────────
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const currentSearch = typeof window !== "undefined" ? window.location.search : searchParams.toString();
      const params = new URLSearchParams(currentSearch);

      // Remove non-action params — re-add only active non-default ones
      const keysToDelete: string[] = [];
      params.forEach((_, key) => {
        if (!(ACTION_PARAMS as readonly string[]).includes(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => params.delete(key));

      // Write active filter values; dynamically omit default/empty/ALL/falsy entries
      for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined) continue;
        const strVal = String(value).trim();
        const upper = strVal.toUpperCase();

        // Omit default / empty / ALL values from URL dynamically
        if (
          !strVal ||
          strVal === "" ||
          strVal === "0" ||
          upper === "ALL" ||
          strVal === "undefined" ||
          strVal === "null" ||
          (key === "pageNo" && strVal === "1")
        ) {
          continue;
        }

        params.set(key, strVal);
      }

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      const currentUrl = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : pathname;

      if (newUrl !== currentUrl && typeof window !== "undefined") {
        window.history.replaceState(null, "", newUrl);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtersKey, pathname, debounceMs]);

  return isHydrated;
}

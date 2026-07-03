"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic hook to sync admin page filters (search, arbitrary key-value pairs, pageNo, pageSize)
 * bidirectionally with URL query parameters.
 *
 * On mount: reads URL params and calls onInit so Redux can be hydrated.
 * On filter change: writes filter state back to the URL using router.replace
 *   (replace avoids polluting browser history on every keystroke).
 *
 * Action params (view, edit, delete, create, resetPassword) are preserved and never overwritten.
 */

export const ACTION_PARAMS = ["view", "edit", "delete", "create", "resetPassword"] as const;

export interface AdminFilterSyncConfig {
  /**
   * Current filter values keyed by URL param name.
   * e.g. { search: "foo", accountStatus: "ACTIVE", pageNo: 2, pageSize: 15 }
   * Empty strings and 0 are omitted from the URL to keep it clean.
   */
  filters: Record<string, string | number>;
  /** Called once on mount with values read from URL. Use this to hydrate Redux. */
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
  useEffect(() => { onInitRef.current = onInit; }, [onInit]);

  // ── On mount: hydrate Redux from URL ──────────────────────────────────────
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initialValues: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      // Skip action params — those are handled by useActionRouting
      if ((ACTION_PARAMS as readonly string[]).includes(key)) return;
      if (value) initialValues[key] = value;
    });

    if (Object.keys(initialValues).length > 0) {
      onInitRef.current(initialValues);
    }
    setIsHydrated(true);
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── On filter change: write to URL (debounced) ────────────────────────────
  // Serialise filters to a stable string for the dependency array
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove all non-action params — we'll re-add the current ones
      const keysToDelete: string[] = [];
      params.forEach((_, key) => {
        if (!(ACTION_PARAMS as readonly string[]).includes(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => params.delete(key));

      // Write current filter values; omit empty/falsy/zero entries for a clean URL
      for (const [key, value] of Object.entries(filters)) {
        const strVal = String(value);
        if (strVal && strVal !== "" && strVal !== "0") {
          params.set(key, strVal);
        }
      }

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      const currentUrl = `${pathname}${window.location.search}`;

      if (newUrl !== currentUrl) {
        router.replace(newUrl);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return isHydrated;
}

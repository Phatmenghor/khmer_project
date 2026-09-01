"use client";

import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";
import { usePagination } from "@/hooks/use-pagination";

export interface UseAdminTableUrlStateOptions {
  /** Base route path, e.g. ROUTES.ADMIN.PRODUCTS */
  baseRoute: string;
  /** Current filter values to sync to URL query string */
  filters: Record<string, string | number>;
  /** Callback on mount with URL parameters read from the browser URL */
  onInit: (params: Record<string, string>) => void;
  /** Callback to sync page number to Redux / state */
  syncPageToRedux: (page: number) => void;
  debounceMs?: number;
}

/**
 * Unified custom hook for all admin pages.
 * Combines URL filter syncing, action routing (view, edit, delete, create), and pagination.
 */
export function useAdminTableUrlState({
  baseRoute,
  filters,
  onInit,
  syncPageToRedux,
  debounceMs = 300,
}: UseAdminTableUrlStateOptions) {
  const actionRouting = useActionRouting();

  const isHydrated = useAdminFilterUrlSync({
    filters,
    onInit,
    debounceMs,
  });

  const pagination = usePagination({
    baseRoute,
    syncPageToRedux,
  });

  return {
    isHydrated,
    ...actionRouting,
    ...pagination,
  };
}

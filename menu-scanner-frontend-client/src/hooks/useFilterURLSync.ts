/**
 * useFilterURLSync Hook
 * Syncs POS filters with URL query parameters
 *
 * Example URLs:
 * /admin/pos
 * /admin/pos?search=coffee
 * /admin/pos?search=coffee&categoryId=1&brandId=2
 * /admin/pos?search=coffee&categoryId=1&brandId=2&promotion=true
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setSearchTerm,
  setPromotionFilter,
} from "@/redux/features/business/store/slice/pos-page-slice";
import {
  selectSearchTerm,
  selectPromotionFilter,
} from "@/redux/features/business/store/selectors/pos-page-selector";

/**
 * Filter state interface
 */
export interface FilterState {
  search: string;
  categoryId: string | null;
  brandId: string | null;
  hasPromotion: boolean;
}

/**
 * Hook options
 */
interface UseFilterURLSyncOptions {
  /**
   * Enable/disable URL sync
   * @default true
   */
  enabled?: boolean;

  /**
   * Debounce time before updating URL (ms)
   * @default 800
   */
  debounceMs?: number;

  /**
   * Callback when filters loaded from URL
   */
  onFiltersLoaded?: (filters: FilterState) => void;

  /**
   * Callback when filters changed
   */
  onFiltersChanged?: (filters: FilterState) => void;
}

/**
 * Hook that syncs filters with URL query parameters
 *
 * Features:
 * - Load filters from URL on mount
 * - Sync filter changes to URL
 * - Debounced URL updates
 * - Browser back/forward support
 * - Shareable filter links
 * - URL-based state management
 */
export function useFilterURLSync(options: UseFilterURLSyncOptions = {}) {
  const {
    enabled = true,
    debounceMs = 800,
    onFiltersLoaded,
    onFiltersChanged,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const searchTerm = useAppSelector(selectSearchTerm);
  const promotionFilter = useAppSelector(selectPromotionFilter);

  // Track initialization
  const isInitializedRef = useRef(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // ─────────────────────────────────────────────────────────────
  // LOAD filters from URL on mount (ONCE ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      // Get filters from URL
      const search = searchParams.get("search") || "";
      const promotionParam = searchParams.get("promotion");
      const hasPromotion = promotionParam === "true";

      // Update Redux with URL values
      if (search) {
        dispatch(setSearchTerm(search));
        console.log(`🔍 Loaded search from URL: "${search}"`);
      }

      if (hasPromotion) {
        dispatch(setPromotionFilter(true));
        console.log(`🎁 Loaded promotion filter from URL`);
      }

      // Build current filters object
      const currentFilters: FilterState = {
        search,
        categoryId: searchParams.get("categoryId"),
        brandId: searchParams.get("brandId"),
        hasPromotion,
      };

      // Notify callback
      if (onFiltersLoaded) {
        onFiltersLoaded(currentFilters);
      }

      console.log(
        `✅ Filters loaded from URL:`,
        JSON.stringify(currentFilters)
      );
    } catch (error) {
      console.error("Error loading filters from URL:", error);
    }
  }, [enabled, searchParams, dispatch, onFiltersLoaded]);

  // ─────────────────────────────────────────────────────────────
  // SAVE filters to URL when they change (DEBOUNCED)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't sync if not initialized or disabled
    if (!enabled || !isInitializedRef.current) return;

    // Clear previous timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Debounce the URL update
    urlUpdateTimeoutRef.current = setTimeout(() => {
      try {
        // Build URL params
        const params = new URLSearchParams();

        if (searchTerm) {
          params.set("search", searchTerm);
        }

        if (promotionFilter) {
          params.set("promotion", "true");
        }

        // Update URL
        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "";

        // Only update if URL actually changed
        if (newUrl !== window.location.search) {
          router.push(newUrl);
          console.log(`📍 Updated URL:`, newUrl || "(no filters)");

          // Build current filters object
          const currentFilters: FilterState = {
            search: searchTerm,
            categoryId: searchParams.get("categoryId"),
            brandId: searchParams.get("brandId"),
            hasPromotion: promotionFilter || false,
          };

          if (onFiltersChanged) {
            onFiltersChanged(currentFilters);
          }
        }
      } catch (error) {
        console.error("Error updating URL with filters:", error);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, [searchTerm, promotionFilter, enabled, router, searchParams, debounceMs, onFiltersChanged]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  /**
   * Get current filters from URL
   */
  const getFiltersFromURL = useCallback((): FilterState => {
    return {
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId"),
      brandId: searchParams.get("brandId"),
      hasPromotion: searchParams.get("promotion") === "true",
    };
  }, [searchParams]);

  /**
   * Clear all filters from URL
   */
  const clearFilters = useCallback(() => {
    try {
      router.push("");
      dispatch(setSearchTerm(""));
      dispatch(setPromotionFilter(undefined));
      console.log(`🗑️ All filters cleared from URL`);
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  }, [router, dispatch]);

  /**
   * Update URL with filters manually
   */
  const updateURL = useCallback(
    (filters: Partial<FilterState>) => {
      try {
        const params = new URLSearchParams();

        if (filters.search) {
          params.set("search", filters.search);
        }
        if (filters.categoryId) {
          params.set("categoryId", filters.categoryId);
        }
        if (filters.brandId) {
          params.set("brandId", filters.brandId);
        }
        if (filters.hasPromotion) {
          params.set("promotion", "true");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "";
        router.push(newUrl);

        console.log(`📍 Manually updated URL:`, newUrl || "(no filters)");
      } catch (error) {
        console.error("Error updating URL:", error);
      }
    },
    [router]
  );

  /**
   * Get shareable filter link
   */
  const getShareableLink = useCallback((): string => {
    const filters = getFiltersFromURL();
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.hasPromotion) params.set("promotion", "true");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const path = "/admin/pos";
    const queryString = params.toString();

    return `${baseUrl}${path}${queryString ? "?" + queryString : ""}`;
  }, [getFiltersFromURL]);

  return {
    isInitialized: isInitializedRef.current,
    getFiltersFromURL,
    clearFilters,
    updateURL,
    getShareableLink,
  };
}

/**
 * Simple version with minimal options
 */
export function useSimpleFilterURLSync() {
  return useFilterURLSync({
    enabled: true,
    debounceMs: 800,
  });
}

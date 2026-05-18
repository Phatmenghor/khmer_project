/**
 * useFilterURLSync Hook - SIMPLIFIED & FIXED
 * Syncs POS filters with URL query parameters
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setSearchTerm,
  setPromotionFilter,
} from "@/features/business/store/slice/pos-page-slice";
import {
  selectSearchTerm,
  selectPromotionFilter,
  selectSelectedCategory,
  selectSelectedBrand,
} from "@/features/business/store/selectors/pos-page-selector";

export interface FilterState {
  search: string;
  categoryId: string | null;
  brandId: string | null;
  hasPromotion: boolean;
}

interface UseFilterURLSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  onFiltersLoaded?: (filters: FilterState) => void;
  onFiltersChanged?: (filters: FilterState) => void;
}

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

  // Get ALL filter values from Redux
  const searchTerm = useAppSelector(selectSearchTerm);
  const promotionFilter = useAppSelector(selectPromotionFilter);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const selectedBrand = useAppSelector(selectSelectedBrand);

  const isInitializedRef = useRef(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Load from URL on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const search = searchParams.get("search") || "";
      const promotion = searchParams.get("promotion") === "true";


      // Update Redux with URL values
      if (search) {
        dispatch(setSearchTerm(search));
      }

      if (promotion) {
        dispatch(setPromotionFilter(true));
      }

      const filters: FilterState = {
        search,
        categoryId: searchParams.get("categoryId"),
        brandId: searchParams.get("brandId"),
        hasPromotion: promotion,
      };


      if (onFiltersLoaded) {
        onFiltersLoaded(filters);
      }
    } catch (error) {
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Save to URL when filters change
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !isInitializedRef.current) return;

    // Clear old timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Debounce the update
    urlUpdateTimeoutRef.current = setTimeout(() => {
      try {
        // Build URL params from ALL filter sources
        const params = new URLSearchParams();

        if (searchTerm) {
          params.set("search", searchTerm);
        }

        if (selectedCategory?.id) {
          params.set("categoryId", selectedCategory.id);
        }

        if (selectedBrand?.id) {
          params.set("brandId", selectedBrand.id);
        }

        if (promotionFilter) {
          params.set("promotion", "true");
        }

        // Build new URL
        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "";

        // Check if URL actually changed
        const currentUrl = window.location.search;
        if (newUrl !== currentUrl) {

          // Use window.history for more reliable navigation
          window.history.pushState(
            null,
            "",
            newUrl ? `/admin/pos${newUrl}` : "/admin/pos"
          );

          const filters: FilterState = {
            search: searchTerm,
            categoryId: selectedCategory?.id || null,
            brandId: selectedBrand?.id || null,
            hasPromotion: promotionFilter || false,
          };


          if (onFiltersChanged) {
            onFiltersChanged(filters);
          }
        }
      } catch (error) {
      }
    }, debounceMs);

    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, [
    searchTerm,
    selectedCategory?.id,
    selectedBrand?.id,
    promotionFilter,
    enabled,
    debounceMs,
    onFiltersChanged,
  ]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  const getFiltersFromURL = useCallback((): FilterState => {
    return {
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId"),
      brandId: searchParams.get("brandId"),
      hasPromotion: searchParams.get("promotion") === "true",
    };
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    try {
      window.history.pushState(null, "", "/admin/pos");
      dispatch(setSearchTerm(""));
      dispatch(setPromotionFilter(undefined));
    } catch (error) {
    }
  }, [dispatch]);

  const getShareableLink = useCallback((): string => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory?.id) params.set("categoryId", selectedCategory.id);
    if (selectedBrand?.id) params.set("brandId", selectedBrand.id);
    if (promotionFilter) params.set("promotion", "true");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const queryString = params.toString();

    return `${baseUrl}/admin/pos${queryString ? "?" + queryString : ""}`;
  }, [searchTerm, selectedCategory?.id, selectedBrand?.id, promotionFilter]);

  return {
    isInitialized: isInitializedRef.current,
    getFiltersFromURL,
    clearFilters,
    getShareableLink,
  };
}

export function useSimpleFilterURLSync() {
  return useFilterURLSync({
    enabled: true,
    debounceMs: 800,
  });
}

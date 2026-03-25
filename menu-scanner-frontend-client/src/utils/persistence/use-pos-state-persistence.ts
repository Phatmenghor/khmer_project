/**
 * POS Page State Persistence Hook
 * Manages URL params for filters and localStorage for cart
 * FIXED: Prevents infinite loops with proper initialization control
 */

import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  loadPersistedFilters,
  loadPersistedCart,
  setSearchTerm,
  setPromotionFilter,
} from "@/redux/features/business/store/slice/pos-page-slice";
import {
  selectSearchTerm,
  selectPromotionFilter,
  selectCartItems,
} from "@/redux/features/business/store/selectors/pos-page-selector";
import { usePOSPersistence, POSFilterState } from "./use-pos-persistence";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";

/**
 * Hook configuration options
 */
interface UsePOSStatePersistenceOptions {
  /**
   * Enable URL parameter persistence for filters
   * @default true
   */
  enableUrlPersistence?: boolean;

  /**
   * Enable localStorage persistence for cart
   * @default true
   */
  enableCartPersistence?: boolean;

  /**
   * Debounce time (ms) before saving cart to localStorage
   * @default 1000
   */
  cartSaveDebounceMs?: number;

  /**
   * Debounce time (ms) before saving filters to URL
   * @default 800
   */
  filterSaveDebounceMs?: number;

  /**
   * Callback when state is loaded from persistence
   */
  onStateLoaded?: (loadedState: { filters: POSFilterState; cart: PosPageCartItem[] }) => void;
}

/**
 * Main hook for POS state persistence
 * Handles automatic sync between Redux, URL params, and localStorage
 *
 * FIXED INFINITE LOOP:
 * - Uses ref to track initialization (run once on mount)
 * - Prevents saving during initial load
 * - Proper debouncing to prevent circular updates
 */
export function usePOSStatePersistence(options: UsePOSStatePersistenceOptions = {}) {
  const {
    enableUrlPersistence = true,
    enableCartPersistence = true,
    cartSaveDebounceMs = 1000,
    filterSaveDebounceMs = 800,
    onStateLoaded,
  } = options;

  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(selectSearchTerm);
  const promotionFilter = useAppSelector(selectPromotionFilter);
  const cartItems = useAppSelector(selectCartItems);

  const persistence = usePOSPersistence();

  // Use ref to track initialization - prevents infinite loops
  const initRef = useRef(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout>();
  const cartTimeoutRef = useRef<NodeJS.Timeout>();

  // ────────────────────────────────────────────────────────────
  // STEP 1: Initialize (Load from persistence)
  // Run ONCE on mount only - empty dependency array
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || initRef.current) return;

    initRef.current = true;

    try {
      // Load from URL params
      if (enableUrlPersistence) {
        const filters = persistence.loadFiltersFromUrl();
        if (Object.values(filters).some((v) => v)) {
          dispatch(loadPersistedFilters(filters));
        }
      }

      // Load from localStorage
      if (enableCartPersistence) {
        const cart = persistence.loadCartFromStorage();
        if (cart.length > 0) {
          dispatch(loadPersistedCart(cart));
        }
      }

      // Callback
      if (onStateLoaded) {
        onStateLoaded({
          filters: persistence.loadFiltersFromUrl(),
          cart: persistence.loadCartFromStorage(),
        });
      }

      persistence.setInitialized(true);
    } catch (error) {
      console.error("Error loading persisted state:", error);
      persistence.setInitialized(true);
    }
  }, []); // Empty array - RUN ONLY ONCE on mount

  // ────────────────────────────────────────────────────────────
  // STEP 2: Save filters (ONLY after initialized)
  // Debounce 800ms to prevent excessive updates
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip if disabled or not initialized yet
    if (!enableUrlPersistence || !persistence.isInitialized || !initRef.current) {
      return;
    }

    // Clear old timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set new timeout for debounced save
    filterTimeoutRef.current = setTimeout(() => {
      try {
        persistence.saveFiltersToUrl({
          search: searchTerm,
          hasPromotion: promotionFilter || false,
        });
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    }, filterSaveDebounceMs);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [searchTerm, promotionFilter, enableUrlPersistence, persistence, filterSaveDebounceMs]);

  // ────────────────────────────────────────────────────────────
  // STEP 3: Save cart (ONLY after initialized)
  // Debounce 1000ms to prevent excessive updates
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip if disabled or not initialized yet
    if (!enableCartPersistence || !persistence.isInitialized || !initRef.current) {
      return;
    }

    // Clear old timeout
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }

    // Set new timeout for debounced save
    cartTimeoutRef.current = setTimeout(() => {
      try {
        if (cartItems.length > 0) {
          persistence.saveCartToStorage(cartItems);
        } else {
          persistence.clearCartFromStorage();
        }
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    }, cartSaveDebounceMs);

    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
    };
  }, [cartItems, enableCartPersistence, persistence, cartSaveDebounceMs]);

  // ────────────────────────────────────────────────────────────
  // PUBLIC API
  // ────────────────────────────────────────────────────────────

  const clearAllPersistence = useCallback(() => {
    try {
      persistence.clearAll();
    } catch (error) {
      console.error("Error clearing persistence:", error);
    }
  }, [persistence]);

  const clearFilters = useCallback(() => {
    try {
      persistence.clearFiltersInUrl();
      dispatch(setSearchTerm(""));
      dispatch(setPromotionFilter(undefined));
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  }, [persistence, dispatch]);

  const clearCart = useCallback(() => {
    try {
      persistence.clearCartFromStorage();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [persistence]);

  const exportState = useCallback(() => {
    try {
      return {
        filters: persistence.loadFiltersFromUrl(),
        cart: persistence.loadCartFromStorage(),
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "N/A",
      };
    } catch (error) {
      console.error("Error exporting state:", error);
      return {
        filters: { search: "", categoryId: null, brandId: null, hasPromotion: false },
        cart: [],
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "N/A",
      };
    }
  }, [persistence]);

  const hasPersistedState = useCallback(
    () => {
      try {
        return persistence.hasPersistedState();
      } catch {
        return false;
      }
    },
    [persistence]
  );

  const resetToDefault = useCallback(() => {
    try {
      clearAllPersistence();
      dispatch(setSearchTerm(""));
      dispatch(setPromotionFilter(undefined));
    } catch (error) {
      console.error("Error resetting to default:", error);
    }
  }, [clearAllPersistence, dispatch]);

  return {
    isInitialized: initRef.current,
    hasPersistedState: hasPersistedState(),
    clearAllPersistence,
    clearFilters,
    clearCart,
    resetToDefault,
    exportState,
  };
}

/**
 * Hook to track filter changes for debugging
 */
export function usePOSFilterSync() {
  const persistence = usePOSPersistence();
  const searchTerm = useAppSelector(selectSearchTerm);
  const promotionFilter = useAppSelector(selectPromotionFilter);

  const currentFilters: POSFilterState = {
    search: searchTerm,
    categoryId: null,
    brandId: null,
    hasPromotion: promotionFilter || false,
  };

  const getUrlFilters = useCallback(() => {
    return persistence.loadFiltersFromUrl();
  }, [persistence]);

  const syncToUrl = useCallback(() => {
    persistence.saveFiltersToUrl(currentFilters);
  }, [persistence, currentFilters]);

  return {
    currentFilters,
    getUrlFilters,
    syncToUrl,
  };
}

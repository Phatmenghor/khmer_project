/**
 * POS Page State Persistence Hook
 * Manages URL params for filters and localStorage for cart
 * Clean, single-responsibility hook for easy integration
 */

import { useEffect, useCallback } from "react";
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

  // ────────────────────────────────────────────────────────────
  // INITIALIZATION - Load persisted state on mount
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // Notify that persistence is initialized
    if (onStateLoaded) {
      onStateLoaded({
        filters: persistence.loadFiltersFromUrl(),
        cart: persistence.loadCartFromStorage(),
      });
    }

    persistence.setInitialized(true);
  }, [dispatch, enableUrlPersistence, enableCartPersistence, persistence, onStateLoaded]);

  // ────────────────────────────────────────────────────────────
  // FILTER SYNC - Save filters to URL when they change
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enableUrlPersistence || !persistence.isInitialized) return;

    const timeoutId = setTimeout(() => {
      persistence.saveFiltersToUrl({
        search: searchTerm,
        hasPromotion: promotionFilter || false,
      });
    }, filterSaveDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, promotionFilter, enableUrlPersistence, persistence, filterSaveDebounceMs]);

  // ────────────────────────────────────────────────────────────
  // CART SYNC - Save cart to localStorage when it changes
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enableCartPersistence || !persistence.isInitialized) return;

    const timeoutId = setTimeout(() => {
      if (cartItems.length > 0) {
        persistence.saveCartToStorage(cartItems);
      } else {
        persistence.clearCartFromStorage();
      }
    }, cartSaveDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [cartItems, enableCartPersistence, persistence, cartSaveDebounceMs]);

  // ────────────────────────────────────────────────────────────
  // PUBLIC API
  // ────────────────────────────────────────────────────────────

  /**
   * Clear all persisted state (filters + cart)
   */
  const clearAllPersistence = useCallback(() => {
    persistence.clearAll();
  }, [persistence]);

  /**
   * Clear only filters
   */
  const clearFilters = useCallback(() => {
    persistence.clearFiltersInUrl();
    dispatch(setSearchTerm(""));
    dispatch(setPromotionFilter(undefined));
  }, [persistence, dispatch]);

  /**
   * Clear only cart
   */
  const clearCart = useCallback(() => {
    persistence.clearCartFromStorage();
  }, [persistence]);

  /**
   * Export current state (for debugging or sharing)
   */
  const exportState = useCallback(() => {
    return {
      filters: persistence.loadFiltersFromUrl(),
      cart: persistence.loadCartFromStorage(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  }, [persistence]);

  /**
   * Check if there's any persisted state
   */
  const hasPersistedState = useCallback(
    () => persistence.hasPersistedState(),
    [persistence]
  );

  /**
   * Reset to clean state (clear URL and localStorage)
   */
  const resetToDefault = useCallback(() => {
    clearAllPersistence();
    dispatch(setSearchTerm(""));
    dispatch(setPromotionFilter(undefined));
  }, [clearAllPersistence, dispatch]);

  return {
    // State status
    isInitialized: persistence.isInitialized,
    hasPersistedState: hasPersistedState(),

    // Actions
    clearAllPersistence,
    clearFilters,
    clearCart,
    resetToDefault,
    exportState,
  };
}

/**
 * Hook to track filter changes for debugging
 * Useful for development
 */
export function usePOSFilterSync() {
  const persistence = usePOSPersistence();
  const searchTerm = useAppSelector(selectSearchTerm);
  const promotionFilter = useAppSelector(selectPromotionFilter);

  const currentFilters: POSFilterState = {
    search: searchTerm,
    categoryId: null, // Loaded via URL params separately
    brandId: null, // Loaded via URL params separately
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

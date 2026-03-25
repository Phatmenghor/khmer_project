import { useEffect, useCallback, useRef } from "react";
import { useUrlParams } from "./use-url-params";
import { useLocalStorage } from "./use-local-storage";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";

/**
 * POS Page Filter State
 */
export interface POSFilterState {
  search: string;
  categoryId: string | null;
  brandId: string | null;
  hasPromotion: boolean;
}

/**
 * POS Page Cart State (for localStorage)
 */
export interface POSCartState {
  items: PosPageCartItem[];
  lastUpdated: number;
  version: number; // For future migration
}

/**
 * Combined POS persistence hook
 * Manages filters via URL and cart via localStorage
 */
export function usePOSPersistence() {
  const urlParams = useUrlParams();
  const cartStorage = useLocalStorage<POSCartState | null>("pos:cart", null, {
    validateBeforeLoad: (value) => {
      if (!value || !Array.isArray(value.items)) return false;
      return value.version === 1;
    },
  });

  const isInitializedRef = useRef(false);

  // ────────────────────────────────────────────
  // FILTER MANAGEMENT (URL PARAMS)
  // ────────────────────────────────────────────

  const loadFiltersFromUrl = useCallback((): POSFilterState => {
    return {
      search: urlParams.getParam("search") || "",
      categoryId: urlParams.getParam("categoryId") || null,
      brandId: urlParams.getParam("brandId") || null,
      hasPromotion: urlParams.getParam("hasPromotion") === "true",
    };
  }, [urlParams]);

  const saveFiltersToUrl = useCallback(
    (filters: Partial<POSFilterState>) => {
      const updates: Record<string, string | null> = {};

      if (filters.search !== undefined) {
        updates["search"] = filters.search || null;
      }
      if (filters.categoryId !== undefined) {
        updates["categoryId"] = filters.categoryId || null;
      }
      if (filters.brandId !== undefined) {
        updates["brandId"] = filters.brandId || null;
      }
      if (filters.hasPromotion !== undefined) {
        updates["hasPromotion"] = filters.hasPromotion ? "true" : null;
      }

      urlParams.setParams(updates);
    },
    [urlParams]
  );

  const clearFiltersInUrl = useCallback(() => {
    urlParams.removeParams(["search", "categoryId", "brandId", "hasPromotion"]);
  }, [urlParams]);

  // ────────────────────────────────────────────
  // CART MANAGEMENT (LOCALSTORAGE)
  // ────────────────────────────────────────────

  const loadCartFromStorage = useCallback((): PosPageCartItem[] => {
    if (cartStorage.value && cartStorage.value.items) {
      return cartStorage.value.items;
    }
    return [];
  }, [cartStorage.value]);

  const saveCartToStorage = useCallback(
    (items: PosPageCartItem[]) => {
      cartStorage.setValue({
        items,
        lastUpdated: Date.now(),
        version: 1,
      });
    },
    [cartStorage]
  );

  const clearCartFromStorage = useCallback(() => {
    cartStorage.removeValue();
  }, [cartStorage]);

  // ────────────────────────────────────────────
  // COMBINED STATE
  // ────────────────────────────────────────────

  const loadAll = useCallback(
    () => ({
      filters: loadFiltersFromUrl(),
      cart: loadCartFromStorage(),
    }),
    [loadFiltersFromUrl, loadCartFromStorage]
  );

  const saveAll = useCallback(
    (filters: Partial<POSFilterState>, cart: PosPageCartItem[]) => {
      saveFiltersToUrl(filters);
      saveCartToStorage(cart);
    },
    [saveFiltersToUrl, saveCartToStorage]
  );

  const clearAll = useCallback(() => {
    clearFiltersInUrl();
    clearCartFromStorage();
  }, [clearFiltersInUrl, clearCartFromStorage]);

  // ────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────

  const hasPersistedState = useCallback((): boolean => {
    const params = urlParams.getAllParams();
    const hasFilters = Object.keys(params).length > 0;
    const hasCart = cartStorage.value && cartStorage.value.items.length > 0;
    return hasFilters || hasCart;
  }, [urlParams, cartStorage.value]);

  const exportState = useCallback(
    () => ({
      filters: loadFiltersFromUrl(),
      cart: loadCartFromStorage(),
      timestamp: Date.now(),
    }),
    [loadFiltersFromUrl, loadCartFromStorage]
  );

  return {
    // Filters (URL)
    loadFiltersFromUrl,
    saveFiltersToUrl,
    clearFiltersInUrl,

    // Cart (localStorage)
    loadCartFromStorage,
    saveCartToStorage,
    clearCartFromStorage,

    // Combined
    loadAll,
    saveAll,
    clearAll,
    hasPersistedState,
    exportState,

    // State
    isInitialized: isInitializedRef.current,
    setInitialized: (value: boolean) => {
      isInitializedRef.current = value;
    },
  };
}

/**
 * Hook to sync Redux state with persistence layer
 * Use this in your main POS page component
 */
export function usePOSSyncPersistence(
  onLoadFilters: (filters: POSFilterState) => void,
  onLoadCart: (items: PosPageCartItem[]) => void,
  onCartChange: (items: PosPageCartItem[]) => void
) {
  const persistence = usePOSPersistence();
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize on mount
  useEffect(() => {
    if (typeof window === "undefined" || persistence.isInitialized) return;

    // Delay initialization to ensure Redux is ready
    initializationTimeoutRef.current = setTimeout(() => {
      const { filters, cart } = persistence.loadAll();

      if (Object.values(filters).some((v) => v)) {
        onLoadFilters(filters);
      }

      if (cart.length > 0) {
        onLoadCart(cart);
      }

      persistence.setInitialized(true);
    }, 100);

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [persistence, onLoadFilters, onLoadCart]);

  // Auto-save cart when it changes
  useEffect(() => {
    const debounceTimeoutRef = setTimeout(() => {
      const state = persistence.exportState();
      if (state.cart.length > 0) {
        persistence.saveCartToStorage(state.cart);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(debounceTimeoutRef);
  }, [persistence]);

  return persistence;
}

/**
 * Helper to validate cart items before loading
 */
export function validatePOSCartItems(items: any[]): items is PosPageCartItem[] {
  if (!Array.isArray(items)) return false;
  return items.every(
    (item) =>
      item.id &&
      item.productId &&
      item.productName &&
      typeof item.quantity === "number" &&
      typeof item.currentPrice === "number"
  );
}

/**
 * Helper to sanitize filters (remove invalid values)
 */
export function sanitizePOSFilters(filters: any): POSFilterState {
  return {
    search: typeof filters.search === "string" ? filters.search : "",
    categoryId:
      typeof filters.categoryId === "string" ? filters.categoryId : null,
    brandId: typeof filters.brandId === "string" ? filters.brandId : null,
    hasPromotion:
      typeof filters.hasPromotion === "boolean" ? filters.hasPromotion : false,
  };
}

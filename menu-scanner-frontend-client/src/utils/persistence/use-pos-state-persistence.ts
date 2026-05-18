


import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loadPersistedFilters,
  loadPersistedCart,
  setSearchTerm,
  setPromotionFilter,
} from "@/features/business/store/slice/pos-page-slice";
import {
  selectSearchTerm,
  selectPromotionFilter,
  selectCartItems,
} from "@/features/business/store/selectors/pos-page-selector";
import { usePOSPersistence, POSFilterState } from "./use-pos-persistence";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";


interface UsePOSStatePersistenceOptions {


  enableUrlPersistence?: boolean;


  enableCartPersistence?: boolean;


  cartSaveDebounceMs?: number;


  filterSaveDebounceMs?: number;


  onStateLoaded?: (loadedState: { filters: POSFilterState; cart: PosPageCartItem[] }) => void;
}


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


  const initRef = useRef(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout>();
  const cartTimeoutRef = useRef<NodeJS.Timeout>();


  useEffect(() => {
    if (typeof window === "undefined" || initRef.current) return;

    initRef.current = true;

    try {

      if (enableUrlPersistence) {
        const filters = persistence.loadFiltersFromUrl();
        if (Object.values(filters).some((v) => v)) {
          dispatch(loadPersistedFilters(filters));
        }
      }


      if (enableCartPersistence) {
        const cart = persistence.loadCartFromStorage();
        if (cart.length > 0) {
          dispatch(loadPersistedCart(cart));
        }
      }


      if (onStateLoaded) {
        onStateLoaded({
          filters: persistence.loadFiltersFromUrl(),
          cart: persistence.loadCartFromStorage(),
        });
      }

      persistence.setInitialized(true);
    } catch (error) {
      persistence.setInitialized(true);
    }
  }, []);


  useEffect(() => {

    if (!enableUrlPersistence || !persistence.isInitialized || !initRef.current) {
      return;
    }


    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }


    filterTimeoutRef.current = setTimeout(() => {
      try {
        persistence.saveFiltersToUrl({
          search: searchTerm,
          hasPromotion: promotionFilter || false,
        });
      } catch (error) {
      }
    }, filterSaveDebounceMs);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [searchTerm, promotionFilter, enableUrlPersistence, persistence, filterSaveDebounceMs]);


  useEffect(() => {

    if (!enableCartPersistence || !persistence.isInitialized || !initRef.current) {
      return;
    }


    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }


    cartTimeoutRef.current = setTimeout(() => {
      try {
        if (cartItems.length > 0) {
          persistence.saveCartToStorage(cartItems);
        } else {
          persistence.clearCartFromStorage();
        }
      } catch (error) {
      }
    }, cartSaveDebounceMs);

    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
    };
  }, [cartItems, enableCartPersistence, persistence, cartSaveDebounceMs]);


  const clearAllPersistence = useCallback(() => {
    try {
      persistence.clearAll();
    } catch (error) {
    }
  }, [persistence]);

  const clearFilters = useCallback(() => {
    try {
      persistence.clearFiltersInUrl();
      dispatch(setSearchTerm(""));
      dispatch(setPromotionFilter(undefined));
    } catch (error) {
    }
  }, [persistence, dispatch]);

  const clearCart = useCallback(() => {
    try {
      persistence.clearCartFromStorage();
    } catch (error) {
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

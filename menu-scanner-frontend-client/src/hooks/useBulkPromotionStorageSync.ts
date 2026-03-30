/**
 * useBulkPromotionStorageSync Hook
 * Syncs Redux bulk promotion selected products with localStorage
 * Pattern: Same as useLocalStorageSync (POS cart sync)
 * Automatically loads from localStorage on mount and saves on changes
 */

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setSelectedProducts } from "@/redux/features/business/store/slice/bulk-promotion-slice";
import { selectSelectedProductIds } from "@/redux/features/business/store/selectors/bulk-promotion-selector";

interface UseBulkPromotionStorageSyncOptions {
  /**
   * localStorage key name
   * @default "bulk-promotion:selected-products"
   */
  storageKey?: string;

  /**
   * Debounce time before saving (ms)
   * @default 1000
   */
  debounceMs?: number;

  /**
   * Enable/disable sync
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when products loaded from localStorage
   */
  onProductsLoaded?: (productIds: string[]) => void;

  /**
   * Callback when products saved to localStorage
   */
  onProductsSaved?: (productIds: string[]) => void;
}

/**
 * Hook that syncs Redux bulk promotion selections with localStorage
 *
 * Features:
 * - Auto-load selected products from localStorage on mount
 * - Auto-save selected products to localStorage on changes
 * - Debounced saves (prevent excessive writes)
 * - Error handling & validation
 * - Console logging with emojis (like POS)
 * - Works exactly like useLocalStorageSync
 *
 * Usage in component:
 * ```
 * useBulkPromotionStorageSync({
 *   storageKey: "bulk-promotion:selected-products",
 *   debounceMs: 1000,
 *   enabled: true,
 * });
 * ```
 */
export function useBulkPromotionStorageSync(
  options: UseBulkPromotionStorageSyncOptions = {}
) {
  const {
    storageKey = "bulk-promotion:selected-products",
    debounceMs = 1000,
    enabled = true,
    onProductsLoaded,
    onProductsSaved,
  } = options;

  const dispatch = useAppDispatch();
  const selectedProductIds = useAppSelector(selectSelectedProductIds);

  // Track initialization and debouncing
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // ─────────────────────────────────────────────────────────────
  // LOAD from localStorage on mount (ONCE ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log("## [HOOK] Load effect running, enabled:", enabled, "initialized:", isInitializedRef.current);
    if (!enabled || isInitializedRef.current) {
      console.log("## [HOOK] Skipping load - enabled:", enabled, "already initialized:", isInitializedRef.current);
      return;
    }

    isInitializedRef.current = true;
    console.log("## [HOOK] Starting initialization...");

    try {
      const saved = localStorage.getItem(storageKey);
      console.log("## [HOOK] Loaded from localStorage:", saved);

      if (saved) {
        const parsedIds = JSON.parse(saved) as [string, boolean][];

        // Validate data
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          const isValid = parsedIds.every(
            (item) => Array.isArray(item) && item.length === 2 && typeof item[0] === "string"
          );

          if (isValid) {
            const productIds = parsedIds.map((item) => item[0]);
            dispatch(setSelectedProducts(productIds));
            console.log(
              `✅ Loaded ${productIds.length} selected products from localStorage (${storageKey})`
            );

            if (onProductsLoaded) {
              onProductsLoaded(productIds);
            }
          } else {
            console.warn(`⚠️ Invalid product data in localStorage, clearing (${storageKey})`);
            localStorage.removeItem(storageKey);
          }
        }
      } else {
        console.log(`ℹ️ No saved products found in localStorage (${storageKey})`);
      }
    } catch (error) {
      console.error(`❌ Error loading products from localStorage (${storageKey}):`, error);
    }
  }, [enabled, storageKey, dispatch, onProductsLoaded]);

  // ─────────────────────────────────────────────────────────────
  // SAVE to localStorage when selections change (DEBOUNCED)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log("## [HOOK] Save effect triggered, enabled:", enabled, "initialized:", isInitializedRef.current);
    // Don't save if not initialized or disabled
    if (!enabled || !isInitializedRef.current) {
      console.log("## [HOOK] Skipping save - enabled:", enabled, "initialized:", isInitializedRef.current);
      return;
    }

    console.log("## [HOOK] Setting up save debounce for", selectedProductIds.length, "products");

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save
    saveTimeoutRef.current = setTimeout(() => {
      console.log("## [HOOK] Save timeout fired, saving to localStorage");
      try {
        if (selectedProductIds.length > 0) {
          const data = selectedProductIds.map((id) => [id, true]);
          localStorage.setItem(storageKey, JSON.stringify(data));
          const sizeKB = (JSON.stringify(data).length / 1024).toFixed(2);
          console.log(
            `💾 Saved ${selectedProductIds.length} selected products to localStorage (${sizeKB}KB)`
          );

          if (onProductsSaved) {
            onProductsSaved(selectedProductIds);
          }
        } else {
          // Clear if empty
          localStorage.removeItem(storageKey);
          console.log(`🗑️ Cleared empty selection from localStorage`);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "QuotaExceededError") {
            console.error("❌ localStorage quota exceeded! Too many products selected.");
          } else {
            console.error(`❌ Error saving products to localStorage:`, error);
          }
        }
      }
    }, debounceMs);

    console.log("## [HOOK] Debounce timeout set for", debounceMs, "ms");

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedProductIds, enabled, storageKey, debounceMs, onProductsSaved]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  /**
   * Manually clear selections from localStorage
   */
  const clearSelections = () => {
    try {
      localStorage.removeItem(storageKey);
      console.log(`🗑️ Selected products cleared from localStorage`);
    } catch (error) {
      console.error("Error clearing selections:", error);
    }
  };

  /**
   * Get storage info
   */
  const getStorageInfo = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      const sizeBytes = saved ? saved.length : 0;
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(3);

      return {
        selectionSize: sizeBytes,
        selectionSizeMB: sizeMB,
        itemCount: selectedProductIds.length,
        totalStorageLimit: "~10 MB",
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  };

  return {
    isInitialized: isInitializedRef.current,
    itemCount: selectedProductIds.length,
    clearSelections,
    getStorageInfo,
  };
}

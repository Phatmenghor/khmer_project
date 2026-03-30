/**
 * useBulkPromotionStorageSync Hook
 * Syncs selected product IDs with localStorage
 * Similar to POS cart localStorage sync
 */

import { useEffect, useRef } from "react";

interface UseBulkPromotionStorageSyncOptions {
  /**
   * localStorage key name
   * @default "bulk-promotion:selected-products"
   */
  storageKey?: string;

  /**
   * Enable/disable sync
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when products loaded from storage
   */
  onProductsLoaded?: (productIds: string[]) => void;

  /**
   * Callback when products saved to storage
   */
  onProductsSaved?: (productIds: string[]) => void;
}

/**
 * Hook that syncs selected product IDs with localStorage
 *
 * Features:
 * - Auto-load selected products from localStorage on mount
 * - Auto-save selected products to localStorage on changes
 * - Error handling & validation
 * - Console logging with emojis (like POS)
 */
export function useBulkPromotionStorageSync(
  selectedProductIds: Map<string, boolean>,
  options: UseBulkPromotionStorageSyncOptions = {}
) {
  const {
    storageKey = "bulk-promotion:selected-products",
    enabled = true,
    onProductsLoaded,
    onProductsSaved,
  } = options;

  const isInitializedRef = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // LOAD from localStorage on mount (ONCE ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedIds = JSON.parse(saved) as [string, boolean][];

        // Validate data
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          const isValid = parsedIds.every(
            (item) => Array.isArray(item) && item.length === 2 && typeof item[0] === "string"
          );

          if (isValid) {
            const productIds = parsedIds.map((item) => item[0]);
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
  }, [enabled, storageKey, onProductsLoaded]);

  // ─────────────────────────────────────────────────────────────
  // SAVE to localStorage when selections change
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't save if not initialized or disabled
    if (!enabled || !isInitializedRef.current) return;

    try {
      if (selectedProductIds.size > 0) {
        const data = Array.from(selectedProductIds);
        localStorage.setItem(storageKey, JSON.stringify(data));
        const sizeKB = (JSON.stringify(data).length / 1024).toFixed(2);
        console.log(
          `💾 Saved ${selectedProductIds.size} selected products to localStorage (${sizeKB}KB)`
        );

        if (onProductsSaved) {
          onProductsSaved(Array.from(selectedProductIds.keys()));
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
  }, [selectedProductIds, enabled, storageKey, onProductsSaved]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  /**
   * Manually clear selected products from localStorage
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
        itemCount: selectedProductIds.size,
        totalStorageLimit: "~10 MB",
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  };

  return {
    isInitialized: isInitializedRef.current,
    itemCount: selectedProductIds.size,
    clearSelections,
    getStorageInfo,
  };
}

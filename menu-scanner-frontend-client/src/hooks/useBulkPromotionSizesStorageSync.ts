/**
 * useBulkPromotionSizesStorageSync Hook
 * Syncs Redux size selections with localStorage
 * Pattern: Same as useBulkPromotionStorageSync (product sync)
 * Automatically loads from localStorage on mount and saves on changes
 */

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectPromotionSizeSelections } from "@/redux/features/business/store/selectors/promotion-size-selection-selector";
import {
  selectAllSizesForProduct,
  clearAllSizeSelections,
} from "@/redux/features/business/store/slice/promotion-size-selection-slice";

interface UseBulkPromotionSizesStorageSyncOptions {
  /**
   * localStorage key name
   * @default "bulk-promotion:selected-sizes"
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
   * Callback when sizes loaded from localStorage
   */
  onSizesLoaded?: (sizeSelections: Record<string, string[]>) => void;

  /**
   * Callback when sizes saved to localStorage
   */
  onSizesSaved?: (sizeSelections: Record<string, string[]>) => void;
}

/**
 * Hook that syncs Redux size selections with localStorage
 *
 * Features:
 * - Auto-load selected sizes from localStorage on mount
 * - Auto-save selected sizes to localStorage on changes
 * - Debounced saves (prevent excessive writes)
 * - Error handling & validation
 * - Works exactly like useBulkPromotionStorageSync
 *
 * Usage in component:
 * ```
 * useBulkPromotionSizesStorageSync({
 *   storageKey: "bulk-promotion:selected-sizes",
 *   debounceMs: 1000,
 *   enabled: true,
 * });
 * ```
 */
export function useBulkPromotionSizesStorageSync(
  options: UseBulkPromotionSizesStorageSyncOptions = {}
) {
  const {
    storageKey = "bulk-promotion:selected-sizes",
    debounceMs = 1000,
    enabled = true,
    onSizesLoaded,
    onSizesSaved,
  } = options;

  const dispatch = useAppDispatch();
  const selectedSizes = useAppSelector(selectPromotionSizeSelections);

  // Track initialization and debouncing
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // ─────────────────────────────────────────────────────────────
  // LOAD from localStorage on mount (ONCE ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedData = JSON.parse(saved) as Record<string, string[]>;

        // Validate data
        if (
          typeof parsedData === "object" &&
          parsedData !== null &&
          Object.keys(parsedData).length > 0
        ) {
          const isValid = Object.entries(parsedData).every(
            ([productId, sizeIds]) =>
              typeof productId === "string" &&
              Array.isArray(sizeIds) &&
              sizeIds.every((id) => typeof id === "string")
          );

          if (isValid) {
            // Restore each product's sizes
            Object.entries(parsedData).forEach(([productId, sizeIds]) => {
              dispatch(selectAllSizesForProduct({ productId, sizeIds }));
            });

            if (onSizesLoaded) {
              onSizesLoaded(parsedData);
            }
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [enabled, storageKey, dispatch, onSizesLoaded]);

  // ─────────────────────────────────────────────────────────────
  // SAVE to localStorage when selections change (DEBOUNCED)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't save if not initialized or disabled
    if (!enabled || !isInitializedRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const totalItems = Object.values(selectedSizes).reduce(
          (sum, arr) => sum + arr.length,
          0
        );

        if (totalItems > 0) {
          localStorage.setItem(storageKey, JSON.stringify(selectedSizes));

          if (onSizesSaved) {
            onSizesSaved(selectedSizes);
          }
        } else {
          // Clear if empty
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        // Silent error handling
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedSizes, enabled, storageKey, debounceMs, onSizesSaved]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  /**
   * Manually clear size selections from localStorage
   */
  const clearSelections = () => {
    try {
      localStorage.removeItem(storageKey);
      dispatch(clearAllSizeSelections());
      console.log(`🗑️ Selected sizes cleared from localStorage`);
    } catch (error) {
      console.error("Error clearing size selections:", error);
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
      const totalItems = Object.values(selectedSizes).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      return {
        selectionSize: sizeBytes,
        selectionSizeMB: sizeMB,
        itemCount: totalItems,
        totalStorageLimit: "~10 MB",
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  };

  return {
    isInitialized: isInitializedRef.current,
    itemCount: Object.values(selectedSizes).reduce((sum, arr) => sum + arr.length, 0),
    clearSelections,
    getStorageInfo,
  };
}

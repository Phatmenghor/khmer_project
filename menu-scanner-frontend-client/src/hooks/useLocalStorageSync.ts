/**
 * useLocalStorageSync Hook
 * Syncs Redux state with localStorage
 * Automatically saves/loads cart data
 */

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { loadPersistedCart } from "@/redux/features/business/store/slice/pos-page-slice";
import { selectCartItems } from "@/redux/features/business/store/selectors/pos-page-selector";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";

interface UseLocalStorageSyncOptions {
  /**
   * localStorage key name
   * @default "pos:cart"
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
   * Callback when cart loaded
   */
  onCartLoaded?: (items: PosPageCartItem[]) => void;

  /**
   * Callback when cart saved
   */
  onCartSaved?: (items: PosPageCartItem[]) => void;
}

/**
 * Hook that syncs Redux cart state with localStorage
 *
 * Features:
 * - Auto-load cart from localStorage on mount
 * - Auto-save cart to localStorage on changes
 * - Debounced saves (prevent excessive writes)
 * - Error handling & validation
 * - Development logging
 */
export function useLocalStorageSync(
  options: UseLocalStorageSyncOptions = {}
) {
  const {
    storageKey = "pos:cart",
    debounceMs = 1000,
    enabled = true,
    onCartLoaded,
    onCartSaved,
  } = options;

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

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
        const parsedCart = JSON.parse(saved) as PosPageCartItem[];

        // Validate cart data
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Check if items have required fields
          const isValid = parsedCart.every(
            (item) =>
              item.id &&
              item.productId &&
              item.productName &&
              typeof item.quantity === "number" &&
              typeof item.currentPrice === "number"
          );

          if (isValid) {
            dispatch(loadPersistedCart(parsedCart));
            console.log(
              `✅ Loaded ${parsedCart.length} items from localStorage (${storageKey})`
            );

            if (onCartLoaded) {
              onCartLoaded(parsedCart);
            }
          } else {
            console.warn(
              `⚠️ Invalid cart data in localStorage, ignoring (${storageKey})`
            );
            localStorage.removeItem(storageKey);
          }
        }
      } else {
        console.log(`ℹ️ No saved cart found in localStorage (${storageKey})`);
      }
    } catch (error) {
      console.error(
        `❌ Error loading cart from localStorage (${storageKey}):`,
        error
      );
      // Don't crash, just skip loading
    }
  }, [enabled, storageKey, dispatch, onCartLoaded]);

  // ─────────────────────────────────────────────────────────────
  // SAVE to localStorage when cart changes (DEBOUNCED)
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
        if (cartItems.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(cartItems));
          const sizeKB = (JSON.stringify(cartItems).length / 1024).toFixed(2);
          console.log(
            `💾 Saved ${cartItems.length} items to localStorage (${sizeKB}KB)`
          );

          if (onCartSaved) {
            onCartSaved(cartItems);
          }
        } else {
          // Clear if cart is empty
          localStorage.removeItem(storageKey);
          console.log(`🗑️ Cleared empty cart from localStorage`);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "QuotaExceededError") {
            console.error(
              "❌ localStorage quota exceeded! Cart too large to save."
            );
          } else {
            console.error(`❌ Error saving cart to localStorage:`, error);
          }
        }
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, enabled, storageKey, debounceMs, onCartSaved]);

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  /**
   * Manually clear cart from localStorage
   */
  const clearCart = () => {
    try {
      localStorage.removeItem(storageKey);
      console.log(`🗑️ Cart cleared from localStorage`);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  /**
   * Manually save cart immediately (bypass debounce)
   */
  const saveNow = () => {
    try {
      if (cartItems.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
        console.log(`💾 Cart saved immediately (${cartItems.length} items)`);
      }
    } catch (error) {
      console.error("Error saving cart immediately:", error);
    }
  };

  /**
   * Get storage size info
   */
  const getStorageInfo = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      const sizeBytes = saved ? saved.length : 0;
      const sizeMB = sizeBytes / (1024 * 1024);
      const totalSize = new Blob(Object.values(localStorage)).size / (1024 * 1024);

      return {
        cartSize: sizeBytes,
        cartSizeMB: sizeMB.toFixed(3),
        itemCount: cartItems.length,
        totalStorageUsed: totalSize.toFixed(3),
        totalStorageLimit: "~10 MB",
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  };

  /**
   * Export cart to JSON (for backup/sharing)
   */
  const exportCart = () => {
    return {
      items: cartItems,
      exportedAt: new Date().toISOString(),
      itemCount: cartItems.length,
      totalPrice: cartItems.reduce(
        (sum, item) => sum + item.finalPrice * item.quantity,
        0
      ),
    };
  };

  return {
    isInitialized: isInitializedRef.current,
    itemCount: cartItems.length,
    clearCart,
    saveNow,
    getStorageInfo,
    exportCart,
  };
}

/**
 * Simple version with minimal options
 * Use this if you want minimal setup
 */
export function useSimpleLocalStorageSync() {
  return useLocalStorageSync({
    storageKey: "pos:cart",
    debounceMs: 1000,
    enabled: true,
  });
}

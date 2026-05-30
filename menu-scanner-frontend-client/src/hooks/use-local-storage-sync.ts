


import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadPersistedCart } from "@/features/business/store/slice/pos-page-slice";
import { selectCartItems } from "@/features/business/store/selectors/pos-page-selector";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface UseLocalStorageSyncOptions {


  storageKey?: string;


  debounceMs?: number;


  enabled?: boolean;


  onCartLoaded?: (items: PosPageCartItem[]) => void;


  onCartSaved?: (items: PosPageCartItem[]) => void;
}


export function useLocalStorageSync(
  options: UseLocalStorageSyncOptions = {}
) {
  const {
    storageKey = "pos:cart",
    debounceMs = 0,
    enabled = true,
    onCartLoaded,
    onCartSaved,
  } = options;

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);


  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();


  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedCart = JSON.parse(saved) as PosPageCartItem[];


        if (Array.isArray(parsedCart) && parsedCart.length > 0) {

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

            if (onCartLoaded) {
              onCartLoaded(parsedCart);
            }
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {

    }
  }, [enabled, storageKey, dispatch, onCartLoaded]);


  useEffect(() => {

    if (!enabled || !isInitializedRef.current) return;


    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }


    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (cartItems.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(cartItems));
          const sizeKB = (JSON.stringify(cartItems).length / 1024).toFixed(2);

          if (onCartSaved) {
            onCartSaved(cartItems);
          }
        } else {

          localStorage.removeItem(storageKey);
        }
      } catch (error) {

      }
    }, debounceMs);


    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, enabled, storageKey, debounceMs, onCartSaved]);


  const clearCart = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
    }
  };


  const saveNow = () => {
    try {
      if (cartItems.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      }
    } catch (error) {
    }
  };


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
      return null;
    }
  };


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


export function useSimpleLocalStorageSync() {
  return useLocalStorageSync({
    storageKey: "pos:cart",
    debounceMs: 0,
    enabled: true,
  });
}

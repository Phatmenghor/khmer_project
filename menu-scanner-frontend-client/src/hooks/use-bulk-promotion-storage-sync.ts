


import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSelectedProducts } from "@/features/business/store/slice/bulk-promotion-slice";
import { selectSelectedProductIds } from "@/features/business/store/selectors/bulk-promotion-selector";

interface UseBulkPromotionStorageSyncOptions {


  storageKey?: string;


  debounceMs?: number;


  enabled?: boolean;


  onProductsLoaded?: (productIds: string[]) => void;


  onProductsSaved?: (productIds: string[]) => void;
}


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


  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();


  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedIds = JSON.parse(saved) as [string, boolean][];


        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          const isValid = parsedIds.every(
            (item) => Array.isArray(item) && item.length === 2 && typeof item[0] === "string"
          );

          if (isValid) {
            const productIds = parsedIds.map((item) => item[0]);
            dispatch(setSelectedProducts(productIds));

            if (onProductsLoaded) {
              onProductsLoaded(productIds);
            }
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {

    }
  }, [enabled, storageKey, dispatch, onProductsLoaded]);


  useEffect(() => {

    if (!enabled || !isInitializedRef.current) return;


    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }


    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (selectedProductIds.length > 0) {
          const data = selectedProductIds.map((id) => [id, true]);
          localStorage.setItem(storageKey, JSON.stringify(data));

          if (onProductsSaved) {
            onProductsSaved(selectedProductIds);
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
  }, [selectedProductIds, enabled, storageKey, debounceMs, onProductsSaved]);


  const clearSelections = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
    }
  };


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

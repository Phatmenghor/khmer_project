


import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectPromotionSizeSelections } from "@/features/business/store/selectors/promotion-size-selection-selector";
import {
  selectAllSizesForProduct,
  clearAllSizeSelections,
} from "@/features/business/store/slice/promotion-size-selection-slice";

interface UseBulkPromotionSizesStorageSyncOptions {


  storageKey?: string;


  debounceMs?: number;


  enabled?: boolean;


  onSizesLoaded?: (sizeSelections: Record<string, string[]>) => void;


  onSizesSaved?: (sizeSelections: Record<string, string[]>) => void;
}


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


  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();


  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedData = JSON.parse(saved) as Record<string, string[]>;


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

    }
  }, [enabled, storageKey, dispatch, onSizesLoaded]);


  useEffect(() => {

    if (!enabled || !isInitializedRef.current) return;


    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }


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
  }, [selectedSizes, enabled, storageKey, debounceMs, onSizesSaved]);


  const clearSelections = () => {
    try {
      localStorage.removeItem(storageKey);
      dispatch(clearAllSizeSelections());
    } catch (error) {
    }
  };


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

"use client";

import { useRef, useCallback, useEffect } from "react";

const DEBOUNCE_DELAY = 100; // Faster response - prevent rapid successive loads

/**
 * Custom hook for smart pagination with debounce and duplicate prevention
 *
 * Features:
 * - Prevents duplicate fetch requests when scrolling back to same position
 * - Debounces rapid scroll triggers to avoid multiple API calls
 * - Tracks loading state to prevent concurrent requests
 * - Resets on page/URL changes
 *
 * @param onLoadMore - Callback function to fetch next page
 * @param enabled - Whether to enable the hook
 * @param deps - Dependency array to reset on changes
 *
 * @example
 * ```tsx
 * const { handleLoadMore, isLoadingOrPending } = usePaginationLoadMore(
 *   () => dispatch(fetchNextPage()),
 *   hasMore && !isLoading,
 *   [hasMore, isLoading]
 * );
 * ```
 */
export function usePaginationLoadMore(
  onLoadMore: () => void,
  enabled: boolean = true,
  deps: any[] = []
) {
  // Track if a load request is currently in-flight
  const isProcessingRef = useRef(false);

  // Debounce timer to prevent rapid successive calls
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track the last timestamp when a load was triggered
  const lastLoadTimeRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Reset loading state (called when page resets or dependencies change)
   */
  const resetLoadingState = useCallback(() => {
    isProcessingRef.current = false;
    lastLoadTimeRef.current = 0;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Reset state when dependencies change
  useEffect(() => {
    resetLoadingState();
  }, deps);

/**
 * Main load more handler with debounce and duplicate prevention
 * Call this from intersection observer
 *
 * @param onLoadMore - Callback to fetch next page
 * @param onLoadStart - Callback to save scroll position (called BEFORE fetch starts)
 */
const handleLoadMore = useCallback(() => {
  // Check if loading is already in progress
  if (isProcessingRef.current) {
    return;
  }

  // Check if not enabled
  if (!enabled) {
    return;
  }

  // Clear any pending debounce timer
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  // Set new debounce timer to delay the actual fetch
  debounceTimerRef.current = setTimeout(() => {
    // Double-check enabled state before executing
    if (!enabled || isProcessingRef.current) {
      return;
    }

    // Mark as processing BEFORE calling onLoadMore
    // This ensures onLoadStart is called before the API call starts
    isProcessingRef.current = true;
    lastLoadTimeRef.current = Date.now();

    try {
      // IMPORTANT: Call this callback BEFORE onLoadMore to save position
      // before skeletons appear
      onLoadMore();
    } catch (error) {
      console.error("[Pagination] Error in onLoadMore:", error);
      isProcessingRef.current = false;
    }

    // Reset the processing flag after a reasonable timeout
    // This prevents race conditions where the callback hasn't finished
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, DEBOUNCE_DELAY);
}, [onLoadMore, enabled]);

  /**
   * Mark as loading when fetch starts
   * Call this from the thunk to track actual loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    if (!loading) {
      // Reset when loading completes
      isProcessingRef.current = false;
    }
  }, []);

  return {
    handleLoadMore,
    setLoading,
    resetLoadingState,
    isProcessing: isProcessingRef.current,
  };
}

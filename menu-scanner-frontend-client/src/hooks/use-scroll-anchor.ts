import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to maintain scroll position during load more operations
 * MOBILE APP STYLE: Keeps scroll anchored to the SAME skeleton card position
 *
 * When new products load:
 * 1. Skeletons appear while loading
 * 2. User sees placeholder at screen position (e.g., middle of screen)
 * 3. When loading completes, skeleton is replaced with real product
 * 4. Scroll stays at that SAME card position showing the real product
 *
 * @param isLoading - Whether content is currently being loaded
 * @returns Object with containerRef and savePositionNow function
 */
export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef<number | null>(null);
  const firstSkeletonRef = useRef<HTMLElement | null>(null);
  const skeletonOffsetRef = useRef<number | null>(null);

  /**
   * MANUAL save: Call this BEFORE API call starts
   * Saves the exact scroll position that user is at
   */
  const savePositionNow = useCallback(() => {
    if (containerRef.current) {
      // Save exact scroll position before anything changes
      savedScrollYRef.current = window.scrollY;
    }
  }, []);

  /**
   * When loading STARTS, find and save the first skeleton element
   * This is the element that will be visible on screen as user scrolls
   */
  useEffect(() => {
    if (isLoading && savedScrollYRef.current !== null && containerRef.current) {
      // Wait for next frame to ensure skeletons are rendered
      requestAnimationFrame(() => {
        // Find first skeleton element within container
        const skeletonElement = containerRef.current?.querySelector(
          '[class*="skeleton"]'
        ) as HTMLElement;

        if (skeletonElement) {
          firstSkeletonRef.current = skeletonElement;
          // Calculate offset: how far from top of page is the first skeleton?
          // This is what we'll use to keep the same element visible after loading
          skeletonOffsetRef.current = skeletonElement.getBoundingClientRect().top + window.scrollY;
        }
      });
    }
  }, [isLoading]);

  /**
   * When loading COMPLETES, restore scroll to keep same element visible
   * The skeleton is now replaced with real product, but at same position
   */
  useEffect(() => {
    if (!isLoading && savedScrollYRef.current !== null && skeletonOffsetRef.current !== null) {
      requestAnimationFrame(() => {
        // Restore scroll to the same visual position
        // Skeletons are now products, but user sees same card position
        window.scrollTo({
          top: skeletonOffsetRef.current,
          behavior: "instant",
        });

        // Clear for next load cycle
        savedScrollYRef.current = null;
        firstSkeletonRef.current = null;
        skeletonOffsetRef.current = null;
      });
    }
  }, [isLoading]);

  return {
    containerRef,
    savePositionNow, // Call this when fetch starts!
  };
}

/**
 * Alternative hook with manual control for more complex scenarios
 *
 * @example
 * ```tsx
 * const { containerRef, savePosition, restorePosition } = useScrollAnchorManual();
 *
 * const handleLoadMore = async () => {
 *   savePosition();
 *   await fetchMore();
 *   restorePosition();
 * };
 * ```
 */
export function useScrollAnchorManual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number | null>(null);
  const savedHeightRef = useRef<number | null>(null);

  const savePosition = useCallback(() => {
    savedScrollPositionRef.current = window.scrollY;
    if (containerRef.current) {
      savedHeightRef.current = containerRef.current.scrollHeight;
    }
  }, []);

  const restorePosition = useCallback(() => {
    requestAnimationFrame(() => {
      const savedPosition = savedScrollPositionRef.current;
      const savedHeight = savedHeightRef.current;

      if (savedPosition !== null && savedHeight !== null && containerRef.current) {
        const currentHeight = containerRef.current.scrollHeight;
        const heightDifference = currentHeight - savedHeight;

        window.scrollTo({
          top: savedPosition + heightDifference,
          behavior: "instant",
        });
      }

      savedScrollPositionRef.current = null;
      savedHeightRef.current = null;
    });
  }, []);

  return {
    containerRef,
    savePosition,
    restorePosition,
  };
}

import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to maintain scroll position during load more operations
 * CRITICAL: Saves position BEFORE skeletons appear, restores AFTER they're replaced
 *
 * Prevents scroll jumps when new content is loaded (YouTube-like behavior)
 * Keeps viewport showing SAME products while new items append below
 *
 * @param isLoading - Whether content is currently being loaded
 * @returns Object with containerRef and savePositionNow function
 */
export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef<number | null>(null);
  const savedHeightRef = useRef<number | null>(null);

  /**
   * MANUAL save: Call this BEFORE API call starts (before loading state becomes true)
   * This ensures we capture height BEFORE skeletons are added
   */
  const savePositionNow = useCallback(() => {
    if (containerRef.current) {
      savedScrollYRef.current = window.scrollY;
      savedHeightRef.current = containerRef.current.scrollHeight;
    }
  }, []);

  /**
   * AUTO restore: When loading finishes, adjust scroll to keep same products visible
   * Skeletons are replaced with real products, so height increased by new products count
   */
  useEffect(() => {
    // Only restore when loading STOPS (finished fetching)
    if (!isLoading && savedScrollYRef.current !== null && containerRef.current) {
      requestAnimationFrame(() => {
        const savedScrollY = savedScrollYRef.current;
        const savedHeight = savedHeightRef.current;

        if (savedScrollY !== null && savedHeight !== null) {
          const newHeight = containerRef.current?.scrollHeight || 0;
          const heightAdded = newHeight - savedHeight;

          // Scroll down to keep same products visible
          // New products appear below (user can scroll to see them)
          window.scrollTo({
            top: savedScrollY + heightAdded,
            behavior: "instant",
          });

          // Clear for next load cycle
          savedScrollYRef.current = null;
          savedHeightRef.current = null;
        }
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

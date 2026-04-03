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
  const savedHeightBeforeSkeletonsRef = useRef<number | null>(null);
  const heightWithSkeletonsRef = useRef<number | null>(null);

  /**
   * MANUAL save: Call this BEFORE API call starts
   * Captures scroll position only - height will be measured at skeleton render
   */
  const savePositionNow = useCallback(() => {
    if (containerRef.current) {
      savedScrollYRef.current = window.scrollY;
      // Will measure height when skeletons appear
      savedHeightBeforeSkeletonsRef.current = null;
    }
  }, []);

  /**
   * Measure height AFTER skeletons appear but BEFORE restoration
   * This happens after the render with skeletons but before API completes
   */
  useEffect(() => {
    // When loading STARTS and we saved position, measure height with skeletons
    if (isLoading && savedScrollYRef.current !== null && containerRef.current && !savedHeightBeforeSkeletonsRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated with skeletons
      requestAnimationFrame(() => {
        if (containerRef.current) {
          // This height includes skeletons
          heightWithSkeletonsRef.current = containerRef.current.scrollHeight;
        }
      });
    }
  }, [isLoading]);

  /**
   * AUTO restore: When loading finishes, adjust scroll based on final height
   * Account for difference between skeleton placeholder height and real product height
   */
  useEffect(() => {
    // Only restore when loading STOPS (finished fetching)
    if (!isLoading && savedScrollYRef.current !== null && containerRef.current) {
      requestAnimationFrame(() => {
        const savedScrollY = savedScrollYRef.current;
        const heightWithSkeletons = heightWithSkeletonsRef.current;

        if (savedScrollY !== null && heightWithSkeletons !== null) {
          const finalHeight = containerRef.current?.scrollHeight || 0;
          // Only adjust if heights are significantly different
          // (skeletons have different height than final products)
          const heightDifference = finalHeight - heightWithSkeletons;

          if (heightDifference !== 0) {
            window.scrollTo({
              top: savedScrollY + heightDifference,
              behavior: "instant",
            });
          }

          // Clear for next load cycle
          savedScrollYRef.current = null;
          savedHeightBeforeSkeletonsRef.current = null;
          heightWithSkeletonsRef.current = null;
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

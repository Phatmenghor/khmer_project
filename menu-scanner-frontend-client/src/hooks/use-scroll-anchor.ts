import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to maintain scroll position during load more operations
 * Prevents scroll jumps when new content is loaded (YouTube-like behavior)
 *
 * Key: Locks viewport to the SAME product cards user was viewing
 * When new items append below, viewport stays on old products
 *
 * @param isLoading - Whether content is currently being loaded
 * @returns Object with containerRef to wrap products
 *
 * @example
 * ```tsx
 * const { containerRef } = useScrollAnchor(isLoadingMore);
 *
 * <div ref={containerRef}>
 *   {items.map(item => <div key={item.id}>{item.name}</div>)}
 * </div>
 * ```
 */
export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef<number | null>(null);
  const savedContainerTopRef = useRef<number | null>(null);
  const savedContainerHeightRef = useRef<number | null>(null);

  // BEFORE loading: Record current viewport position
  useEffect(() => {
    if (isLoading && savedScrollYRef.current === null && containerRef.current) {
      // Record exact scroll position at moment loading starts
      savedScrollYRef.current = window.scrollY;
      savedContainerTopRef.current = containerRef.current.getBoundingClientRect().top + window.scrollY;
      savedContainerHeightRef.current = containerRef.current.scrollHeight;
    }
  }, [isLoading]);

  // AFTER loading: Restore viewport to exact same position
  // This keeps the same products visible while new ones appear below
  useEffect(() => {
    if (!isLoading && savedScrollYRef.current !== null && containerRef.current) {
      requestAnimationFrame(() => {
        const savedScrollY = savedScrollYRef.current;
        const savedContainerTop = savedContainerTopRef.current;
        const savedHeight = savedContainerHeightRef.current;

        if (savedScrollY !== null && savedContainerTop !== null && savedHeight !== null) {
          const newHeight = containerRef.current?.scrollHeight || 0;
          const heightAdded = newHeight - savedHeight;

          // Adjust scroll position: original position + height of newly added items
          // This keeps the viewport showing the SAME products, with new ones below
          window.scrollTo({
            top: savedScrollY + heightAdded,
            behavior: "instant", // Instant - user shouldn't notice position change
          });
        }

        // Clear for next load cycle
        savedScrollYRef.current = null;
        savedContainerTopRef.current = null;
        savedContainerHeightRef.current = null;
      });
    }
  }, [isLoading]);

  return {
    containerRef,
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

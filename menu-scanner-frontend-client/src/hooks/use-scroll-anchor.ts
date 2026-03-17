import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to maintain scroll position during load more operations
 * Prevents scroll jumps when new content is loaded (YouTube-like behavior)
 *
 * @param isLoading - Whether content is currently being loaded
 * @returns Object with containerRef and anchorRef
 *
 * @example
 * ```tsx
 * const { containerRef, anchorRef } = useScrollAnchor(isLoadingMore);
 *
 * <div ref={containerRef}>
 *   {items.map(item => <div key={item.id}>{item.name}</div>)}
 *   {isLoadingMore && <div ref={anchorRef} />}
 * </div>
 * ```
 */
export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number | null>(null);
  const savedHeightRef = useRef<number | null>(null);

  // Save scroll position before loading starts
  useEffect(() => {
    if (isLoading && !savedScrollPositionRef.current) {
      // Save current scroll position and container height
      savedScrollPositionRef.current = window.scrollY;
      if (containerRef.current) {
        savedHeightRef.current = containerRef.current.scrollHeight;
      }
    }
  }, [isLoading]);

  // Restore scroll position after loading completes
  useEffect(() => {
    if (!isLoading && savedScrollPositionRef.current !== null) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const savedPosition = savedScrollPositionRef.current;
        const savedHeight = savedHeightRef.current;

        if (savedPosition !== null && savedHeight !== null && containerRef.current) {
          const currentHeight = containerRef.current.scrollHeight;
          const heightDifference = currentHeight - savedHeight;

          // Maintain scroll position by adjusting for new content height
          window.scrollTo({
            top: savedPosition + heightDifference,
            behavior: "instant",
          });
        }

        // Clear saved values
        savedScrollPositionRef.current = null;
        savedHeightRef.current = null;
      });
    }
  }, [isLoading]);

  return {
    containerRef,
    anchorRef,
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

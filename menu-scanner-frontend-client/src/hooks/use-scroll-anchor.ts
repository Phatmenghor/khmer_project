import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to maintain scroll position during load more operations
 * PRODUCT KEY ANCHORING: Uses product ID/key to keep scroll focused on same product
 *
 * When new products load:
 * 1. Before fetch, find the last visible product by key
 * 2. Save that product's KEY (not scroll position)
 * 3. Skeletons appear while loading
 * 4. When loading completes, find that product by key and scroll to it
 * 5. User sees: [Product #42] → [Skeletons appear] → [Product #42 still visible]
 *
 * Why this works:
 * - Product keys are stable across renders
 * - Works even if product heights vary
 * - More reliable than Y coordinates
 * - Handles reordering gracefully
 *
 * @param isLoading - Whether content is currently being loaded
 * @returns Object with containerRef and savePositionNow function
 */
export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorProductKeyRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  /**
   * MANUAL save: Call this BEFORE API call starts
   * Finds the last visible product and saves its KEY
   * The key is the unique identifier (e.g., "featured-product-42")
   */
  const savePositionNow = useCallback(() => {
    if (!containerRef.current) return;

    isLoadingRef.current = true;

    // Find all product cards in container
    const productCards = containerRef.current.querySelectorAll('[data-product-key]');
    if (productCards.length === 0) return;

    // Find the last product that's at least partially visible on screen
    let lastVisibleKey: string | null = null;

    productCards.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      // If product is visible on screen (not fully scrolled past)
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        lastVisibleKey = card.getAttribute('data-product-key');
      }
    });

    // Save the last visible product's key
    if (lastVisibleKey) {
      anchorProductKeyRef.current = lastVisibleKey;
    }
  }, []);

  /**
   * When loading COMPLETES, scroll to the anchored product by KEY
   * Even though skeletons were shown, we scroll back to where the product is
   */
  useEffect(() => {
    if (!isLoading && isLoadingRef.current && anchorProductKeyRef.current && containerRef.current) {
      isLoadingRef.current = false;

      requestAnimationFrame(() => {
        // Find the product element by its saved key
        const anchorElement = containerRef.current?.querySelector(
          `[data-product-key="${anchorProductKeyRef.current}"]`
        ) as HTMLElement;

        if (anchorElement) {
          // Scroll to the product element smoothly
          anchorElement.scrollIntoView({
            behavior: "instant",
            block: "start", // Align to top of viewport
          });
        }

        // Clear for next load cycle
        anchorProductKeyRef.current = null;
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

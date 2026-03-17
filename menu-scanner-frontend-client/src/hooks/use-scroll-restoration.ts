/**
 * Scroll Restoration Hook
 * Automatically saves and restores scroll position for a page
 * - On navigation (link click): Restores scroll position (good UX)
 * - On browser refresh (F5): Resets to top (fresh start)
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  useScrollState,
  useScrollPosition,
} from "@/redux/features/main/store/state/scroll-state";

export interface UseScrollRestorationOptions {
  /**
   * Whether to enable scroll restoration for this page
   * @default true
   */
  enabled?: boolean;

  /**
   * Debounce time for saving scroll position (ms)
   * @default 150
   */
  debounceMs?: number;

  /**
   * Whether to restore scroll position on mount
   * @default true
   */
  restoreOnMount?: boolean;

  /**
   * Whether to include search params in the route key
   * Set to false if you want to restore scroll position even when filters change
   * @default false
   */
  includeSearchParams?: boolean;

  /**
   * Custom route key (overrides automatic path generation)
   */
  customKey?: string;

  /**
   * Delay before restoring scroll (useful for waiting for content to load)
   * @default 100
   */
  restoreDelay?: number;
}

/**
 * Detect if the page was loaded via browser refresh (F5) or navigation
 */
function isPageRefresh(): boolean {
  // Check if performance API is available
  if (typeof window === "undefined" || !window.performance) {
    return false;
  }

  // Modern browsers
  const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (navigationEntries.length > 0) {
    return navigationEntries[0].type === "reload";
  }

  // Fallback for older browsers
  const navigation = (performance as any).navigation;
  if (navigation) {
    return navigation.type === 1; // TYPE_RELOAD
  }

  return false;
}

/**
 * Hook for automatic scroll position restoration
 * Smart behavior: Keeps scroll on navigation, resets on browser refresh
 */
export function useScrollRestoration(options: UseScrollRestorationOptions = {}) {
  const {
    enabled = true,
    debounceMs = 150,
    restoreOnMount = true,
    includeSearchParams = false,
    customKey,
    restoreDelay = 100,
  } = options;

  const pathname = usePathname();
  const { saveScrollPosition, setCurrentRoute, clearScrollPosition } = useScrollState();

  const hasMounted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const restoreTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate route key (client-side only; scroll restoration has no SSR concern)
  const search = typeof window !== "undefined" ? window.location.search : "";
  const routeKey = customKey
    ? customKey
    : includeSearchParams && search
    ? `${pathname}${search}`
    : pathname;

  // Get scroll position for this route
  const savedScrollPosition = useScrollPosition(routeKey);

  // Restore scroll on mount (or reset on refresh)
  useEffect(() => {
    if (!enabled || !restoreOnMount || hasMounted.current) return;

    hasMounted.current = true;
    setCurrentRoute(routeKey);

    // Check if it's a browser refresh
    const isRefresh = isPageRefresh();

    if (isRefresh) {
      // Browser refresh - clear scroll and reset to top
      clearScrollPosition(routeKey);
      window.scrollTo({ top: 0, behavior: "auto" });
    } else if (savedScrollPosition > 0) {
      // Navigation - restore scroll position
      restoreTimeoutRef.current = setTimeout(() => {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: "auto",
        });
      }, restoreDelay);
    }

    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
    };
  }, [enabled, restoreOnMount, routeKey, savedScrollPosition, restoreDelay, setCurrentRoute, clearScrollPosition]);

  // Save scroll position on scroll
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const scrollY = window.scrollY;
        saveScrollPosition(routeKey, scrollY);
      }, debounceMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, routeKey, debounceMs, saveScrollPosition]);

  return {
    routeKey,
    scrollPosition: savedScrollPosition,
  };
}

/**
 * Hook for pages that should NOT restore scroll (like detail pages)
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
}

/**
 * Scroll State Hook
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectScrollState,
  selectCurrentRoute,
  selectAllRoutes,
  selectRouteScrollPosition,
  selectHasScrollPosition,
} from "../selectors/scroll-selectors";
import {
  saveScrollPosition,
  restoreScrollPosition,
  setCurrentRoute,
  clearScrollPosition,
  clearAllScrollPositions,
  cleanupScrollPositions,
} from "../slice/scroll-slice";

/**
 * Hook for scroll state management
 *
 * @example
 * ```tsx
 * const { saveScrollPosition, currentRoute } = useScrollState();
 * const scrollPosition = useScrollPosition('/products');
 * const hasScroll = useHasScrollPosition('/products');
 * ```
 */
export const useScrollState = () => {
  const dispatch = useAppDispatch();
  const scrollState = useAppSelector(selectScrollState);
  const currentRoute = useAppSelector(selectCurrentRoute);
  const allRoutes = useAppSelector(selectAllRoutes);

  return {
    // State
    scrollState,
    currentRoute,
    allRoutes,

    // Actions
    saveScrollPosition: (path: string, scrollY: number) =>
      dispatch(saveScrollPosition({ path, scrollY })),
    restoreScrollPosition: (path: string) =>
      dispatch(restoreScrollPosition(path)),
    setCurrentRoute: (path: string) => dispatch(setCurrentRoute(path)),
    clearScrollPosition: (path: string) => dispatch(clearScrollPosition(path)),
    clearAllScrollPositions: () => dispatch(clearAllScrollPositions()),
    cleanupScrollPositions: () => dispatch(cleanupScrollPositions()),

    // Dispatch (for advanced usage)
    dispatch,
  };
};

/**
 * Hook to get scroll position for a specific route
 * Must be called at component top level (React hook)
 *
 * @param path - The route path
 * @returns The scroll position (scrollY value)
 *
 * @example
 * ```tsx
 * const scrollPosition = useScrollPosition('/products');
 * ```
 */
export const useScrollPosition = (path: string) => {
  return useAppSelector((state) => selectRouteScrollPosition(path)(state));
};

/**
 * Hook to check if a route has a saved scroll position
 * Must be called at component top level (React hook)
 *
 * @param path - The route path
 * @returns Whether the route has a saved scroll position
 *
 * @example
 * ```tsx
 * const hasScroll = useHasScrollPosition('/products');
 * ```
 */
export const useHasScrollPosition = (path: string) => {
  return useAppSelector((state) => selectHasScrollPosition(path)(state));
};

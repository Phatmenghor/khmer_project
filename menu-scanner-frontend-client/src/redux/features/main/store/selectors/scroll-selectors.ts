/**
 * Scroll State Selectors
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

/**
 * Select scroll state
 */
export const selectScrollState = (state: RootState) => state.scroll;

/**
 * Select scroll position for a specific route
 */
export const selectRouteScrollPosition = (path: string) =>
  createSelector([selectScrollState], (scrollState) => {
    return scrollState.routes[path]?.scrollY || 0;
  });

/**
 * Select current route
 */
export const selectCurrentRoute = createSelector(
  [selectScrollState],
  (scrollState) => scrollState.currentRoute
);

/**
 * Select all routes
 */
export const selectAllRoutes = createSelector(
  [selectScrollState],
  (scrollState) => scrollState.routes
);

/**
 * Check if route has saved scroll position
 */
export const selectHasScrollPosition = (path: string) =>
  createSelector(
    [selectScrollState],
    (scrollState) => path in scrollState.routes
  );

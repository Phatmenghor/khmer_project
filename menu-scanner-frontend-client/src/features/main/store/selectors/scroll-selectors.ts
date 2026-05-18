


import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";


export const selectScrollState = (state: RootState) => state.scroll;


export const selectRouteScrollPosition = (path: string) =>
  createSelector([selectScrollState], (scrollState) => {
    return scrollState.routes[path]?.scrollY || 0;
  });


export const selectCurrentRoute = createSelector(
  [selectScrollState],
  (scrollState) => scrollState.currentRoute
);


export const selectAllRoutes = createSelector(
  [selectScrollState],
  (scrollState) => scrollState.routes
);


export const selectHasScrollPosition = (path: string) =>
  createSelector(
    [selectScrollState],
    (scrollState) => path in scrollState.routes
  );

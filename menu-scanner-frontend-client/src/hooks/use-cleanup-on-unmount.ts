/**
 * Cleanup Hook
 * Automatically clears Redux state when component unmounts for better performance
 *
 * @example
 * ```tsx
 * import { useCleanupOnUnmount } from '@/hooks/use-cleanup-on-unmount';
 * import { resetState } from '@/redux/features/brand/slice/brand-slice';
 *
 * function BrandPage() {
 *   // Clear brand state when leaving page
 *   useCleanupOnUnmount(resetState);
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/store";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

/**
 * Hook that dispatches cleanup actions when component unmounts
 *
 * @param cleanupActions - Single action or array of actions to dispatch on unmount
 *
 * @example
 * ```tsx
 * // Single action
 * useCleanupOnUnmount(resetBrandState);
 *
 * // Multiple actions
 * useCleanupOnUnmount([resetBrandState, resetCategoryState]);
 * ```
 */
export function useCleanupOnUnmount(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);

  // Update ref if actions change
  useEffect(() => {
    actionsRef.current = cleanupActions;
  }, [cleanupActions]);

  useEffect(() => {
    return () => {
      const actions = Array.isArray(actionsRef.current)
        ? actionsRef.current
        : [actionsRef.current];

      actions.forEach((action) => {
        if (typeof action === "function") {
          // Check if it's an action creator (has a 'type' property when called)
          const result = action();
          if (result && typeof result === "object" && "type" in result) {
            dispatch(result);
          }
        }
      });
    };
  }, [dispatch]);
}

/**
 * Hook that clears state only when navigating away from a specific route pattern
 *
 * @param routePattern - Route pattern to watch (e.g., "/admin", "/products")
 * @param cleanupActions - Actions to dispatch when leaving the route
 *
 * @example
 * ```tsx
 * // Only clear when leaving /admin routes
 * useRouteCleanup('/admin', resetBrandState);
 *
 * // Clear when leaving /products
 * useRouteCleanup('/products', [resetProductState, resetFilterState]);
 * ```
 */
export function useRouteCleanup(
  routePattern: string,
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);
  const routePatternRef = useRef(routePattern);

  // Update refs if they change
  useEffect(() => {
    actionsRef.current = cleanupActions;
    routePatternRef.current = routePattern;
  }, [cleanupActions, routePattern]);

  useEffect(() => {
    return () => {
      // Check if we're navigating away from the route pattern
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith(routePatternRef.current)) {
        const actions = Array.isArray(actionsRef.current)
          ? actionsRef.current
          : [actionsRef.current];

        actions.forEach((action) => {
          if (typeof action === "function") {
            const result = action();
            if (result && typeof result === "object" && "type" in result) {
              dispatch(result);
            }
          }
        });
      }
    };
  }, [dispatch]);
}

/**
 * Hook that clears state when switching between different admin pages
 * Only clears when leaving the ENTIRE admin section, not between admin pages
 *
 * @param cleanupActions - Actions to dispatch when leaving admin area
 *
 * @example
 * ```tsx
 * function BrandPage() {
 *   // Only clears when leaving /admin/* routes entirely
 *   useAdminCleanup(resetBrandState);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAdminCleanup(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  useRouteCleanup("/admin", cleanupActions);
}

/**
 * Hook that clears state when switching between different public pages
 *
 * @param cleanupActions - Actions to dispatch when leaving public area
 *
 * @example
 * ```tsx
 * function ProductsPage() {
 *   usePublicCleanup(resetProductState);
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePublicCleanup(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);

  useEffect(() => {
    actionsRef.current = cleanupActions;
  }, [cleanupActions]);

  useEffect(() => {
    return () => {
      // For public pages, check if navigating to admin
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        const actions = Array.isArray(actionsRef.current)
          ? actionsRef.current
          : [actionsRef.current];

        actions.forEach((action) => {
          if (typeof action === "function") {
            const result = action();
            if (result && typeof result === "object" && "type" in result) {
              dispatch(result);
            }
          }
        });
      }
    };
  }, [dispatch]);
}

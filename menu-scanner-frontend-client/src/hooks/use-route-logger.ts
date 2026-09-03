"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectAllRouteLogs,
  selectCurrentRoute,
  clearRouteLogs,
  logRouteNavigation,
} from "@/store/slices/route-log-slice";
import { RouteLogger } from "@/utils/logging/route-logger";

/**
 * Custom hook for accessing and managing route navigation logs and analytics.
 * Available for use in all components and pages across the client frontend project.
 */
export function useRouteLogger() {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAllRouteLogs);
  const currentRoute = useAppSelector(selectCurrentRoute);

  const logCustomEvent = (pathname: string, metadata?: Record<string, string>) => {
    const fullPath = metadata ? `${pathname}?${new URLSearchParams(metadata).toString()}` : pathname;
    dispatch(
      logRouteNavigation({
        pathname,
        searchParams: metadata || {},
        fullPath,
        source: "CLIENT_NAVIGATION",
      })
    );
  };

  const clearHistory = () => {
    dispatch(clearRouteLogs());
    RouteLogger.clearHistory();
  };

  const getPersistedHistory = () => RouteLogger.getHistory();
  const exportHistoryJson = () => RouteLogger.exportAsJson();

  return {
    logs,
    currentRoute,
    logCustomEvent,
    clearHistory,
    getPersistedHistory,
    exportHistoryJson,
  };
}

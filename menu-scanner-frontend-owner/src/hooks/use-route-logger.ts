"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectAllRouteLogs,
  selectCurrentRoute,
  selectPreviousRoute,
  selectRouteAnalyticsSummary,
  selectFilteredRouteLogs,
  clearRouteLogs,
  logRouteNavigation,
  setRouteFilterSearch,
} from "@/store/slices/route-log-slice";
import { RouteLogger } from "@/utils/logging/route-logger";

/**
 * Custom hook for accessing and managing route navigation logs and analytics.
 * Available for use in all components and pages across the project.
 */
export function useRouteLogger() {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAllRouteLogs);
  const filteredLogs = useAppSelector(selectFilteredRouteLogs);
  const currentRoute = useAppSelector(selectCurrentRoute);
  const previousRoute = useAppSelector(selectPreviousRoute);
  const analytics = useAppSelector(selectRouteAnalyticsSummary);

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
  const filterLogs = (query: string) => dispatch(setRouteFilterSearch(query));

  return {
    logs,
    filteredLogs,
    currentRoute,
    previousRoute,
    analytics,
    logCustomEvent,
    clearHistory,
    getPersistedHistory,
    exportHistoryJson,
    filterLogs,
  };
}

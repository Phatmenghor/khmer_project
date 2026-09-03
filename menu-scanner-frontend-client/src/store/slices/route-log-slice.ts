import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ROUTE_LOG_CONFIG } from "@/constants/app-resource/config/route-log-config";

export interface RouteLogEntry {
  id: string;
  pathname: string;
  searchParams: Record<string, string>;
  fullPath: string;
  fullUrl: string;
  origin: string;
  hostname: string;
  hash: string;
  previousPathname: string | null;
  previousFullUrl: string | null;
  timestamp: string;
  durationMs?: number;
  referrer?: string;
  source: typeof ROUTE_LOG_CONFIG.SOURCES[keyof typeof ROUTE_LOG_CONFIG.SOURCES];
}

interface RouteLogState {
  logs: RouteLogEntry[];
  currentRoute: RouteLogEntry | null;
  previousRoute: RouteLogEntry | null;
  maxLogsLimit: number;
}

const initialState: RouteLogState = {
  logs: [],
  currentRoute: null,
  previousRoute: null,
  maxLogsLimit: ROUTE_LOG_CONFIG.MAX_STORED_REDUX_LOGS,
};

const routeLogSlice = createSlice({
  name: "routeLog",
  initialState,
  reducers: {
    logRouteNavigation: (
      state,
      action: PayloadAction<{
        pathname: string;
        searchParams?: Record<string, string>;
        fullPath: string;
        fullUrl?: string;
        origin?: string;
        hostname?: string;
        hash?: string;
        source?: typeof ROUTE_LOG_CONFIG.SOURCES[keyof typeof ROUTE_LOG_CONFIG.SOURCES];
        referrer?: string;
      }>
    ) => {
      const {
        pathname,
        searchParams = {},
        fullPath,
        fullUrl = typeof window !== "undefined" ? window.location.href : fullPath,
        origin = typeof window !== "undefined" ? window.location.origin : "",
        hostname = typeof window !== "undefined" ? window.location.hostname : "",
        hash = typeof window !== "undefined" ? window.location.hash : "",
        source = ROUTE_LOG_CONFIG.SOURCES.CLIENT_NAVIGATION,
        referrer,
      } = action.payload;

      const now = new Date().toISOString();
      if (
        state.currentRoute &&
        state.currentRoute.fullUrl === fullUrl &&
        new Date(now).getTime() - new Date(state.currentRoute.timestamp).getTime() < 1000
      ) {
        return;
      }

      const newEntry: RouteLogEntry = {
        id: `route_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pathname,
        searchParams,
        fullPath,
        fullUrl,
        origin,
        hostname,
        hash,
        previousPathname: state.currentRoute?.pathname || null,
        previousFullUrl: state.currentRoute?.fullUrl || null,
        timestamp: now,
        referrer: referrer || (typeof document !== "undefined" ? document.referrer : ""),
        source,
      };

      state.previousRoute = state.currentRoute;
      state.currentRoute = newEntry;
      state.logs.unshift(newEntry);

      if (state.logs.length > state.maxLogsLimit) {
        state.logs = state.logs.slice(0, state.maxLogsLimit);
      }
    },
    updateLastRouteDuration: (state, action: PayloadAction<{ durationMs: number }>) => {
      if (state.currentRoute) {
        state.currentRoute.durationMs = action.payload.durationMs;
      }
      if (state.logs.length > 0) {
        state.logs[0].durationMs = action.payload.durationMs;
      }
    },
    clearRouteLogs: (state) => {
      state.logs = [];
      state.currentRoute = null;
      state.previousRoute = null;
    },
  },
});

export const {
  logRouteNavigation,
  updateLastRouteDuration,
  clearRouteLogs,
} = routeLogSlice.actions;

export default routeLogSlice.reducer;

export const selectAllRouteLogs = (state: { routeLog: RouteLogState }) =>
  state.routeLog.logs;

export const selectCurrentRoute = (state: { routeLog: RouteLogState }) =>
  state.routeLog.currentRoute;

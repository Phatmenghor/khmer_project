import { SESSION_STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Centralized Route Logging Configuration Constants (Owner Frontend)
 */
export const ROUTE_LOG_CONFIG = {
  STORAGE_KEY: SESSION_STORAGE_KEYS.ROUTE_HISTORY,
  MAX_SESSION_LOGS: 50,
  MAX_STORED_REDUX_LOGS: 100,
  HEADERS: {
    PATHNAME: "x-route-pathname",
    TIMESTAMP: "x-route-timestamp",
    REQUEST_ID: "x-route-request-id",
  },
  SOURCES: {
    CLIENT_NAVIGATION: "CLIENT_NAVIGATION" as const,
    INITIAL_LOAD: "INITIAL_LOAD" as const,
    MIDDLEWARE: "MIDDLEWARE" as const,
    LINK_CLICK: "LINK_CLICK" as const,
  },
} as const;

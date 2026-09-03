import { RouteLogEntry } from "@/store/slices/route-log-slice";
import { ROUTE_LOG_CONFIG } from "@/constants/app-resource/config/route-log-config";

/**
 * RouteLogger Library
 * Silent utility library for storing and persisting full URL route & link history.
 */
export class RouteLogger {
  static log(entry: RouteLogEntry): void {
    if (typeof window === "undefined") return;

    try {
      const history = this.getHistory();
      const updatedHistory = [entry, ...history].slice(0, ROUTE_LOG_CONFIG.MAX_SESSION_LOGS);
      sessionStorage.setItem(ROUTE_LOG_CONFIG.STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Silent error handling for storage quota limits
    }
  }

  static getHistory(): RouteLogEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const data = sessionStorage.getItem(ROUTE_LOG_CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearHistory(): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(ROUTE_LOG_CONFIG.STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  static exportAsJson(): string {
    return JSON.stringify(this.getHistory(), null, 2);
  }
}

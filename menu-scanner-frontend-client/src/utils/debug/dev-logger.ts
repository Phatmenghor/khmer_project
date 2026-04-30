/**
 * Development-only logger utility
 * All logs only show in development mode, suppressed in production
 * Use this instead of console.log/error/warn for production cleanliness
 */

const isDev = () => {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  return process.env.NEXT_PUBLIC_NODE_ENV === "development";
};

const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

export const devLogger = {
  /**
   * Log development info (blue)
   * Usage: devLogger.info("Processing user data", { userId: 123 })
   */
  info: (message: string, data?: unknown) => {
    if (!isDev()) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors.blue}[${timestamp}] ℹ️ ${message}${colors.reset}`, data || "");
  },

  /**
   * Log successful operations (green)
   * Usage: devLogger.success("Data saved successfully")
   */
  success: (message: string, data?: unknown) => {
    if (!isDev()) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors.green}[${timestamp}] ✅ ${message}${colors.reset}`, data || "");
  },

  /**
   * Log warnings (yellow)
   * Usage: devLogger.warn("Cache miss, fetching fresh data")
   */
  warn: (message: string, data?: unknown) => {
    if (!isDev()) return;
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`${colors.yellow}[${timestamp}] ⚠️ ${message}${colors.reset}`, data || "");
  },

  /**
   * Log errors (red)
   * Usage: devLogger.error("Failed to save data", error)
   */
  error: (message: string, data?: unknown) => {
    if (!isDev()) return;
    const timestamp = new Date().toLocaleTimeString();
    console.error(`${colors.red}[${timestamp}] ❌ ${message}${colors.reset}`, data || "");
  },

  /**
   * Log debug info (gray - verbose)
   * Usage: devLogger.debug("Internal state:", state)
   */
  debug: (message: string, data?: unknown) => {
    if (!isDev()) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors.gray}[${timestamp}] 🐛 ${message}${colors.reset}`, data || "");
  },

  /**
   * Log group for organized output
   * Usage: devLogger.group("API Calls"); devLogger.info("GET /users"); devLogger.groupEnd();
   */
  group: (label: string) => {
    if (!isDev()) return;
    console.group(`${colors.blue}${label}${colors.reset}`);
  },

  groupEnd: () => {
    if (!isDev()) return;
    console.groupEnd();
  },

  /**
   * Log table for structured data
   * Usage: devLogger.table(arrayOfObjects)
   */
  table: (data: unknown) => {
    if (!isDev()) return;
    console.table(data);
  },

  /**
   * Measure performance
   * Usage: devLogger.time("render"); ... devLogger.timeEnd("render");
   */
  time: (label: string) => {
    if (!isDev()) return;
    console.time(label);
  },

  timeEnd: (label: string) => {
    if (!isDev()) return;
    console.timeEnd(label);
  },
};

export default devLogger;

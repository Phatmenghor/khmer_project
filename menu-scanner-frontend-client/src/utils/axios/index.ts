import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getToken,
  getAdminToken,
  getRefreshToken,
  getAdminRefreshToken,
  storeTokens,
  storeAdminTokens,
  clearAllTokens,
  clearAdminTokens,
} from "../local-storage/token";

const getActiveToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  if (isAdminPath()) {
    return getAdminToken();
  }
  return getToken() || getAdminToken();
};

const getActiveRefreshToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  if (isAdminPath()) {
    return getAdminRefreshToken();
  }
  return getRefreshToken() || getAdminRefreshToken();
};

const isAdminUser = (): boolean => {
  if (typeof window === "undefined") return false;

  if (isAdminPath()) {
    return !!getAdminToken();
  }

  return false;
};

const isAdminPath = (): boolean =>
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/admin");
import { toast } from "sonner";

type RequestMetadata = {
  startTime: number;
  requestId: string;
};

declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
    _retry?: boolean;
  }
}

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isBrowser = typeof window !== "undefined";
const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const colors = {
  green: isBrowser ? "color: #4caf50" : "\x1b[32m",
  red: isBrowser ? "color: #f44336" : "\x1b[31m",
  yellow: isBrowser ? "color: #ff9800" : "\x1b[33m",
  blue: isBrowser ? "color: #2196f3" : "\x1b[34m",
  purple: isBrowser ? "color: #9c27b0" : "\x1b[35m",
  cyan: isBrowser ? "color: #00bcd4" : "\x1b[36m",
  reset: isBrowser ? "" : "\x1b[0m",
};

const formatTimestamp = (): string => {
  const now = new Date();
  return (
    now.toISOString().replace("T", " ").replace("Z", "") +
    ` [${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}]`
  );
};

const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

const logger = {
  log: (message: string, data?: unknown, requestId?: string): void => {

    if (isDevelopment) {
      const timestamp = formatTimestamp();
      const logId = requestId ? `[${requestId}] ` : "";
      if (isBrowser) {
      } else {
      }
    }
  },

  success: (message: string, data?: unknown, requestId?: string): void => {

    if (isDevelopment) {
      const timestamp = formatTimestamp();
      const logId = requestId ? `[${requestId}] ` : "";
      if (isBrowser) {
      } else {
      }
    }
  },

  error: (message: string, data?: unknown, requestId?: string): void => {

    const timestamp = formatTimestamp();
    const logId = requestId ? `[${requestId}] ` : "";
    if (isBrowser) {
    }
  },

  warn: (message: string, data?: unknown, requestId?: string): void => {

    const timestamp = formatTimestamp();
    const logId = requestId ? `[${requestId}] ` : "";
    if (isBrowser) {
    } else {
    }
  },

  requestBody: (
    method: string,
    url: string,
    data: unknown,
    requestId?: string
  ): void => {

    const timestamp = formatTimestamp();
    const logId = requestId ? `[${requestId}] ` : "";
    const messagePrefix = `REQUEST BODY [${method.toUpperCase()}] ${url}:`;

    if (isBrowser) {}

    addLogEntry({
      timestamp: timestamp,
      requestId: requestId || "unknown",
      level: "request-body",
      message: `Request Body for ${method.toUpperCase()} ${url}`,
      data: formatRequestData(data),
    });
  },
};

const formatRequestData = (data: unknown): unknown => {
  if (!data) return undefined;

  try {
    const dataStr = JSON.stringify(data);

    if (dataStr.length > 5000) {
      if (Array.isArray(data)) {
        const firstThree = data.slice(0, 3);

        const itemAnalysis = firstThree.map((item) => {
          if (typeof item === "object" && item !== null) {
            return {
              type: Array.isArray(item) ? "Array" : "Object",
              keys: Object.keys(item).length,
              properties:
                Object.keys(item).slice(0, 5).join(", ") +
                (Object.keys(item).length > 5 ? "..." : ""),
            };
          }
          return typeof item;
        });

        return {
          type: "Array",
          length: data.length,
          preview: firstThree,
          itemTypes: itemAnalysis,
          note: `Array truncated (${data.length} items total)`,
        };
      } else if (typeof data === "object" && data !== null) {
        const preview: Record<string, unknown> = {};
        const keys = Object.keys(data as Record<string, unknown>);
        const totalKeys = keys.length;
        const previewKeys = keys.slice(0, 5);

        previewKeys.forEach((key) => {
          preview[key] = (data as Record<string, unknown>)[key];
        });

        const propertyTypes: Record<string, string> = {};
        keys.forEach((key) => {
          const value = (data as Record<string, unknown>)[key];
          if (Array.isArray(value)) {
            propertyTypes[key] = `Array[${value.length}]`;
          } else if (value && typeof value === "object") {
            propertyTypes[key] = `Object{${
              Object.keys(value as object).length
            } props}`;
          } else {
            propertyTypes[key] = typeof value;
          }
        });

        return {
          type: "Object",
          keys: totalKeys,
          preview,
          propertyTypes: Object.fromEntries(
            Object.entries(propertyTypes).slice(0, 10)
          ),
          note: `Object truncated (${totalKeys} properties total)`,
        };
      }
      return `[Large data: ${dataStr.length} characters]`;
    }
    return data;
  } catch (err) {
    return `[Unserializable data: ${(err as Error).message}]`;
  }
};

const createAxiosInstance = (requiresAuth = false): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: requiresAuth ? 300000 : 30000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {

      const requestId = generateRequestId();
      config.metadata = {
        startTime: Date.now(),
        requestId,
      };

      config.headers = config.headers || {};
      config.headers["X-Request-ID"] = requestId;

      if (typeof window !== "undefined") {
        try {
          const rawTableSession = localStorage.getItem("active_table_session");
          if (rawTableSession) {
            const parsedTable = JSON.parse(rawTableSession);
            if (parsedTable?.tableId) {
              config.headers["X-Table-Id"] = parsedTable.tableId;
            }
            if (parsedTable?.tableName) {
              config.headers["X-Table-Name"] = parsedTable.tableName;
            }
          }
        } catch {
          // ignore table header parsing error
        }
      }

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      if (requiresAuth) {
        const token = getActiveToken();

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          logger.warn(
            "No authentication token for protected route",
            undefined,
            requestId
          );
        }
      }

      logger.log(
        `Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: Object.keys(config.headers).reduce((acc, key) => {

            if (key !== "Authorization") {
              acc[key] = config.headers[key];
            } else {
              acc[key] = "[REDACTED]";
            }
            return acc;
          }, {} as Record<string, unknown>),
        },
        requestId
      );

      if (config.data) {

        logger.requestBody(
          config.method || "unknown",
          config.url || "unknown",
          config.data,
          requestId
        );

        if (
          config.method &&
          ["post", "put", "patch", "delete"].includes(
            config.method.toLowerCase()
          )
        ) {

          const dataSize = JSON.stringify(config.data).length;
          logger.log(
            `Mutation operation: ${config.method.toUpperCase()} ${config.url}`,
            {
              payloadSize: `${dataSize} bytes`,
              contentType: config.headers["Content-Type"],
              requestId,
            },
            requestId
          );
        }
      } else {

        if (
          config.method &&
          ["post", "put", "patch"].includes(config.method.toLowerCase())
        ) {
          logger.log(
            `Empty request body for ${config.method.toUpperCase()} ${
              config.url
            }`,
            undefined,
            requestId
          );
        }
      }

      return config;
    },
    (error: unknown) => {

      logger.error("Request Setup Error:", (error as Error).message);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {

      const { startTime, requestId } = response.config.metadata || {
        startTime: Date.now(),
        requestId: "unknown",
      };

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.success(
        `Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          size: JSON.stringify(response.data).length,
        },
        requestId
      );

      if (isDevelopment) {
        const dataSize = JSON.stringify(response.data).length;
        if (dataSize > 10000) {
          logger.log(`Response data (truncated):`, undefined, requestId);

          if (Array.isArray(response.data)) {
            logger.log(
              `Array with ${response.data.length} items. First 2 items:`,
              response.data.slice(0, 2),
              requestId
            );
          }

          else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            const preview: Record<string, unknown> = {};
            const keys = Object.keys(response.data).slice(0, 5);

            keys.forEach((key) => {
              preview[key] = response.data[key];
            });

            if (Object.keys(response.data).length > 5) {
              preview["..."] = `${
                Object.keys(response.data).length - 5
              } more properties`;
            }

            logger.log(`Object data preview:`, preview, requestId);
          }
        } else {
          logger.log(`Response data:`, response.data, requestId);
        }
      }

      return response;
    },
    async (error: unknown) => {
      const err = error as AxiosError;
      const originalRequest = err.config;

      if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {

        if (originalRequest.url?.includes("/api/v1/auth/refresh")) {
          const admin = isAdminUser();
          const hadToken = admin ? !!getAdminToken() : !!getToken();

          if (admin) {
            clearAdminTokens();
          } else {
            clearAllTokens();
          }

          if (typeof window !== "undefined") {
            const isProtected = admin
              ? window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")
              : window.location.pathname.startsWith("/profile");

            if (isProtected && hadToken) {
              toast.error("Session expired. Please login again.");

              setTimeout(() => {
                window.location.href = admin ? "/admin/login" : "/login";

                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }, 1000);
            }
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((refreshError) => {
              return Promise.reject(refreshError);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const admin = isAdminUser();
        const refreshToken = getActiveRefreshToken();

        if (!refreshToken) {
          isRefreshing = false;
          const admin = isAdminUser();
          const hadToken = admin ? !!getAdminToken() : !!getToken();

          if (admin) clearAdminTokens();
          else clearAllTokens();

          if (typeof window !== "undefined") {
            const isProtected = admin
              ? window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")
              : window.location.pathname.startsWith("/profile");

            if (isProtected && hadToken) {
              toast.error("Session expired. Please login again.");

              setTimeout(() => {
                window.location.href = admin ? "/admin/login" : "/login";

                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }, 1000);
            }
          }
          return Promise.reject(error);
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
          const refreshEndpoint = baseUrl ? `${baseUrl}/api/v1/auth/refresh` : "/api/v1/auth/refresh";

          const response = await axios.post(
            refreshEndpoint,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          if (admin) {
            storeAdminTokens(newAccessToken, newRefreshToken);
          } else {
            storeTokens(newAccessToken, newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          logger.success("Token refreshed successfully");
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          const admin = isAdminUser();
          const hadToken = admin ? !!getAdminToken() : !!getToken();

          clearAllTokens();
          clearAdminTokens();

          const friendlyMsg = "Session expired. Please login again.";
          const expiredError = new Error(friendlyMsg);

          if (typeof window !== "undefined") {
            const isProtected = admin
              ? window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")
              : window.location.pathname.startsWith("/profile");

            if (isProtected && hadToken) {
              toast.error(friendlyMsg);

              setTimeout(() => {
                window.location.href = admin ? "/admin/login" : "/login";
              }, 500);
            }
          }
          return Promise.reject(expiredError);
        } finally {
          isRefreshing = false;
        }
      }

      const requestId = err.config?.metadata?.requestId || "unknown";

      const is404ForExpectedEndpoint =
        err.response?.status === 404 &&
        err.config?.url?.includes("/locations/default");

      if (!is404ForExpectedEndpoint) {

        const errorDetails = {
          method: err.config?.method?.toUpperCase(),
          url: err.config?.url,
          status: err.response?.status,
          statusText: err.response?.statusText,
          message: err.message,
        };

        logger.error(`API Error:`, errorDetails, requestId);
      }

      if (err.config?.data && !is404ForExpectedEndpoint) {

        logger.error(
          `Request body for failed request:`,
          formatRequestData(err.config.data),
          requestId
        );

        logger.requestBody(
          err.config.method || "unknown",
          err.config.url || "unknown",
          err.config.data,
          `${requestId}-error`
        );
      }

      if (err.response?.data && !is404ForExpectedEndpoint) {
        const errorResponseData = err.response.data;
        let formattedErrorData;

        if (
          typeof errorResponseData === "object" &&
          errorResponseData !== null
        ) {

          const errorMessage =
            (errorResponseData as { error?: { message?: string } }).error
              ?.message ||
            (errorResponseData as { message?: string }).message ||
            (errorResponseData as { error?: string; message?: string }).error ||
            JSON.stringify(errorResponseData);

          const validationErrors =
            (errorResponseData as { errors?: unknown }).errors ||
            (errorResponseData as { validationErrors?: unknown })
              .validationErrors ||
            (errorResponseData as { fieldErrors?: unknown }).fieldErrors;

          formattedErrorData = {
            errorMessage,
            ...(validationErrors ? { validationErrors } : {}),
            rawError: formatRequestData(errorResponseData),
          };
        } else {
          formattedErrorData = errorResponseData;
        }

        logger.error(`Error response data:`, formattedErrorData, requestId);
      }

      // Normalize error so callers always get a friendly message via err.message
      const status = err.response?.status;
      const rawData = err.response?.data as any;
      const backendMessage =
        rawData?.message ||
        rawData?.error ||
        rawData?.data?.message ||
        null;

      let friendlyMessage: string;
      if (!err.response) {
        friendlyMessage = "Cannot connect to the server. Please check your connection.";
      } else if (status === 403) {
        friendlyMessage = backendMessage || "Access denied. You don't have permission to perform this action.";
      } else if (status === 401) {
        friendlyMessage = backendMessage || "Authentication required. Please sign in.";
      } else if (status === 503 || status === 502) {
        friendlyMessage = backendMessage || "Service unavailable. The server is not reachable. Please try again later.";
      } else if (status === 404) {
        friendlyMessage = backendMessage || "The requested resource was not found.";
      } else if (status === 422 || status === 400) {
        friendlyMessage = backendMessage || "Invalid request. Please check your input.";
      } else if (status && status >= 500) {
        friendlyMessage = backendMessage || "Server error. Please try again later.";
      } else {
        friendlyMessage = backendMessage || err.message || "An unexpected error occurred.";
      }

      (err as any).message = friendlyMessage;
      if (err.response && rawData && typeof rawData === "object") {
        rawData.message = friendlyMessage;
      }

      return Promise.reject(err);
    }
  );

  return axiosInstance;
};

interface LogEntry {
  timestamp: string;
  requestId: string;
  level: string;
  message: string;
  data?: unknown;
}

const memoryLogs: LogEntry[] = [];

export function addLogEntry(entry: LogEntry): void {

  if (!entry.timestamp) {
    entry.timestamp = formatTimestamp();
  }

  memoryLogs.push(entry);

  if (memoryLogs.length > 200) {
    memoryLogs.shift();
  }
}

export function viewLogs(filter?: string): void {
  let logsToDisplay = memoryLogs;

  if (filter) {
    const lcFilter = filter.toLowerCase();
    logsToDisplay = memoryLogs.filter((log) => {
      return (
        log.requestId.toLowerCase().includes(lcFilter) ||
        log.level.toLowerCase().includes(lcFilter) ||
        log.message.toLowerCase().includes(lcFilter) ||
        (typeof log.data === "string" &&
          log.data.toLowerCase().includes(lcFilter))
      );
    });
  }
}

export function viewLogDetails(index: number): void {
}

export function findLogsByRequestId(requestId: string): LogEntry[] {
  return memoryLogs.filter((log) => log.requestId === requestId);
}

export function findRequestBodyLogs(): LogEntry[] {
  return memoryLogs.filter((log) => log.level === "request-body");
}

export function viewRequestBodyLogs(): void {
}

export const axiosClientWithAuth = createAxiosInstance(true);
export const axiosClient = createAxiosInstance(false);

export { logger, formatRequestData };

/**
 * Centralized Storage & Token Keys Configuration (Client Frontend)
 * Consolidates all Cookie, LocalStorage, and SessionStorage keys into a single source of truth.
 */

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "auth-token-client",
  REFRESH_TOKEN: "auth-refresh-token",
  USER_INFO: "user-info",
  ADMIN_ACCESS_TOKEN: "admin-auth-token",
  ADMIN_REFRESH_TOKEN: "admin-auth-refresh-token",
  ADMIN_USER_INFO: "admin-user-info",
} as const;

export const LOCAL_STORAGE_KEYS = {
  THEME: "scanmekh_theme",
  LOCALE: "scanmekh_locale",
  USER_INFO: "scanmekh_user_info",
  BUSINESS_SETTINGS: "scanmekh_business_settings",
  GLOBAL_SETTINGS: "scanmekh_global_settings",
  SUBDOMAIN: "scanmekh_subdomain",
  CART: "scanmekh_cart",
  FAVORITES: "scanmekh_favorites",
  TABLE_QR: "scanmekh_table_qr",
  ORDERS: "scanmekh_orders",
} as const;

export const SESSION_STORAGE_KEYS = {
  ROUTE_HISTORY: "scanmekh_client_route_history",
  TABLE_SESSION: "scanmekh_table_session",
} as const;

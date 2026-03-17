/**
 * Cookie key constants - single source of truth for all cookie names
 */
export const COOKIE_KEYS = {
  // Customer (public) session
  ACCESS_TOKEN: "auth-token-client",
  REFRESH_TOKEN: "auth-refresh-token",
  USER_INFO: "user-info",
  // Admin (business) session — separate keys so the two sessions never collide
  ADMIN_ACCESS_TOKEN: "admin-auth-token",
  ADMIN_REFRESH_TOKEN: "admin-auth-refresh-token",
  ADMIN_USER_INFO: "admin-user-info",
} as const;

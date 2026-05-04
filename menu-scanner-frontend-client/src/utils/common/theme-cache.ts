/**
 * Theme color caching utilities
 * Stores business colors in BOTH localStorage (for instant sync access) and cookies (for persistence)
 * localStorage: Fast synchronous access before React renders (prevents flash)
 * cookie: Persistent storage across tabs/sessions
 */

export interface ThemeCacheData {
  primaryColor: string;
  businessName?: string;
  logoBusinessUrl?: string;
  taxPercentage?: number;
  timestamp: number;
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(cookie.substring(nameEQ.length));
        console.log(`[THEME CACHE] Retrieved cookie ${name}`);
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error(`[THEME CACHE] Error reading cookie ${name}:`, error);
    return null;
  }
}

/**
 * Set cookie with business ID as part of name
 * Cookie name: theme_colors_[businessId]
 */
function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Match auth token cookie pattern with SameSite attribute
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  console.log(`[THEME CACHE] Cookie set: ${name}`);
}

/**
 * Get localStorage item for theme colors
 * localStorage key: theme_colors_[businessId]
 */
function getLocalStorageColors(businessId: string): ThemeCacheData | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const key = `theme_colors_${businessId}`;
    const value = localStorage.getItem(key);
    if (!value) return null;
    console.log(`[THEME CACHE] Retrieved from localStorage: ${key}`);
    return JSON.parse(value) as ThemeCacheData;
  } catch (error) {
    console.error("[THEME CACHE] Error reading from localStorage:", error);
    return null;
  }
}

/**
 * Set localStorage item for theme colors
 * Fast synchronous storage for instant access before React renders
 */
function setLocalStorageColors(businessId: string, data: ThemeCacheData): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const key = `theme_colors_${businessId}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[THEME CACHE] Saved to localStorage: ${key}`);
  } catch (error) {
    console.error("[THEME CACHE] Error writing to localStorage:", error);
  }
}

/**
 * Get cached theme colors for a specific business
 * Tries localStorage first (fast), then falls back to cookies
 */
export function getCachedThemeColors(businessId: string): ThemeCacheData | null {
  try {
    // Try localStorage first (synchronous, fastest)
    const localStorageData = getLocalStorageColors(businessId);
    if (localStorageData) return localStorageData;

    // Fall back to cookie
    const cookieName = `theme_colors_${businessId}`;
    const cookieValue = getCookie(cookieName);
    if (!cookieValue) return null;
    return JSON.parse(cookieValue) as ThemeCacheData;
  } catch (error) {
    console.error("[THEME CACHE] Failed to get theme cache:", error);
    return null;
  }
}

/**
 * Save business settings to BOTH localStorage (instant) and cookie (persistent)
 * This ensures:
 * 1. Instant access via localStorage for sync script to prevent flash
 * 2. Persistent storage via cookie for cross-tab/session persistence
 * 3. All business data cached: colors, name, logo, tax for fast display
 */
export function cacheThemeColors(
  businessId: string,
  colors: {
    primaryColor: string;
    businessName?: string;
    logoBusinessUrl?: string;
    taxPercentage?: number;
  }
): void {
  try {
    const cacheData: ThemeCacheData = {
      primaryColor: colors.primaryColor,
      businessName: colors.businessName,
      logoBusinessUrl: colors.logoBusinessUrl,
      taxPercentage: colors.taxPercentage,
      timestamp: Date.now(),
    };

    // Save to localStorage (instant synchronous access)
    setLocalStorageColors(businessId, cacheData);

    // Save to cookie (persistent across sessions)
    const cookieName = `theme_colors_${businessId}`;
    setCookie(cookieName, JSON.stringify(cacheData), 30);

    console.log(
      `[THEME CACHE] Cached business data for ${businessId} (localStorage + cookie):`,
      {
        primaryColor: colors.primaryColor,
        businessName: colors.businessName,
        logoUrl: colors.logoBusinessUrl,
        taxPercentage: colors.taxPercentage,
      }
    );
  } catch (error) {
    console.error("[THEME CACHE] Failed to cache business data:", error);
  }
}

/**
 * Apply theme colors to DOM as CSS variables
 */
export function applyThemeColors(primaryColor?: string): void {
  const hexToHsl = (hex: string): string => {
    if (!hex) return "";

    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${hue} ${saturation}% ${lightness}%`;
  };

  if (primaryColor) {
    const hsl = hexToHsl(primaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--primary", hsl);
    }
  }
}

/**
 * Get cached business info (name, logo, tax)
 */
export function getCachedBusinessInfo(businessId: string): {
  businessName?: string
  logoBusinessUrl?: string
  taxPercentage?: number
} | null {
  const cached = getCachedThemeColors(businessId);
  if (!cached) return null;
  return {
    businessName: cached.businessName,
    logoBusinessUrl: cached.logoBusinessUrl,
    taxPercentage: cached.taxPercentage,
  };
}

/**
 * Check if cached data differs from current data
 * Compares primary color, business name, logo, and tax percentage
 */
export function hasThemeChanged(
  cached: ThemeCacheData | null,
  current: {
    primaryColor: string;
    businessName?: string;
    logoBusinessUrl?: string;
    taxPercentage?: number;
  }
): boolean {
  if (!cached) return true;
  return (
    cached.primaryColor !== current.primaryColor ||
    cached.businessName !== current.businessName ||
    cached.logoBusinessUrl !== current.logoBusinessUrl ||
    cached.taxPercentage !== current.taxPercentage
  );
}

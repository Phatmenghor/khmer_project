/**
 * Theme color caching utilities
 * Stores business colors in cookies to prevent "flash of default colors" on page refresh
 */

export interface ThemeCacheData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  timestamp: number;
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Set cookie with business ID as part of name
 * Cookie name: theme_colors_[businessId]
 */
function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

/**
 * Get cached theme colors for a specific business
 */
export function getCachedThemeColors(businessId: string): ThemeCacheData | null {
  try {
    const cookieName = `theme_colors_${businessId}`;
    const cookieValue = getCookie(cookieName);
    if (!cookieValue) return null;
    return JSON.parse(cookieValue) as ThemeCacheData;
  } catch (error) {
    console.error("[THEME CACHE] Failed to parse theme cache:", error);
    return null;
  }
}

/**
 * Save theme colors to cookie for a specific business
 */
export function cacheThemeColors(
  businessId: string,
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }
): void {
  try {
    const cookieName = `theme_colors_${businessId}`;
    const cacheData: ThemeCacheData = {
      ...colors,
      timestamp: Date.now(),
    };
    setCookie(cookieName, JSON.stringify(cacheData), 30);
    console.log(
      `[THEME CACHE] Cached colors for business ${businessId}:`,
      colors
    );
  } catch (error) {
    console.error("[THEME CACHE] Failed to cache theme colors:", error);
  }
}

/**
 * Apply theme colors to DOM as CSS variables
 */
export function applyThemeColors(
  primaryColor?: string,
  secondaryColor?: string,
  accentColor?: string
): void {
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

  if (secondaryColor) {
    const hsl = hexToHsl(secondaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--secondary", hsl);
    }
  }

  if (accentColor) {
    const hsl = hexToHsl(accentColor);
    if (hsl) {
      document.documentElement.style.setProperty("--accent", hsl);
    }
  }
}

/**
 * Check if cached colors differ from current colors
 */
export function hasThemeChanged(
  cached: ThemeCacheData | null,
  current: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }
): boolean {
  if (!cached) return true;
  return (
    cached.primaryColor !== current.primaryColor ||
    cached.secondaryColor !== current.secondaryColor ||
    cached.accentColor !== current.accentColor
  );
}

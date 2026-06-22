


export interface ThemeCacheData {
  businessName?: string;
  logoBusinessUrl?: string;
  taxPercentage?: number;
  timestamp: number;
}


function getLocalStorageColors(businessId: string): ThemeCacheData | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const key = `theme_colors_${businessId}`;
    const value = localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as ThemeCacheData;
  } catch (error) {
    return null;
  }
}


function setLocalStorageColors(businessId: string, data: ThemeCacheData): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const key = `theme_colors_${businessId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
}


export function getCachedThemeColors(businessId: string): ThemeCacheData | null {
  return getLocalStorageColors(businessId);
}


export function cacheThemeColors(
  businessId: string,
  colors: {
    businessName?: string;
    logoBusinessUrl?: string;
    taxPercentage?: number;
  }
): void {
  try {
    const cacheData: ThemeCacheData = {
      businessName: colors.businessName,
      logoBusinessUrl: colors.logoBusinessUrl,
      taxPercentage: colors.taxPercentage,
      timestamp: Date.now(),
    };


    setLocalStorageColors(businessId, cacheData);
  } catch (error) {
  }
}


// Primary color is now fixed in CSS — this function is kept for compatibility but does nothing
export function applyThemeColors(_primaryColor?: string): void {
  // No-op: color is fixed via CSS variables in globals.css
}


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


export function hasThemeChanged(
  cached: ThemeCacheData | null,
  current: {
    businessName?: string;
    logoBusinessUrl?: string;
    taxPercentage?: number;
  }
): boolean {
  if (!cached) return true;
  return (
    cached.businessName !== current.businessName ||
    cached.logoBusinessUrl !== current.logoBusinessUrl ||
    cached.taxPercentage !== current.taxPercentage
  );
}

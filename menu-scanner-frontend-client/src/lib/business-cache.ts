/**
 * Typed reader/writer for the brand/theme cache that was previously
 * stashed on `window.__cachedBusinessData`. The cache survives across
 * page loads via localStorage and a same-site cookie, so the navbar /
 * footer / sidebar can show the right brand on hydration before Redux
 * has loaded the business settings.
 *
 * Redux remains the source of truth — these helpers are a hydration
 * fallback only. Once `business-settings/fulfilled` runs, the live
 * Redux values win in the components.
 */

import { AppDefault } from "@/constants/app-resource/default/default";

export interface BusinessCacheData {
  businessName?: string;
  logoBusinessUrl?: string;
  primaryColor?: string;
  taxPercentage?: number;
}

const CACHE_KEY_PREFIX = "theme_colors_";

function getBusinessId(): string {
  return AppDefault.BUSINESS_ID;
}

function readFromLocalStorage(bid: string): BusinessCacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + bid);
    if (!raw) return null;
    return JSON.parse(raw) as BusinessCacheData;
  } catch {
    return null;
  }
}

function readFromCookie(bid: string): BusinessCacheData | null {
  if (typeof document === "undefined") return null;
  try {
    const prefix = CACHE_KEY_PREFIX + bid + "=";
    const cookies = document.cookie.split(";");
    for (const raw of cookies) {
      const cookie = raw.trim();
      if (cookie.startsWith(prefix)) {
        const value = decodeURIComponent(cookie.substring(prefix.length));
        return JSON.parse(value) as BusinessCacheData;
      }
    }
  } catch {
    // fall through
  }
  return null;
}

export function readBusinessCache(): BusinessCacheData | null {
  if (typeof window === "undefined") return null;
  const bid = getBusinessId();
  return readFromLocalStorage(bid) ?? readFromCookie(bid);
}

export function writeBusinessCache(data: BusinessCacheData): void {
  if (typeof window === "undefined") return;
  try {
    const bid = getBusinessId();
    localStorage.setItem(CACHE_KEY_PREFIX + bid, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private mode, quota); ignore.
  }
}

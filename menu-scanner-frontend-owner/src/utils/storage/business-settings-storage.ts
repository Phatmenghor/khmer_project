import { BusinessSettingsResponse } from "@/features/business/store/services/business-settings-api";

const STORAGE_KEY = "business_settings_cache";
const HASH_KEY = "business_settings_hash";
const TIMESTAMP_KEY = "business_settings_timestamp";

interface CachedBusinessSettings {
  data: BusinessSettingsResponse;
  hash: string;
  timestamp: number;
}

export const businessSettingsStorage = {

  getCached: (): CachedBusinessSettings | null => {
    try {
      if (typeof window === "undefined") return null;

      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      return JSON.parse(cached) as CachedBusinessSettings;
    } catch (error) {
      return null;
    }
  },


  setCached: (data: BusinessSettingsResponse, hash: string): void => {
    try {
      if (typeof window === "undefined") return;

      const cached: CachedBusinessSettings = {
        data,
        hash,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
    } catch (error) {
    }
  },


  getStoredHash: (): string | null => {
    try {
      if (typeof window === "undefined") return null;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached) as CachedBusinessSettings;
      return parsed.hash;
    } catch (error) {
      return null;
    }
  },


  getCacheTimestamp: (): number => {
    try {
      if (typeof window === "undefined") return 0;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return 0;
      const parsed = JSON.parse(cached) as CachedBusinessSettings;
      return parsed.timestamp;
    } catch (error) {
      return 0;
    }
  },


  clearCache: (): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
    }
  },


  isCacheValid: (maxAgeMs: number = 3600000): boolean => {
    const timestamp = businessSettingsStorage.getCacheTimestamp();
    if (!timestamp) return false;
    return Date.now() - timestamp < maxAgeMs;
  },
};

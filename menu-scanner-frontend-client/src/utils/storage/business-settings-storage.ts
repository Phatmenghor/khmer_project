import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-api";

const STORAGE_KEY = "business_settings_cache";
const HASH_KEY = "business_settings_hash";
const TIMESTAMP_KEY = "business_settings_timestamp";

interface CachedBusinessSettings {
  data: BusinessSettingsResponse;
  hash: string;
  timestamp: number;
}

export const businessSettingsStorage = {
  // Get cached settings from localStorage
  getCached: (): CachedBusinessSettings | null => {
    try {
      if (typeof window === "undefined") return null;

      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      return JSON.parse(cached) as CachedBusinessSettings;
    } catch (error) {
      console.error("Error reading business settings from storage:", error);
      return null;
    }
  },

  // Save settings to localStorage
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
      console.error("Error saving business settings to storage:", error);
    }
  },

  // Get stored hash for change detection
  getStoredHash: (): string | null => {
    try {
      if (typeof window === "undefined") return null;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached) as CachedBusinessSettings;
      return parsed.hash;
    } catch (error) {
      console.error("Error reading stored hash:", error);
      return null;
    }
  },

  // Get cache timestamp
  getCacheTimestamp: (): number => {
    try {
      if (typeof window === "undefined") return 0;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return 0;
      const parsed = JSON.parse(cached) as CachedBusinessSettings;
      return parsed.timestamp;
    } catch (error) {
      console.error("Error reading cache timestamp:", error);
      return 0;
    }
  },

  // Clear cached settings
  clearCache: (): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing business settings cache:", error);
    }
  },

  // Check cache age (for monitoring, not for validation)
  getCacheAge: (): number => {
    const timestamp = businessSettingsStorage.getCacheTimestamp();
    if (!timestamp) return -1;
    return Date.now() - timestamp;
  },
};

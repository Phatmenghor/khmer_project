import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchBusinessSettingsByBusinessId,
  BusinessSettingsResponse,
  generateBusinessSettingsHash,
} from "@/features/business/store/services/business-settings-service";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import defaultSettings from "@/constants/defaults/business-settings-default.json";

interface UseBusinessSettingsCacheOptions {
  businessId?: string;
  onSettingsUpdate?: (settings: BusinessSettingsResponse) => void;
  cacheDurationMs?: number; // Default 1 hour
}

export const useBusinessSettingsCache = ({
  businessId,
  onSettingsUpdate,
  cacheDurationMs = 3600000,
}: UseBusinessSettingsCacheOptions = {}) => {
  const initialLoadRef = useRef(false);
  const apiCallInProgressRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initial loads
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const initializeSettings = async () => {
      try {
        // Step 1: Try to get from localStorage (instant)
        const cached = businessSettingsStorage.getCached();
        if (cached?.data) {
        } else {
          // Step 2: If no cache, use default
        }

        // Step 3: If we have a businessId and cache is old, fetch from API
        if (businessId && !apiCallInProgressRef.current) {
          const isCacheValid = businessSettingsStorage.isCacheValid(cacheDurationMs);

          if (!isCacheValid || !cached?.data) {
            apiCallInProgressRef.current = true;

            try {
              const freshSettings = await fetchBusinessSettingsByBusinessId(businessId);
              const newHash = generateBusinessSettingsHash(freshSettings);
              const storedHash = businessSettingsStorage.getStoredHash();

              // Step 4: Compare hashes to detect changes
              if (newHash !== storedHash) {
                businessSettingsStorage.setCached(freshSettings, newHash);
                onSettingsUpdate?.(freshSettings);
              } else {
              }
            } catch (error) {

              // Keep using cached or default settings on error
              if (!cached?.data) {
              }
            } finally {
              apiCallInProgressRef.current = false;
            }
          }
        }
      } catch (error) {
      }
    };

    initializeSettings();
  }, [businessId, cacheDurationMs, onSettingsUpdate]);

  const settings = getBusinessSettingsSync();

  return {
    settings,
    isLoading: false,
    error: null,
  };
};

// Helper to get business settings for use outside of React components
export const getBusinessSettingsSync = (): BusinessSettingsResponse => {
  try {
    const cached = businessSettingsStorage.getCached();
    return cached?.data || (defaultSettings as BusinessSettingsResponse);
  } catch {
    return defaultSettings as BusinessSettingsResponse;
  }
};

// Helper to clear business settings cache
export const clearBusinessSettingsCache = (): void => {
  businessSettingsStorage.clearCache();
};

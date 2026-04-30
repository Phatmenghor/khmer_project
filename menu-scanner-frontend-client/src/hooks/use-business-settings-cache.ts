import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchBusinessSettingsByBusinessId,
  BusinessSettingsResponse,
  generateBusinessSettingsHash,
} from "@/redux/features/business/store/services/business-settings-service";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import defaultSettings from "@/constants/defaults/business-settings-default.json";

interface UseBusinessSettingsCacheOptions {
  businessId?: string;
  onSettingsUpdate?: (settings: BusinessSettingsResponse) => void;
}

export const useBusinessSettingsCache = ({
  businessId,
  onSettingsUpdate,
}: UseBusinessSettingsCacheOptions = {}) => {
  const initialLoadRef = useRef(false);
  const apiCallInProgressRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initial loads
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const initializeSettings = async () => {
      try {
        // Step 1: Load from localStorage immediately (instant)
        const cached = businessSettingsStorage.getCached();
        if (cached?.data) {
          console.log("✅ Business settings loaded from cache (instant)");
        } else {
          console.log("📋 Using default business settings");
        }

        // Step 2: Verify with API in background (no waiting)
        if (businessId && !apiCallInProgressRef.current) {
          apiCallInProgressRef.current = true;

          try {
            const freshSettings = await fetchBusinessSettingsByBusinessId(businessId);
            const newHash = generateBusinessSettingsHash(freshSettings);
            const storedHash = businessSettingsStorage.getStoredHash();

            // Step 3: Compare hashes to detect changes
            if (newHash !== storedHash) {
              console.log("🔄 Business settings updated from API");
              businessSettingsStorage.setCached(freshSettings, newHash);
              onSettingsUpdate?.(freshSettings);
            } else {
              console.log("✓ No changes - cache still valid");
            }
          } catch (error) {
            console.error("⚠️ Background API verification failed:", error);
            // Keep using cached settings on error
          } finally {
            apiCallInProgressRef.current = false;
          }
        }
      } catch (error) {
        console.error("Error initializing business settings:", error);
      }
    };

    initializeSettings();
  }, [businessId, onSettingsUpdate]);

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

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
  cacheDurationMs?: number;
}

export const useBusinessSettingsCache = ({
  businessId,
  onSettingsUpdate,
  cacheDurationMs = 3600000,
}: UseBusinessSettingsCacheOptions = {}) => {
  const initialLoadRef = useRef(false);
  const apiCallInProgressRef = useRef(false);

  useEffect(() => {

    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const initializeSettings = async () => {
      try {

        const cached = businessSettingsStorage.getCached();
        if (cached?.data) {
        } else {

        }


        if (businessId && !apiCallInProgressRef.current) {
          const isCacheValid = businessSettingsStorage.isCacheValid(cacheDurationMs);

          if (!isCacheValid || !cached?.data) {
            apiCallInProgressRef.current = true;

            try {
              const freshSettings = await fetchBusinessSettingsByBusinessId(businessId);
              const newHash = generateBusinessSettingsHash(freshSettings);
              const storedHash = businessSettingsStorage.getStoredHash();


              if (newHash !== storedHash) {
                businessSettingsStorage.setCached(freshSettings, newHash);
                onSettingsUpdate?.(freshSettings);
              } else {
              }
            } catch (error) {

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


export const getBusinessSettingsSync = (): BusinessSettingsResponse => {
  try {
    const cached = businessSettingsStorage.getCached();
    return cached?.data || (defaultSettings as BusinessSettingsResponse);
  } catch {
    return defaultSettings as BusinessSettingsResponse;
  }
};


export const clearBusinessSettingsCache = (): void => {
  businessSettingsStorage.clearCache();
};

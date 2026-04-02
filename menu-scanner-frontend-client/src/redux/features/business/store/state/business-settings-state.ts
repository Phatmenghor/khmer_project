import { BusinessSettingsResponse } from "../services/business-settings-service";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export interface BusinessSettingsState {
  data: BusinessSettingsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const initialBusinessSettingsState: BusinessSettingsState = {
  data: null,
  isLoading: false,
  error: null,
};

/**
 * Business Settings API Service
 * Handles API calls for business settings endpoints
 */

import { axiosInstance } from "@/utils/axios/axios-instance";
import { BusinessSettingsResponse } from "../models/response/business-settings-response";

const API_BASE_URL = "/api/v1/business-settings";

/**
 * Fetch current business settings
 * GET /api/v1/business-settings/current
 */
export const getBusinessSettingsService = async (): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosInstance.get<BusinessSettingsResponse>(
      `${API_BASE_URL}/current`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching business settings:", error);
    throw error;
  }
};

/**
 * Update business settings
 * PUT /api/v1/business-settings
 */
export const updateBusinessSettingsService = async (
  settings: Partial<BusinessSettingsResponse>
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosInstance.put<BusinessSettingsResponse>(
      API_BASE_URL,
      settings
    );
    return response.data;
  } catch (error) {
    console.error("Error updating business settings:", error);
    throw error;
  }
};

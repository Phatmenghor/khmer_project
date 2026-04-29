/**
 * Business Settings API Service
 * Handles API calls for business settings endpoints
 */

import { axiosClient, axiosClientWithAuth } from "@/utils/axios";

export interface SocialMedia {
  name: string;
  linkUrl: string;
}

export interface BusinessHours {
  day: string;
  openingTime: string;
  closingTime: string;
}

export interface BusinessSettingsResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  taxPercentage: number | null;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
  primaryColor?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessHours?: BusinessHours[];
}

export interface UpdateBusinessSettingsRequest {
  businessName?: string;
  taxPercentage?: number | null;
  logoBusinessUrl?: string;
  enableStock?: "ENABLED" | "DISABLED";
  socialMedia?: SocialMedia[];
  primaryColor?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessHours?: BusinessHours[];
}

const API_BASE_URL = "/api/v1/business-settings";

/**
 * Fetch current business settings (Authenticated)
 * Gets complete business settings including tax percentage
 * GET /api/v1/business-settings/current
 *
 * Used for:
 * - Loading business settings in admin (POS)
 * - Getting tax percentage, colors, logo, all config
 * - Requires authentication
 *
 * @returns Complete business settings response
 */
export const fetchCurrentBusinessSettings = async (): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.get<{ data: BusinessSettingsResponse }>(
      `/api/v1/business-settings/current`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching current business settings:", error);
    throw error;
  }
};

/**
 * Fetch business settings by business ID (Public - No Auth Required)
 * Fetches business theme colors, logo, and business name
 * GET /api/v1/public/business-settings/{businessId}
 *
 * Used for:
 * - Loading business theme on app startup
 * - Displaying business branding (logo, colors, name)
 * - Guest users and public pages
 *
 * @param businessId - The business ID to fetch settings for
 * @returns Business settings response with theme colors and branding info
 */
export const fetchBusinessSettingsByBusinessId = async (
  businessId: string
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClient.get<{ data: BusinessSettingsResponse }>(
      `/api/v1/public/business-settings/${businessId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching business settings for ${businessId}:`, error);
    throw error;
  }
};

/**
 * Update current business settings
 * PUT /api/v1/business-settings
 */
export const updateCurrentBusinessSettings = async (
  request: UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.put<{ data: BusinessSettingsResponse }>(
      API_BASE_URL,
      request
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating current business settings:", error);
    throw error;
  }
};

/**
 * Update business settings by business ID
 * PUT /api/v1/business-settings/business/{businessId}
 */
export const updateBusinessSettingsByBusinessId = async (
  businessId: string,
  request: UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.put<{ data: BusinessSettingsResponse }>(
      `${API_BASE_URL}/business/${businessId}`,
      request
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating business settings for ${businessId}:`, error);
    throw error;
  }
};

/**
 * Create business settings
 * POST /api/v1/business-settings
 */
export const createBusinessSettings = async (
  request: {
    businessId: string;
  } & UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.post<{ data: BusinessSettingsResponse }>(
      API_BASE_URL,
      request
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating business settings:", error);
    throw error;
  }
};

/**
 * Delete business settings
 * DELETE /api/v1/business-settings/business/{businessId}
 */
export const deleteBusinessSettings = async (businessId: string): Promise<void> => {
  try {
    await axiosClientWithAuth.delete(`${API_BASE_URL}/business/${businessId}`);
  } catch (error) {
    console.error(`Error deleting business settings for ${businessId}:`, error);
    throw error;
  }
};

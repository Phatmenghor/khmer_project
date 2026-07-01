import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";

export interface SocialMedia {
  name: string;
  linkUrl: string;
  image?: ImageUrls;
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
  logoBusiness?: ImageUrls;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessHours?: BusinessHours[];
  useSubcategories?: boolean;
  useBrands?: boolean;
  lowStockThreshold?: number;
  telegramGroupChatId?: string;
}

export interface UpdateBusinessSettingsRequest {
  businessName?: string;
  taxPercentage?: number | null;
  logoBusiness?: ImageUrls;
  enableStock?: "ENABLED" | "DISABLED";
  socialMedia?: SocialMedia[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessHours?: BusinessHours[];
  useSubcategories?: boolean;
  useBrands?: boolean;
  lowStockThreshold?: number;
  telegramGroupChatId?: string | null;
}

const API_BASE_URL = "/api/v1/business-settings";


export const fetchCurrentBusinessSettings = async (): Promise<BusinessSettingsResponse> => {
  const response = await axiosClientWithAuth.get<{ data: BusinessSettingsResponse }>(
    `/api/v1/business-settings/current`,
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    }
  );
  return response.data.data;
};


const activePromises = new Map<string, Promise<BusinessSettingsResponse>>();

export const fetchBusinessSettingsByBusinessId = async (
  businessId: string
): Promise<BusinessSettingsResponse> => {
  const key = `fetch_settings_${businessId}`;
  if (activePromises.has(key)) {
    return activePromises.get(key)!;
  }

  const promise = (async () => {
    try {
      const response = await axiosClient.get<{ data: BusinessSettingsResponse }>(
        `/api/v1/public/business-settings/${businessId}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        }
      );
      return response.data.data;
    } finally {
      activePromises.delete(key);
    }
  })();

  activePromises.set(key, promise);
  return promise;
};


export const generateBusinessSettingsHash = (settings: BusinessSettingsResponse): string => {
  const hashString = JSON.stringify({
    id: settings.id,
    logoBusiness: settings.logoBusiness?.sm,
    businessName: settings.businessName,
    taxPercentage: settings.taxPercentage,
    updatedAt: settings.updatedAt,
  });

  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};


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
    throw error;
  }
};


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
    throw error;
  }
};


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
    throw error;
  }
};


export const deleteBusinessSettings = async (businessId: string): Promise<void> => {
  try {
    await axiosClientWithAuth.delete(`${API_BASE_URL}/business/${businessId}`);
  } catch (error) {
    throw error;
  }
};

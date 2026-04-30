import { API_BASE_URL } from "@/constants/api-base-url";

export interface BusinessSettingsResponse {
  id: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessCity?: string;
  businessProvince?: string;
  businessCountry?: string;
  businessLatitude?: number;
  businessLongitude?: number;
  logoBusinessUrl?: string;
  coverBusinessUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  mutedColor?: string;
  taxPercentage?: number;
  deliveryFeeDefault?: number;
  currency?: string;
  currencySymbol?: string;
  timezone?: string;
  locale?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  settingsVersion?: string;
}

export const businessSettingsApi = {
  fetchBusinessSettings: async (businessId: string): Promise<BusinessSettingsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/business-settings/business/${businessId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch business settings: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching business settings:", error);
      throw error;
    }
  },

  // Generate a hash of settings for change detection
  generateSettingsHash: (settings: BusinessSettingsResponse): string => {
    const hashString = JSON.stringify({
      id: settings.id,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      backgroundColor: settings.backgroundColor,
      textColor: settings.textColor,
      borderColor: settings.borderColor,
      successColor: settings.successColor,
      warningColor: settings.warningColor,
      errorColor: settings.errorColor,
      infoColor: settings.infoColor,
      mutedColor: settings.mutedColor,
      logoBusinessUrl: settings.logoBusinessUrl,
      coverBusinessUrl: settings.coverBusinessUrl,
      businessName: settings.businessName,
      taxPercentage: settings.taxPercentage,
      deliveryFeeDefault: settings.deliveryFeeDefault,
      updatedAt: settings.updatedAt,
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },
};

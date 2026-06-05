import { axiosClient } from "@/utils/axios";

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
  fetchBusinessSettings: async (
    businessId: string
  ): Promise<BusinessSettingsResponse> => {
    const response = await axiosClient.get<{
      data?: BusinessSettingsResponse;
    } & Partial<BusinessSettingsResponse>>(
      `/api/v1/public/business-settings/${businessId}`
    );
    return (response.data.data ?? (response.data as BusinessSettingsResponse));
  },


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


    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },
};

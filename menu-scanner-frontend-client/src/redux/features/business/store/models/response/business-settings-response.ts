/**
 * Business Settings Response Model
 * Response from /api/v1/business-settings/current
 */

export type StockStatus = "ENABLED" | "DISABLED";

export interface SocialMedia {
  name: string;
  linkUrl: string;
}

export interface BusinessHours {
  id?: string;
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
  enableStock: StockStatus;
  socialMedia: SocialMedia[];
  primaryColor?: string;
  // Contact Information
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  // Business Hours
  businessHours?: BusinessHours[];
  // Feature Flags
  useCategories?: boolean;
  useSubcategories?: boolean;
  useBrands?: boolean;
}

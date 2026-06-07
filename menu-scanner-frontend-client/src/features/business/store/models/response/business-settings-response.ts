
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export type StockStatus = "ENABLED" | "DISABLED";

export interface SocialMedia {
  name: string;
  linkUrl: string;
  image?: ImageUrls;
}

export interface BusinessHours {
  id?: string;
  day: string;
  openTime: string;
  closeTime: string;
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
  enableStock: StockStatus;
  socialMedia: SocialMedia[];
  primaryColor?: string;

  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;

  businessHours?: BusinessHours[];

  useSubcategories?: boolean;
  useBrands?: boolean;
  lowStockThreshold?: number;
  telegramGroupChatId?: string;
}

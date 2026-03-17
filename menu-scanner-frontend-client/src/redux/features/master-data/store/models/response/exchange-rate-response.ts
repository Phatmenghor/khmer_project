import { BasePagination } from "@/utils/common/pagination";

export interface AllExchangeRateResponseModel extends BasePagination {
  content: ExchangeRateResponseModel[];
}

export interface ExchangeRateResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  usdToKhrRate: number;
  formattedKhrRate: string;
  usdToCnyRate: number;
  formattedCnyRate: string;
  usdToThbRate: any;
  formattedThbRate: string;
  usdToVndRate: any;
  formattedVndRate: string;
  isActive: boolean;
  notes: string;
}

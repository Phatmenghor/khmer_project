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
  usdToCnyRate: number;
  usdToVndRate: number;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
}

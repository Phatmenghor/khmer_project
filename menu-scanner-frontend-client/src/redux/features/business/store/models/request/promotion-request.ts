export interface BulkPromotionRequest {
  productIds: string[];
  promotionType: "FIXED_AMOUNT" | "PERCENTAGE";
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
}

export interface BulkPromotionResponse {
  successCount: number;
  failedCount: number;
  failedProductIds: string[];
  message: string;
  timestamp: string;
}

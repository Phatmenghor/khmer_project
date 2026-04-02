/**
 * Business Settings Response Model
 * Response from /api/v1/business-settings/current
 */

export type StockStatus = "ENABLED" | "DISABLED";

export interface BusinessSettingsResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  taxPercentage: number | null;
  logoBusinesssUrl: string;
  enableStock: StockStatus;
}

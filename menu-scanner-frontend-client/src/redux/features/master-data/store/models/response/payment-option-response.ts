import { Status } from "@/constants/status/status";
import { BasePagination } from "@/utils/common/pagination";

export type PaymentOptionType = "CASH";

export interface AllPaymentOptionResponseModel extends BasePagination {
  content: PaymentOptionResponse[];
}

export interface PaymentOptionResponse {
  id: string;
  businessId: string;
  name: string;
  paymentOptionType: PaymentOptionType;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

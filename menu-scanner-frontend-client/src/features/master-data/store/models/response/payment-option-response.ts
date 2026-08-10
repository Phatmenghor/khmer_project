import { Status } from "@/constants/status/status";
import { BasePagination } from "@/utils/common/pagination";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export type PaymentOptionType = "CASH";

export interface AllPaymentOptionResponseModel extends BasePagination {
  content: PaymentOptionResponse[];
}

export interface PaymentOptionResponse {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  paymentOptionType: PaymentOptionType;
  status: Status;
  image?: ImageUrls;
  createdAt: string;
  updatedAt: string;
}

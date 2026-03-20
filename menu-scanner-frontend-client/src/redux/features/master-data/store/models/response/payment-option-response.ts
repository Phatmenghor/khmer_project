import { Status } from "@/constants/status/status";
import { BasePagination } from "@/utils/common/pagination";

export type PaymentOptionType =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MOBILE_WALLET"
  | "CRYPTO"
  | "CHECK"
  | "OTHER";

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

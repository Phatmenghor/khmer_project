import { Status } from "@/constants/status/status";

export type PaymentOptionType =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MOBILE_WALLET"
  | "CRYPTO"
  | "CHECK"
  | "OTHER";

export interface PaymentOptionResponse {
  id: string;
  businessId: string;
  name: string;
  paymentOptionType: PaymentOptionType;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

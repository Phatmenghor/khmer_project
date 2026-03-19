import { Status } from "@/constants/status/status";

export interface PaymentOptionResponse {
  id: string;
  businessId: string;
  name: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

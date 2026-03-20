import { Status } from "@/constants/status/status";
import {
  AllPaymentOptionResponseModel,
  PaymentOptionResponse,
} from "../response/payment-option-response";

export interface PaymentOptionsManagementState {
  data: AllPaymentOptionResponseModel | null;
  selectedPaymentOption: PaymentOptionResponse | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    pageNo: number;
    status: Status;
  };
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isFetchingDetail: boolean;
  };
}

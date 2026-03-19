import { Status } from "@/constants/status/status";
import { PaymentOptionResponse } from "../response/payment-option-response";
import { PaginationResponse } from "@/redux/features/master-data/store/models/pagination-response";

export interface PaymentOptionsManagementState {
  data: PaginationResponse<PaymentOptionResponse> | null;
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
    isActivating: boolean;
    isDeactivating: boolean;
  };
}

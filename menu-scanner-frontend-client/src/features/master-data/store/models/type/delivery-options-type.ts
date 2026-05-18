import {
  AllDeliveryOptionsResponseModel,
  DeliveryOptionsResponseModel,
} from "../response/delivery-options-response";

export interface DeliveryOptionsFilters {
  search: string;
  pageNo: number;
  status: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface DeliveryOptionsManagementState {
  data: AllDeliveryOptionsResponseModel | null;
  selectedDeliveryOptions: DeliveryOptionsResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: DeliveryOptionsFilters;
  operations: OperationStates;
}

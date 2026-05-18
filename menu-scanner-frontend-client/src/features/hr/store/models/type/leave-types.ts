import {
  AllLeaveResponseModel,
  LeaveResponseModel,
} from "../response/leave-response";

export interface LeaveFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface LeaveManagementState {
  data: AllLeaveResponseModel | null;
  selectedLeave: LeaveResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: LeaveFilters;
  operations: OperationStates;
}

import {
  AllLeaveTypeResponseModel,
  LeaveTypeResponseModel,
} from "../response/leave-type-response";

export interface LeaveTypeFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface LeaveTypeManagementState {
  data: AllLeaveTypeResponseModel | null;
  selectedLeaveType: LeaveTypeResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: LeaveTypeFilters;
  operations: OperationStates;
}

import {
  AllAttendanceResponseModel,
  AttendanceResponseModel,
} from "../response/attendance-response";

export interface AttendanceFilters {
  search: string;
  pageNo: number;
  pageSize: number;
  businessId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface AttendanceManagementState {
  data: AllAttendanceResponseModel | null;
  selectedAttendance: AttendanceResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: AttendanceFilters;
  operations: OperationStates;
}

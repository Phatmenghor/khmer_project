import {
  AllWorkScheduleTypeResponseModel,
  WorkScheduleTypeResponseModel,
} from "../response/work-schedule-type-response";

export interface WorkScheduleTypeFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface WorkScheduleTypeManagementState {
  data: AllWorkScheduleTypeResponseModel | null;
  selectedWorkSchedule: WorkScheduleTypeResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: WorkScheduleTypeFilters;
  operations: OperationStates;
}

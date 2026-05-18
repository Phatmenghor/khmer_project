import {
  AllSessionResponseModel,
  SessionResponse,
} from "../response/session-response";

export interface SessionFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SessionManagementState {
  data: AllSessionResponseModel | null;
  selectedSession: SessionResponse | null;
  isLoading: boolean;
  error: string | null;
  filters: SessionFilters;
  operations: OperationStates;
}

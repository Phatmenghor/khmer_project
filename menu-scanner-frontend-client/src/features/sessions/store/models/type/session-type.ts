import {
  AllSessionsResponseModel,
  SessionResponseModel,
} from "../response/session-response";

export interface SessionFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SessionManagementState {
  data: AllSessionsResponseModel | null;
  selectedSession: SessionResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SessionFilters;
  operations: OperationStates;
}

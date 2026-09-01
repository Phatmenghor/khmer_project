import {
  AllRoleResponseModel,
  RoleResponseModel,
} from "../response/role-response";

export interface RoleFilters {
  search: string;
  pageNo: number;
}

export interface RoleOperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface RoleManagementState {
  data: AllRoleResponseModel | null;
  rollbackSnapshot?: AllRoleResponseModel | null;
  selectedRole: RoleResponseModel | null;
  rolesList: RoleResponseModel[];
  isLoading: boolean;
  error: string | null;
  filters: RoleFilters;
  operations: RoleOperationStates;
}

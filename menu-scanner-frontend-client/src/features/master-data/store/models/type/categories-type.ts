import {
  AllCategoriesResponseModel,
  CategoriesResponseModel,
} from "../response/categories-response";

export interface CategoriesFilters {
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

export interface CategoriesManagementState {
  data: AllCategoriesResponseModel | null;
  dataWithProductCount: AllCategoriesResponseModel | null;
  selectedCategories: CategoriesResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: CategoriesFilters;
  operations: OperationStates;
}

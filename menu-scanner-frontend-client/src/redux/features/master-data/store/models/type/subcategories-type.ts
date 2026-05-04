import {
  AllSubcategoriesResponseModel,
  SubcategoriesResponseModel,
} from "../response/subcategories-response";

export interface SubcategoriesFilters {
  search: string;
  pageNo: number;
  status: string;
  categoryId: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SubcategoriesManagementState {
  data: AllSubcategoriesResponseModel | null;
  selectedSubcategories: SubcategoriesResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubcategoriesFilters;
  operations: OperationStates;
}

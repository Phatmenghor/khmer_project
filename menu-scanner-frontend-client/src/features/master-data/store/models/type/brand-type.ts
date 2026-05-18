import {
  AllBrandResponseModel,
  BrandResponseModel,
} from "../response/brand-response";

export interface BrandFilters {
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

export interface BrandManagementState {
  data: AllBrandResponseModel | null;
  selectedBrand: BrandResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: BrandFilters;
  operations: OperationStates;
}

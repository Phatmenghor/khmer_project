import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../response/product-response";

export interface ProductFilters {
  search: string;
  pageNo: number;
  businessId?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  hasPromotion?: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface ProductManagementState {
  data: AllProductResponseModel | null;
  selectedProduct: ProductDetailResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  operations: OperationStates;
}

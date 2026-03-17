import {
  AllBannerResponseModel,
  BannerResponseModel,
} from "../response/banner-response";

export interface BannerFilters {
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

export interface BannerManagementState {
  data: AllBannerResponseModel | null;
  selectedBanner: BannerResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: BannerFilters;
  operations: OperationStates;
}

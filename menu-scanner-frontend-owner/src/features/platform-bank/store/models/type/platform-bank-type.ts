import {
  AllPlatformBankResponseModel,
  PlatformBankResponseModel,
} from "../response/platform-bank-response";

export interface PlatformBankFilters {
  search: string;
  status: string;
  pageNo: number;
}

export interface PlatformBankOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface PlatformBankManagementState {
  data: AllPlatformBankResponseModel | null;
  selectedBank: PlatformBankResponseModel | null;
  publicBanks: PlatformBankResponseModel[] | null;
  isFetchingPublic: boolean;
  isLoading: boolean;
  error: string | null;
  filters: PlatformBankFilters;
  operations: PlatformBankOperations;
}

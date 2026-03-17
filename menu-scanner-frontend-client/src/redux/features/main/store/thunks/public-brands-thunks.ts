import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { AppDefault } from "@/constants/app-resource/default/default";

export interface FetchPublicBrandsParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean;
}

export const fetchPublicBrands = createAsyncThunk<
  PaginationResponseModel<BrandResponseModel>,
  FetchPublicBrandsParams,
  { rejectValue: string }
>("publicBrands/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      "/api/v1/public/brands/all",
      {
        pageNo: params.pageNo || 1,
        pageSize: params.pageSize,
        search: params.search || undefined,
        status: params.status || "ACTIVE",
        businessId: AppDefault.BUSINESS_ID,
      }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch brands"
    );
  }
});

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { AppDefault } from "@/constants/app-resource/default/default";

export interface FetchPublicCategoriesParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean;
}

export const fetchPublicCategories = createAsyncThunk<
  PaginationResponseModel<CategoriesResponseModel>,
  FetchPublicCategoriesParams,
  { rejectValue: string }
>("publicCategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      "/api/v1/public/categories/all",
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
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
});

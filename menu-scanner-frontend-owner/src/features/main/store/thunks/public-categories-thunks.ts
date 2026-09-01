import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { AppDefault } from "@/constants/app-resource/default/default";
import type { RootState } from "@/store";

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
  { state: RootState; rejectValue: string }
>(
  "publicCategories/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        "/api/v1/public/categories/all-data",
        {
          search: params.search || undefined,
          status: params.status || "ACTIVE",
          businessId: AppDefault.BUSINESS_ID,
        }
      );
      const items: CategoriesResponseModel[] = response.data.data || [];
      return {
        content: items,
        pageNo: 1,
        pageSize: items.length,
        totalElements: items.length,
        totalPages: 1,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch categories"
      );
    }
  },
  {
    condition: (params, { getState }) => {
      const state = getState();
      const isInitialLoading = state.publicCategories?.loading?.initial;
      if (isInitialLoading && !params?.append) {
        return false;
      }
    },
  }
);

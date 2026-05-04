import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { SubcategoriesResponseModel } from "@/redux/features/master-data/store/models/response/subcategories-response";
import { AppDefault } from "@/constants/app-resource/default/default";

export interface CategoryWithSubcategories {
  category: CategoriesResponseModel;
  subcategories: SubcategoriesResponseModel[];
}

export interface FetchPublicSubcategoriesParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean;
}

export interface PaginationResponse {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

export const fetchPublicSubcategories = createAsyncThunk<
  {
    data: CategoryWithSubcategories[];
    pagination: PaginationResponse;
  },
  FetchPublicSubcategoriesParams,
  { rejectValue: string }
>("publicSubcategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      "/api/v1/public/subcategories/by-category",
      {
        pageNo: params.pageNo || 1,
        pageSize: params.pageSize || 12,
        search: params.search || undefined,
        status: params.status || "ACTIVE",
        businessId: AppDefault.BUSINESS_ID,
      }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch subcategories"
    );
  }
});

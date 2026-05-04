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
  search?: string;
  status?: string;
}

export const fetchPublicSubcategories = createAsyncThunk<
  CategoryWithSubcategories[],
  FetchPublicSubcategoriesParams,
  { rejectValue: string }
>("publicSubcategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(
      "/api/v1/public/subcategories/by-category",
      {
        params: {
          search: params.search || undefined,
          status: params.status || "ACTIVE",
          businessId: AppDefault.BUSINESS_ID,
        }
      }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch subcategories"
    );
  }
});

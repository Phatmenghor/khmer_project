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
  const startTime = performance.now();
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
    const endTime = performance.now();
    console.log(`[Subcategories] API call took ${(endTime - startTime).toFixed(2)}ms`);
    return response.data.data.items;
  } catch (error: any) {
    console.error("[Subcategories] Error fetching:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch subcategories"
    );
  }
});

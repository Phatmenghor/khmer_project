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
  const requestParams = {
    search: params.search || undefined,
    status: params.status || "ACTIVE",
    businessId: AppDefault.BUSINESS_ID,
  };

  console.log("[Subcategories] Fetching with params:", requestParams);

  try {
    const response = await axiosClient.get(
      "/api/v1/public/subcategories/by-category",
      { params: requestParams }
    );

    const endTime = performance.now();
    console.log(`[Subcategories] API call took ${(endTime - startTime).toFixed(2)}ms`);
    console.log("[Subcategories] Response data:", response.data);

    const items = response.data.data?.items;
    console.log("[Subcategories] Extracted items:", items);

    if (!items) {
      console.warn("[Subcategories] No items in response");
      return [];
    }

    return items;
  } catch (error: any) {
    const endTime = performance.now();
    console.error("[Subcategories] Error fetching (took ${(endTime - startTime).toFixed(2)}ms):", error);
    console.error("[Subcategories] Error response:", error.response?.data);
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch subcategories"
    );
  }
});

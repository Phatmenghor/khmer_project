import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { SubcategoriesResponseModel } from "@/redux/features/master-data/store/models/response/subcategories-response";
import { AppDefault } from "@/constants/app-resource/default/default";

export interface FetchPublicSubcategoriesParams {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

/**
 * Fetch all subcategories with pagination (public endpoint)
 * No authentication required
 * Respects business useSubcategories setting
 */
export const fetchPublicSubcategories = createAsyncThunk<
  PaginationResponseModel<SubcategoriesResponseModel>,
  FetchPublicSubcategoriesParams,
  { rejectValue: string }
>("publicSubcategories/fetchAll", async (params, { rejectWithValue }) => {
  const startTime = performance.now();
  const requestData = {
    search: params.search || "",
    status: params.status || "ACTIVE",
    businessId: AppDefault.BUSINESS_ID,
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 15,
    sortBy: "createdAt",
    sortDirection: "DESC",
  };

  console.log("[PublicSubcategories] Fetching paginated with params:", requestData);

  try {
    const response = await axiosClient.post(
      "/api/v1/public/subcategories/all",
      requestData
    );

    const endTime = performance.now();
    console.log(`[PublicSubcategories] API call took ${(endTime - startTime).toFixed(2)}ms`);
    console.log("[PublicSubcategories] Response:", response.data);

    const paginationData = response.data.data;

    if (!paginationData) {
      console.warn("[PublicSubcategories] No pagination data in response");
      return {
        content: [],
        pageNo: 1,
        pageSize: 15,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }

    console.log(`[PublicSubcategories] Retrieved ${paginationData.content?.length || 0} subcategories, page ${paginationData.pageNo} of ${paginationData.totalPages}`);

    return paginationData;
  } catch (error: any) {
    const endTime = performance.now();
    console.error(`[PublicSubcategories] Error fetching (took ${(endTime - startTime).toFixed(2)}ms):`, error);
    console.error("[PublicSubcategories] Error response:", error.response?.data);
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch subcategories"
    );
  }
});

/**
 * Fetch subcategories grouped by category (non-paginated)
 * For displaying grouped structure
 */
export interface CategoryWithSubcategories {
  category: any;
  subcategories: SubcategoriesResponseModel[];
}

export const fetchPublicSubcategoriesByCategory = createAsyncThunk<
  CategoryWithSubcategories[],
  { search?: string; status?: string },
  { rejectValue: string }
>("publicSubcategories/fetchByCategory", async (params, { rejectWithValue }) => {
  const requestParams = {
    search: params.search || undefined,
    status: params.status || "ACTIVE",
    businessId: AppDefault.BUSINESS_ID,
  };

  console.log("[SubcategoriesByCategory] Fetching grouped with params:", requestParams);

  try {
    const response = await axiosClient.get(
      "/api/v1/public/subcategories/by-category",
      { params: requestParams }
    );

    const items = response.data.data?.items;

    if (!items) {
      console.warn("[SubcategoriesByCategory] No items in response");
      return [];
    }

    return items;
  } catch (error: any) {
    console.error("[SubcategoriesByCategory] Error fetching:", error);
    console.error("[SubcategoriesByCategory] Error response:", error.response?.data);
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch subcategories"
    );
  }
});

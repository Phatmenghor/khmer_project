/**
 * Subcategories Management - Async Thunks
 * Redux thunks for Subcategories CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

import {
  AllSubcategoriesRequest,
  UpdateSubcategoriesParams,
} from "../models/request/subcategories-request";
import { CreateSubcategoriesData } from "../models/schema/subcategories-schema";

/**
 * Fetch all subcategories
 */
export const fetchAllSubcategories = createApiThunk<
  any,
  AllSubcategoriesRequest
>("subcategories/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/subcategories/my-business/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch subcategories by ID
 */
export const fetchSubcategoryDetail = createApiThunk<any, string>(
  "subcategories/fetchById",
  async (subcategoryId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/subcategories/${subcategoryId}`
    );
    return response.data.data;
  }
);

/**
 * Create subcategory
 */
export const createSubcategory = createApiThunk<
  any,
  CreateSubcategoriesData
>("subcategories/create", async (subcategoryData) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/subcategories",
    subcategoryData
  );
  return response.data.data;
});

/**
 * Update subcategory
 */
export const updateSubcategory = createApiThunk<
  any,
  UpdateSubcategoriesParams
>("subcategories/update", async ({ subcategoriesId, subcategoriesData }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/subcategories/${subcategoriesId}`,
    subcategoriesData
  );
  return response.data.data;
});

/**
 * Toggle subcategory status
 */
export const toggleSubcategoryStatus = createApiThunk<any, any>(
  "subcategories/toggleStatus",
  async (subcategory) => {
    if (!subcategory?.id) {
      throw new Error("Subcategory ID is required");
    }

    const newStatus =
      subcategory?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const response = await axiosClientWithAuth.put(
      `/api/v1/subcategories/${subcategory.id}`,
      {
        categoryId: subcategory.categoryId,
        name: subcategory.name,
        imageUrl: subcategory.imageUrl,
        status: newStatus,
      }
    );
    return response.data.data;
  }
);

/**
 * Delete subcategory
 */
export const deleteSubcategory = createApiThunk<any, string>(
  "subcategories/delete",
  async (subcategoryId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/subcategories/${subcategoryId}`
    );
    return response.data.data;
  }
);

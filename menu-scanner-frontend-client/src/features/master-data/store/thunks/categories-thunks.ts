/**
 * Categories Management - Async Thunks
 * Redux thunks for Categories CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

import {
  AllCategoriesRequest,
  UpdateCategoriesParams,
} from "../models/request/categories-request";
import { CreateCategoriesData } from "../models/schema/categories-schema";

/**
 * Fetch all categories
 */
export const fetchAllCategoriesService = createApiThunk<
  any,
  AllCategoriesRequest
>("categories/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/categories/my-business/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch all categories with product count (for admin page)
 */
export const fetchAllCategoriesWithProductCountService = createApiThunk<
  any,
  AllCategoriesRequest
>("categories/fetchAllWithProductCount", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/categories/my-business/product/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch categories by ID
 */
export const fetchCategoriesByIdService = createApiThunk<any, string>(
  "categories/fetchById",
  async (categoriesId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/categories/${categoriesId}`
    );
    return response.data.data;
  }
);

/**
 * Create categories
 */
export const createCategoriesService = createApiThunk<
  any,
  CreateCategoriesData
>("categories/create", async (categoriesData) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/categories",
    categoriesData
  );
  return response.data.data;
});

/**
 * Update categories
 */
export const updateCategoriesService = createApiThunk<
  any,
  UpdateCategoriesParams
>("categories/update", async ({ categoriesId, categoriesData }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/categories/${categoriesId}`,
    categoriesData
  );
  return response.data.data;
});

/**
 * Toggle category status
 */
export const toggleCategoriesStatusService = createApiThunk<any, any>(
  "categories/toggleStatus",
  async (category) => {
    if (!category?.id) {
      throw new Error("Category ID is required");
    }

    const newStatus = category?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const response = await axiosClientWithAuth.put(
      `/api/v1/categories/${category.id}`,
      {
        name: category.name,
        imageUrl: category.imageUrl,
        status: newStatus,
      }
    );
    return response.data.data;
  }
);

/**
 * Delete categories
 */
export const deleteCategoriesService = createApiThunk<any, string>(
  "categories/delete",
  async (categoriesId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/categories/${categoriesId}`
    );
    return response.data.data;
  }
);

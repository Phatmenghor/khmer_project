/**
 * Banner Management - Async Thunks
 * Redux thunks for banner CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllBannerRequest,
  UpdateBannerParams,
} from "../models/request/banner-request";
import { CreateBannerData } from "../models/schema/banner-schema";

/**
 * Fetch all banner
 */
export const fetchAllBannerService = createApiThunk<any, AllBannerRequest>(
  "banners/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banners/my-business/all",
      params
    );
    return response.data.data;
  }
);

/**
 * Fetch banner by ID
 */
export const fetchBannerByIdService = createApiThunk<any, string>(
  "banners/fetchById",
  async (bannerId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/banners/${bannerId}`
    );
    return response.data.data;
  }
);

/**
 * Create banner
 */
export const createBannerService = createApiThunk<any, CreateBannerData>(
  "banners/create",
  async (bannerData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banners",
      bannerData
    );
    return response.data.data;
  }
);

/**
 * Update banner
 */
export const updateBannerService = createApiThunk<any, UpdateBannerParams>(
  "banners/update",
  async ({ id, payload }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/banners/${id}`,
      payload
    );
    return response.data.data;
  }
);

/**
 * Delete banner
 */
export const deleteBannerService = createApiThunk<any, string>(
  "banners/delete",
  async (bannerId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/banners/${bannerId}`
    );
    return response.data.data;
  }
);

/**
 * Toggle banner status
 */
export const toggleBannerStatusService = createApiThunk<any, any>(
  "banners/toggleStatus",
  async (banner) => {
    if (!banner?.id) {
      throw new Error("Banner ID is required");
    }

    const newStatus = banner?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const response = await axiosClientWithAuth.put(
      `/api/v1/banners/${banner.id}`,
      { status: newStatus }
    );
    return response.data.data;
  }
);

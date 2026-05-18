


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllBrandRequest,
  UpdateBrandParams,
} from "../models/request/brand-request";
import { CreateBrandData } from "../models/schema/brand-schema";


export const fetchAllBrandService = createApiThunk<any, AllBrandRequest>(
  "brands/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/brands/my-business/all",
      params
    );
    return response.data.data;
  }
);


export const fetchAllBrandWithProductCountService = createApiThunk<
  any,
  AllBrandRequest
>("brands/fetchAllWithProductCount", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/brands/my-business/with-product-count",
    params
  );
  return response.data.data;
});


export const fetchBrandByIdService = createApiThunk<any, string>(
  "brands/fetchById",
  async (brandId) => {
    const response = await axiosClientWithAuth.get(`/api/v1/brands/${brandId}`);
    return response.data.data;
  }
);


export const createBrandService = createApiThunk<any, CreateBrandData>(
  "brands/create",
  async (brandData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/brands",
      brandData
    );
    return response.data.data;
  }
);


export const updateBrandService = createApiThunk<any, UpdateBrandParams>(
  "brands/update",
  async ({ brandId, brandData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/brands/${brandId}`,
      brandData
    );
    return response.data.data;
  }
);


export const deleteBrandService = createApiThunk<any, string>(
  "brands/delete",
  async (brandId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/brands/${brandId}`
    );
    return response.data.data;
  }
);


export const toggleBrandStatusService = createApiThunk<any, UpdateBrandParams>(
  "brands/toggleStatus",
  async ({ brandId, brandData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/brands/${brandId}`,
      brandData
    );
    return response.data.data;
  }
);

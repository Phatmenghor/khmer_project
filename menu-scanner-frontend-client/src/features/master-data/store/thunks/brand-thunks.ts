import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllBrandRequest,
  UpdateBrandParams,
} from "../models/request/brand-request";
import { CreateBrandData } from "../models/schema/brand-schema";
import {
  AllBrandResponseModel,
  BrandResponseModel,
} from "../models/response/brand-response";

export const fetchAllBrandService = createApiThunk<
  AllBrandResponseModel,
  AllBrandRequest
>("brands/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{
    data: AllBrandResponseModel;
  }>("/api/v1/brands/my-business/all", params);
  return response.data.data;
});

export const fetchAllBrandWithProductCountService = createApiThunk<
  AllBrandResponseModel,
  AllBrandRequest
>("brands/fetchAllWithProductCount", async (params) => {
  const response = await axiosClientWithAuth.post<{
    data: AllBrandResponseModel;
  }>("/api/v1/brands/my-business/with-product-count", params);
  return response.data.data;
});

export const fetchBrandByIdService = createApiThunk<BrandResponseModel, string>(
  "brands/fetchById",
  async (brandId) => {
    const response = await axiosClientWithAuth.get<{
      data: BrandResponseModel;
    }>(`/api/v1/brands/${brandId}`);
    return response.data.data;
  }
);

export const createBrandService = createApiThunk<
  BrandResponseModel,
  CreateBrandData
>("brands/create", async (brandData) => {
  const response = await axiosClientWithAuth.post<{
    data: BrandResponseModel;
  }>("/api/v1/brands", brandData);
  return response.data.data;
});

export const updateBrandService = createApiThunk<
  BrandResponseModel,
  UpdateBrandParams
>("brands/update", async ({ brandId, brandData }) => {
  const response = await axiosClientWithAuth.put<{
    data: BrandResponseModel;
  }>(`/api/v1/brands/${brandId}`, brandData);
  return response.data.data;
});

export const deleteBrandService = createApiThunk<BrandResponseModel, string>(
  "brands/delete",
  async (brandId) => {
    const response = await axiosClientWithAuth.delete<{
      data: BrandResponseModel;
    }>(`/api/v1/brands/${brandId}`);
    return response.data.data;
  }
);

export const toggleBrandStatusService = createApiThunk<
  BrandResponseModel,
  UpdateBrandParams
>("brands/toggleStatus", async ({ brandId, brandData }) => {
  const response = await axiosClientWithAuth.put<{
    data: BrandResponseModel;
  }>(`/api/v1/brands/${brandId}`, brandData);
  return response.data.data;
});

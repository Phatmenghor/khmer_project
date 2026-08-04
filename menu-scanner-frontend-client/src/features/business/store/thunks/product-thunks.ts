


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllProductRequest,
  UpdateProductParams,
} from "../models/request/product-request";
import { BulkPromotionRequest, BulkPromotionResponse } from "../models/request/promotion-request";
import { CreateProductData } from "../models/schema/product-schema";


export const fetchAllProductAdminService = createApiThunk<
  any,
  AllProductRequest
>("products/fetchAllByAdmin", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/products/admin/my-business/all",
    params
  );
  return response.data.data;
});


export const fetchAllProductService = createApiThunk<any, AllProductRequest>(
  "products/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/products/all",
      params
    );
    return response.data.data;
  }
);


export const fetchProductByIdService = createApiThunk<any, string>(
  "products/fetchById",
  async (productId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/products/${productId}`
    );
    return response.data.data;
  }
);


export const createProductService = createApiThunk<any, CreateProductData>(
  "products/create",
  async (productData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/products",
      productData
    );
    return response.data.data;
  }
);


export const updateProductService = createApiThunk<any, UpdateProductParams>(
  "products/update",
  async ({ productId, productData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/products/${productId}`,
      productData
    );
    return response.data.data;
  }
);


export const deleteProductService = createApiThunk<any, string>(
  "products/delete",
  async (bannerId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/products/${bannerId}`
    );
    return response.data.data;
  }
);


export const resetProductPromotionService = createApiThunk<any, string>(
  "products/resetPromotion",
  async (productId) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/products/${productId}/reset-promotion`
    );
    return response.data.data;
  }
);


export const resetAllPromotionsService = createApiThunk<
  { message: string; resetCount: number },
  void
>(
  "products/resetAllPromotions",
  async () => {
    const response = await axiosClientWithAuth.put(
      "/api/v1/products/reset-all-promotions"
    );
    return response.data.data;
  }
);


export const resetBulkPromotionsService = createApiThunk<
  { message: string; resetCount: number },
  string[]
>(
  "products/resetBulkPromotions",
  async (productIds) => {
    const response = await axiosClientWithAuth.put(
      "/api/v1/products/reset-promotions-bulk",
      productIds
    );
    return response.data.data;
  }
);


export const resetSelectedPromotionsService = createApiThunk<
  { message: string; resetCount: number; productsReset: number; sizesReset: number },
  { productIds: string[]; productSizeMapping?: Record<string, string[]> }
>(
  "products/resetSelectedPromotions",
  async (request) => {
    const response = await axiosClientWithAuth.put(
      "/api/v1/products/reset-selected-promotions",
      request
    );
    return response.data.data;
  }
);


export const createBulkPromotionsService = createApiThunk<
  BulkPromotionResponse,
  BulkPromotionRequest
>(
  "products/createBulkPromotions",
  async (promotionData) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/products/bulk-create-promotions",
      promotionData
    );
    return response.data.data;
  }
);

export const importProductsBatchService = createApiThunk<
  any,
  { requests: any[]; importId?: string }
>("products/importBatch", async ({ requests, importId }) => {
  const response = await axiosClientWithAuth.post(
    `/api/v1/products/batch${importId ? `?importId=${importId}` : ""}`,
    requests
  );
  return response.data.data;
});

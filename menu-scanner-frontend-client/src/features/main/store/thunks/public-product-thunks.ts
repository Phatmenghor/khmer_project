import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "@/features/business/store/models/response/product-response";
import {
  AllProductRequest,
  ProductImageRequest,
} from "@/features/business/store/models/request/product-request";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Status } from "@/constants/status/status";

export const fetchPublicProducts = createApiThunk<any, AllProductRequest>(
  "publicProducts/fetchList",
  async (params) => {
    const response = await axiosClient.post("/api/v1/public/products/all", {
      businessId: AppDefault.BUSINESS_ID,
      status: Status.ACTIVE,
      ...params,
    });
    return response.data.data;
  }
);

export const fetchPublicProductById = createApiThunk<
  ProductDetailResponseModel,
  string
>("publicProducts/fetchById", async (productId) => {
  const response = await axiosClient.get(
    `/api/v1/public/products/${productId}`
  );
  return response.data.data;
});

export const fetchPublicCategories = createApiThunk<any, void>(
  "publicProducts/fetchCategories",
  async () => {
    const response = await axiosClient.post("/api/v1/public/categories/all-data", {
      status: Status.ACTIVE,
      businessId: AppDefault.BUSINESS_ID,
    });
    return response.data.data;
  }
);

export const fetchPublicBrands = createApiThunk<any, void>(
  "publicProducts/fetchBrands",
  async () => {
    const response = await axiosClient.post("/api/v1/public/brands/all-data", {
      status: Status.ACTIVE,
      businessId: AppDefault.BUSINESS_ID,
    });
    return response.data.data;
  }
);

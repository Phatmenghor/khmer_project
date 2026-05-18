import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { ToggleFavoriteRequest } from "../models/request/favorite-request";
import { AllFavoriteResponseModel } from "../models/response/favorite-response";
import { AppDefault } from "@/constants/app-resource/default/default";


export const fetchFavoritePaginated = createApiThunk<
  AllFavoriteResponseModel,
  { pageNo: number; pageSize: number }
>(
  "product-favorites/fetchPaginated",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/product-favorites/my-favorites",
      { pageNo: params.pageNo, pageSize: params.pageSize },
    );
    return response.data.data;
  },
);


export const fetchFavoriteList = createApiThunk<AllFavoriteResponseModel, void>(
  "product-favorites/fetchFavoriteList",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/product-favorites/my-favorites",
      { pageNo: 1, pageSize: 100 },
    );
    return response.data.data;
  },
);


export const toggleFavorite = createApiThunk<void, ToggleFavoriteRequest>(
  "product-favorites/toggleFavorite",
  async (data) => {
    await axiosClientWithAuth.post(
      `/api/v1/product-favorites/${data.productId}/toggle`,
    );
  },
);


export const clearAllFavorites = createApiThunk<void, void>(
  "product-favorites/clearAllFavorites",
  async () => {
    await axiosClientWithAuth.delete("/api/v1/product-favorites/all", {
      params: { businessId: AppDefault.BUSINESS_ID },
    });
  },
);

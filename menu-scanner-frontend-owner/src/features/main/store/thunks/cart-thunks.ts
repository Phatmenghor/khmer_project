import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../models/request/cart-request";
import { CartResponseModel } from "../models/response/cart-response";
import { AppDefault } from "@/constants/app-resource/default/default";


export const addToCart = createApiThunk<CartResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data, signal) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { optimisticTimestamp, ...requestData } = data;
    const businessId = AppDefault.BUSINESS_ID;


    const response = await axiosClientWithAuth.post("/api/v1/cart", {
      ...requestData,
      businessId,
    }, {
      signal,
    });


    let responseData = response.data.data;


    if (responseData?.items) {
      responseData.items = responseData.items.map((item: Record<string, unknown>) => ({
        ...item,
        isAvailable: item.status === "ACTIVE" || item.status === "AVAILABLE"
      }));
    }

    return responseData;
  },
);

export const updateCartItem = createApiThunk<
  CartResponseModel,
  UpdateCartItemRequest
>("cart/updateCartItem", async (data, signal) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { optimisticTimestamp, ...requestData } = data;
  const businessId = AppDefault.BUSINESS_ID;

  const response = await axiosClientWithAuth.post("/api/v1/cart", {
    ...requestData,
    businessId,
  }, {
    signal,
  });
  let responseData = response.data.data;


  if (responseData?.items) {
    responseData.items = responseData.items.map((item: Record<string, unknown>) => ({
      ...item,
      hasPromotion: item.hasActivePromotion ?? item.hasPromotion ?? false,
      isAvailable: item.status === "ACTIVE" || item.status === "AVAILABLE"
    }));
  }

  return responseData;
});

export const fetchCart = createApiThunk<CartResponseModel, void>(
  "cart/fetch",
  async (_, signal) => {
    const businessId = AppDefault.BUSINESS_ID;
    const response = await axiosClientWithAuth.post(
      "/api/v1/cart/all",
      { businessId },
      { signal }
    );
    let responseData = response.data.data;

    if (responseData?.items) {
      responseData.items = responseData.items.map((item: Record<string, unknown>) => ({
        ...item,
        isAvailable: item.status === "ACTIVE" || item.status === "AVAILABLE"
      }));
    }

    return responseData;
  }
);

/**
 * Direct API call for cart search — bypasses Redux so the full cart state is
 * never replaced with filtered results. Returns items or throws on error.
 */
export async function searchCartItems(search: string, signal?: AbortSignal): Promise<CartResponseModel["items"]> {
  const businessId = AppDefault.BUSINESS_ID;
  const response = await axiosClientWithAuth.post(
    "/api/v1/cart/all",
    { businessId, search },
    { signal }
  );
  const data = response.data.data as CartResponseModel;
  return (data?.items ?? []).map((item) => ({
    ...item,
    isAvailable: (item as any).status === "ACTIVE" || (item as any).status === "AVAILABLE",
  }));
}

export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async (_, signal) => {
    const businessId = AppDefault.BUSINESS_ID;
    await axiosClientWithAuth.delete(`/api/v1/cart/${businessId}/clear`, {
      signal,
    });
  },
);

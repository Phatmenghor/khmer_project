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

    // DEBUG: Log response
    let responseData = response.data.data;


    if (!isCorrect) {
    }

    // Transform response to ensure frontend compatibility
    if (responseData?.items) {
      responseData.items = responseData.items.map((item: any) => ({
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

  // Transform response to ensure frontend compatibility
  if (responseData?.items) {
    responseData.items = responseData.items.map((item: any) => ({
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
      {
        businessId: businessId,
      },
      { signal }
    );
    let responseData = response.data.data;

    // Transform response to ensure frontend compatibility
    if (responseData?.items) {
      responseData.items = responseData.items.map((item: any) => ({
        ...item,
        isAvailable: item.status === "ACTIVE" || item.status === "AVAILABLE"
      }));
    }

    return responseData;
  }
);

export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async (_, signal) => {
    const businessId = AppDefault.BUSINESS_ID;
    await axiosClientWithAuth.delete(`/api/v1/cart/${businessId}/clear`, {
      signal,
    });
  },
);

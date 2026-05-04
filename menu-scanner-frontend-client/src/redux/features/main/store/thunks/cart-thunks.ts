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

    // DEBUG: Log request
    console.log("%c## CART API REQUEST", "background:#007bff;color:white;padding:5px;border-radius:3px;font-weight:bold", {
      endpoint: "POST /api/v1/cart",
      payload: { ...requestData, businessId },
      action: requestData.quantity === 0 ? "REMOVE" : "ADD/UPDATE",
      timestamp: new Date().toLocaleTimeString()
    });

    const response = await axiosClientWithAuth.post("/api/v1/cart", {
      ...requestData,
      businessId,
    }, {
      signal,
    });

    // DEBUG: Log response
    let responseData = response.data.data;
    const isCorrect = responseData?.items && Array.isArray(responseData.items);
    const bgColor = isCorrect ? "#28a745" : "#dc3545";
    const status = isCorrect ? "✅ CORRECT" : "❌ WRONG";

    console.log(`%c## CART API RESPONSE ${status}`, `background:${bgColor};color:white;padding:5px;border-radius:3px;font-weight:bold`, {
      hasItems: !!responseData?.items,
      itemsCount: responseData?.items?.length || 0,
      totalItems: responseData?.totalItems,
      finalTotal: responseData?.finalTotal,
      timestamp: new Date().toLocaleTimeString()
    });

    // DEBUG: Log the actual items structure
    if (responseData?.items?.length > 0) {
      console.log("%c## ACTUAL ITEMS FROM BACKEND", "background:#ff9800;color:white;padding:5px;border-radius:3px;font-weight:bold", {
        firstItem: responseData.items[0],
        fields: Object.keys(responseData.items[0]),
        itemCount: responseData.items.length
      });
    }

    if (!isCorrect) {
      console.error("%c## ❌ RESPONSE IS WRONG STRUCTURE", "background:#dc3545;color:white;padding:5px", responseData);
    }

    // Transform response to ensure frontend compatibility
    // Map backend hasActivePromotion → hasPromotion for consistent naming
    if (responseData?.items) {
      responseData.items = responseData.items.map((item: any) => ({
        ...item,
        hasPromotion: item.hasActivePromotion ?? item.hasPromotion ?? false,
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
        hasPromotion: item.hasActivePromotion ?? item.hasPromotion ?? false,
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

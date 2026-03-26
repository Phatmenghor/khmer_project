import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllOrderAdminRequest,
  UpdateOrderParams,
} from "../models/request/order-admin-request";

export const fetchAllOrderAdminService = createApiThunk<
  any,
  AllOrderAdminRequest
>("ordersAdmin/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/orders/all",
    params
  );
  return response.data.data;
});

export const fetchOrderByIdAdminService = createApiThunk<any, string>(
  "ordersAdmin/fetchById",
  async (orderId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${orderId}`
    );
    return response.data.data;
  }
);

export const updateOrderAdminService = createApiThunk<any, UpdateOrderParams>(
  "ordersAdmin/update",
  async ({ orderId, orderData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/orders/${orderId}`,
      orderData
    );
    return response.data.data;
  }
);

export const deleteOrderAdminService = createApiThunk<any, string>(
  "ordersAdmin/delete",
  async (orderId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/orders/${orderId}`
    );
    return response.data.data;
  }
);

/**
 * NOTE: Order creation from POS uses createPOSCheckoutOrderService in pos-page-thunks.ts
 * This file only handles order management (fetch, update status, delete)
 * Both POS and customer orders use the same endpoints
 * Differentiation is done via the 'source' field in the response
 */

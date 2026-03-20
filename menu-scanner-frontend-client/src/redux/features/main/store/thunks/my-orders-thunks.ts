/**
 * My Orders Management - Async Thunks
 * Redux thunks for fetching user's orders
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export interface FetchMyOrdersParams {
  pageNo?: number;
  pageSize?: number;
  status?: string;
  businessId?: string;
  search?: string;
}

/**
 * Fetch user's orders with filters
 */
export const fetchMyOrdersService = createApiThunk<
  any,
  FetchMyOrdersParams
>(
  "myOrders/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/orders/my-orders",
      params
    );
    return response.data.data;
  }
);

/**
 * Fetch order details by ID
 */
export const fetchOrderDetailsService = createApiThunk<any, string>(
  "myOrders/fetchDetails",
  async (orderId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${orderId}`
    );
    return response.data.data;
  }
);

/**
 * Cancel order
 */
export const cancelOrderService = createApiThunk<any, string>(
  "myOrders/cancel",
  async (orderId) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/orders/${orderId}/cancel`
    );
    return response.data.data;
  }
);

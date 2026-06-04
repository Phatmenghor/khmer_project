


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export interface FetchMyOrdersParams {
  pageNo?: number;
  pageSize?: number;
  orderStatus?: string;
  paymentStatus?: string;
  businessId?: string;
  search?: string;
}


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


export const fetchOrderDetailsService = createApiThunk<any, string>(
  "myOrders/fetchDetails",
  async (orderId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${orderId}`
    );
    return response.data.data;
  }
);


export const cancelOrderService = createApiThunk<any, string>(
  "myOrders/cancel",
  async (orderId) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/orders/${orderId}/cancel`
    );
    return response.data.data;
  }
);

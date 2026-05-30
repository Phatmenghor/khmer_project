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
  const payload = {
    search: params.search || "",
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 15,
    sortBy: params.sortBy || "createdAt",
    sortDirection: params.sortDirection || "DESC",
    ...(params.businessId && { businessId: params.businessId }),
    ...(params.orderStatus && { orderStatus: params.orderStatus }),
    ...(params.paymentStatus && { paymentStatus: params.paymentStatus }),
    ...(params.startDate && { startDate: params.startDate }),
    ...(params.endDate && { endDate: params.endDate }),
  };
  
  const response = await axiosClientWithAuth.post(
    "/api/v1/orders/all",
    payload
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

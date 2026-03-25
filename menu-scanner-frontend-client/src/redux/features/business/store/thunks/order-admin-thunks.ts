import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllOrderAdminRequest,
  UpdateOrderParams,
} from "../models/request/order-admin-request";
import {
  UpdateOrderFromPOSRequest,
  ConfirmPOSOrderChangesRequest,
} from "@/redux/features/main/store/models/request/order-pos-update-request";

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

// ─── POS Order Update Services ───

/**
 * Update order items from POS (price, quantity, promotion)
 * Sets order to PENDING_POS_CONFIRMATION if shouldAutoConfirm is false
 */
export const updateOrderFromPOSService = createApiThunk<
  any,
  UpdateOrderFromPOSRequest
>("ordersAdmin/updateFromPOS", async (request) => {
  const response = await axiosClientWithAuth.post(
    `/api/v1/orders/${request.orderId}/update-from-pos`,
    request
  );
  return response.data.data;
});

/**
 * Confirm or reject POS changes made to an order
 * Admin must confirm before order proceeds to next status
 */
export const confirmPOSOrderChangesService = createApiThunk<
  any,
  ConfirmPOSOrderChangesRequest
>("ordersAdmin/confirmPOSChanges", async (request) => {
  const response = await axiosClientWithAuth.post(
    `/api/v1/orders/${request.orderId}/confirm-pos-changes`,
    request
  );
  return response.data.data;
});

/**
 * Fetch order update history (all modifications made to an order)
 */
export const fetchOrderUpdateHistoryService = createApiThunk<any, string>(
  "ordersAdmin/fetchUpdateHistory",
  async (orderId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${orderId}/update-history`
    );
    return response.data.data;
  }
);

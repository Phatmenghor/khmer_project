/**
 * Product Stock Management - Async Thunks
 * Redux thunks for Stock listing and operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AllProductRequest } from "../models/request/product-request";

/**
 * Fetch all Product stock with admin access
 */
export const fetchAllProductStockAdminService = createApiThunk<
  any,
  AllProductRequest
>("productStock/fetchAllByAdmin", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/products/admin/stock/all",
    params
  );
  return response.data.data;
});

/**
 * Update stock status (enable/disable)
 */
export const updateStockStatusService = createApiThunk<
  any,
  { productId: string; newStatus: "ENABLED" | "DISABLED" }
>("productStock/updateStatus", async (params) => {
  const response = await axiosClientWithAuth.patch(
    `/api/v1/products/${params.productId}/stock/status`,
    { stockStatus: params.newStatus }
  );
  return response.data.data;
});

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  DashboardBranchesResponse,
  DashboardCustomerStatsResponse,
  DashboardHourlySalesResponse,
  DashboardOrdersResponse,
  DashboardPaymentsResponse,
  DashboardPeriodParams,
  DashboardPromotionsResponse,
  DashboardSalesResponse,
  DashboardStockResponse,
  DashboardSummaryResponse,
  DashboardTopProductsResponse,
} from "../models/response/dashboard-response";

export const fetchDashboardSummaryService = createApiThunk<
  DashboardSummaryResponse,
  DashboardPeriodParams
>("dashboard/fetchSummary", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/summary", { params });
  return response.data.data;
});

export const fetchDashboardSalesService = createApiThunk<
  DashboardSalesResponse,
  DashboardPeriodParams
>("dashboard/fetchSales", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/sales", { params });
  return response.data.data;
});

export const fetchDashboardPaymentsService = createApiThunk<
  DashboardPaymentsResponse,
  DashboardPeriodParams
>("dashboard/fetchPayments", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/payments", { params });
  return response.data.data;
});

export const fetchDashboardStockService = createApiThunk<
  DashboardStockResponse,
  void
>("dashboard/fetchStock", async () => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/stock");
  return response.data.data;
});

export const fetchDashboardOrdersService = createApiThunk<
  DashboardOrdersResponse,
  DashboardPeriodParams
>("dashboard/fetchOrders", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/orders", { params });
  return response.data.data;
});

export const fetchDashboardBranchesService = createApiThunk<
  DashboardBranchesResponse,
  DashboardPeriodParams
>("dashboard/fetchBranches", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/branches", { params });
  return response.data.data;
});

export const fetchDashboardTopProductsService = createApiThunk<
  DashboardTopProductsResponse,
  DashboardPeriodParams
>("dashboard/fetchTopProducts", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/top-products", { params });
  return response.data.data;
});

export const fetchDashboardHourlySalesService = createApiThunk<
  DashboardHourlySalesResponse,
  DashboardPeriodParams
>("dashboard/fetchHourlySales", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/hourly-sales", { params });
  return response.data.data;
});

export const fetchDashboardCustomerStatsService = createApiThunk<
  DashboardCustomerStatsResponse,
  DashboardPeriodParams
>("dashboard/fetchCustomerStats", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/customers", { params });
  return response.data.data;
});

export const fetchDashboardPromotionsService = createApiThunk<
  DashboardPromotionsResponse,
  DashboardPeriodParams
>("dashboard/fetchPromotions", async (params) => {
  const response = await axiosClientWithAuth.get("/api/admin/dashboard/promotions", { params });
  return response.data.data;
});

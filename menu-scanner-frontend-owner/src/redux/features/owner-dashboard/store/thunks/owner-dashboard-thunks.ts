import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/apiWrapper";

export const fetchOwnerDashboardSummaryService = createApiThunk<any, void>(
  "owner-dashboard/summary",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/summary`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardTrendsService = createApiThunk<any, void>(
  "owner-dashboard/trends",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/trends`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardStatusBreakdownService = createApiThunk<any, void>(
  "owner-dashboard/status-breakdown",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/status-breakdown`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardRecentOwnersService = createApiThunk<any, void>(
  "owner-dashboard/recent-owners",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/recent-owners`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardPlanBreakdownService = createApiThunk<any, void>(
  "owner-dashboard/plan-breakdown",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/plan-breakdown`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardCustomerTrendsService = createApiThunk<any, void>(
  "owner-dashboard/customer-trends",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/customer-trends`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardUserTrendsService = createApiThunk<any, void>(
  "owner-dashboard/user-trends",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/user-trends`);
    return res.data.data;
  }
);

export const fetchOwnerDashboardPaymentTrendsService = createApiThunk<any, void>(
  "owner-dashboard/payment-trends",
  async () => {
    const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/payment-trends`);
    return res.data.data;
  }
);

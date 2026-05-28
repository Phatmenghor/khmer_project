import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/apiWrapper";
import { OwnerDashboardPeriod } from "../models/response/owner-dashboard-response";

export const fetchOwnerDashboardSummaryService = createApiThunk<
  any,
  { period: OwnerDashboardPeriod }
>("owner-dashboard/summary", async ({ period }) => {
  const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/summary`, {
    params: { period },
  });
  return res.data.data;
});

export const fetchOwnerDashboardTrendsService = createApiThunk<
  any,
  { period: OwnerDashboardPeriod }
>("owner-dashboard/trends", async ({ period }) => {
  const res = await axiosClientWithAuth.get(`/api/v1/owner-dashboard/trends`, {
    params: { period },
  });
  return res.data.data;
});

export const fetchOwnerDashboardStatusBreakdownService = createApiThunk<
  any,
  void
>("owner-dashboard/status-breakdown", async () => {
  const res = await axiosClientWithAuth.get(
    `/api/v1/owner-dashboard/status-breakdown`
  );
  return res.data.data;
});

export const fetchOwnerDashboardRecentOwnersService = createApiThunk<
  any,
  void
>("owner-dashboard/recent-owners", async () => {
  const res = await axiosClientWithAuth.get(
    `/api/v1/owner-dashboard/recent-owners`
  );
  return res.data.data;
});

export const fetchOwnerDashboardPlanBreakdownService = createApiThunk<
  any,
  void
>("owner-dashboard/plan-breakdown", async () => {
  const res = await axiosClientWithAuth.get(
    `/api/v1/owner-dashboard/plan-breakdown`
  );
  return res.data.data;
});

export type OwnerDashboardPeriod = "TODAY" | "7D" | "30D" | "90D";

export interface OwnerDashboardSummaryResponse {
  totalBusinessOwners: number;
  newOwnersThisPeriod: number;
  newOwnersChange: number;
  activeSubscriptions: number;
  expiringSoonSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  revenueChange: number;
}

export interface OwnerDashboardTrendPoint {
  date: string;
  newSubscriptions: number;
  revenue: number;
}

export interface OwnerDashboardTrendsResponse {
  data: OwnerDashboardTrendPoint[];
  totalNewSubscriptions: number;
  totalRevenue: number;
}

export interface OwnerDashboardStatusBreakdownResponse {
  active: number;
  expiringSoon: number;
  expired: number;
  total: number;
  activePercent: number;
  expiringSoonPercent: number;
  expiredPercent: number;
}

export interface RecentOwner {
  ownerId: string;
  ownerName: string;
  businessName: string;
  planName: string;
  subscriptionStatus: string;
  daysRemaining: number | null;
  joinedAt: string;
  logoUrl: string | null;
}

export interface OwnerDashboardRecentOwnersResponse {
  data: RecentOwner[];
}

export interface PlanStat {
  planName: string;
  activeCount: number;
  totalCount: number;
  percentage: number;
}

export interface OwnerDashboardPlanBreakdownResponse {
  data: PlanStat[];
}

export interface OwnerDashboardDailyPoint {
  date: string;
  count: number;
  amount: number;
}

export interface OwnerDashboardDailyTrendsResponse {
  data: OwnerDashboardDailyPoint[];
  totalCount: number;
  totalAmount: number;
}

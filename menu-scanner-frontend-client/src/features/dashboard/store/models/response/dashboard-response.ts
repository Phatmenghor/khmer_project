// ─── Summary / KPIs ──────────────────────────────────────────────────────────

export interface DashboardSummaryResponse {
  totalSalesToday: number;
  totalOrdersToday: number;
  totalOrdersChange: number;
  totalSalesChange: number;
  lowStockItems: number;
  systemAlerts: number;
  activeStaff: number;
  avgOrderValue: number;
}

// ─── Sales Analytics ─────────────────────────────────────────────────────────

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardSalesResponse {
  data: SalesDataPoint[];
  totalRevenue: number;
  totalOrders: number;
  period: string;
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DashboardPaymentsResponse {
  data: PaymentMethodData[];
  totalAmount: number;
  totalCount: number;
}

// ─── Inventory / Stock ────────────────────────────────────────────────────────

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface DashboardStockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  status: StockStatus;
  category: string;
  imageUrl?: string;
}

export interface DashboardStockResponse {
  data: DashboardStockItem[];
  lowStockCount: number;
  outOfStockCount: number;
}

// ─── Recent Orders ────────────────────────────────────────────────────────────

export interface DashboardOrder {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string | null;
}

export interface DashboardOrdersResponse {
  data: DashboardOrder[];
  totalElements: number;
}

// ─── Branch Performance ───────────────────────────────────────────────────────

export interface BranchPerformance {
  id: string;
  name: string;
  location: string;
  revenue: number;
  orders: number;
  rank: number;
  revenueChange: number;
}

export interface DashboardBranchesResponse {
  data: BranchPerformance[];
  topBranchId: string;
}

// ─── Top Products ─────────────────────────────────────────────────────────────

export interface DashboardTopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  category: string;
  imageUrl?: string;
}

export interface DashboardTopProductsResponse {
  data: DashboardTopProduct[];
  period: string;
}

// ─── Hourly Sales ─────────────────────────────────────────────────────────────

export interface HourlySalesPoint {
  hour: number;
  revenue: number;
  orders: number;
}

export interface DashboardHourlySalesResponse {
  data: HourlySalesPoint[];
  peakHour: number;
  currentHour: number;
}

// ─── Customer Stats ───────────────────────────────────────────────────────────

export interface DashboardCustomerStatsResponse {
  newCustomers: number;
  returningCustomers: number;
  returnRate: number;
  totalCustomers: number;
  avgOrderValue: number;
}

// ─── Promotion Performance ────────────────────────────────────────────────────

export interface DashboardPromotion {
  id: string;
  name: string;
  type: string;
  timesUsed: number;
  revenueGenerated: number;
  discountGiven: number;
}

export interface DashboardPromotionsResponse {
  data: DashboardPromotion[];
}

// ─── Period Filter ────────────────────────────────────────────────────────────

export type DashboardPeriod = "TODAY" | "7D" | "30D" | "90D";

export interface DashboardPeriodParams {
  period: DashboardPeriod;
}

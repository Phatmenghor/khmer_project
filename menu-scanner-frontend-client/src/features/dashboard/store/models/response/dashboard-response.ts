// ─── Summary / KPIs ──────────────────────────────────────────────────────────

export interface DashboardSummaryResponse {
  totalSalesToday: number;
  totalOrdersToday: number;
  totalOrdersChange: number;     // % vs yesterday (positive = up)
  totalSalesChange: number;      // % vs yesterday
  lowStockItems: number;
  systemAlerts: number;
  activeStaff: number;
  avgOrderValue: number;
}

// ─── Sales Analytics ─────────────────────────────────────────────────────────

export interface SalesDataPoint {
  date: string;   // "2024-01-15"
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
  createdAt: string;
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
  revenueChange: number; // % vs previous period
}

export interface DashboardBranchesResponse {
  data: BranchPerformance[];
  topBranchId: string;
}

// ─── Period Filter ────────────────────────────────────────────────────────────

export type DashboardPeriod = "TODAY" | "7D" | "30D" | "90D";

export interface DashboardPeriodParams {
  period: DashboardPeriod;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ChevronLeft, Search, Filter, AlertCircle, Loader2 } from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAppDispatch } from "@/redux/store";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import Link from "next/link";

type Order = OrderResponse;

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SHIPPED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, profile, authReady } = useAuthState();

  const [ordersState, setOrdersState] = useState<OrdersState>({
    orders: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    },
  });

  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  // Fetch orders on mount and when filters change
  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const fetchOrders = async () => {
      setOrdersState((prev) => ({ ...prev, loading: true }));
      try {
        const result = await dispatch(
          fetchMyOrdersService({
            pageNo: ordersState.pagination.currentPage,
            pageSize: ordersState.pagination.pageSize,
            status: filters.status || undefined,
            businessId: profile?.businessId,
            search: filters.search || undefined,
          })
        ).unwrap();

        setOrdersState((prev) => ({
          ...prev,
          orders: result.content || [],
          pagination: {
            currentPage: result.pageNo || 1,
            pageSize: result.pageSize || 10,
            totalElements: result.totalElements || 0,
            totalPages: result.totalPages || 0,
          },
          loading: false,
        }));
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        setOrdersState((prev) => ({
          ...prev,
          error: error?.message || "Failed to load orders",
          loading: false,
        }));
      }
    };

    fetchOrders();
  }, [authReady, isAuthenticated, filters, ordersState.pagination.currentPage, dispatch, profile?.businessId]);

  if (!authReady) {
    return <OrdersPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageContainer className="py-12">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your orders.
          </p>
          <CustomButton
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl"
          >
            Sign In
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            {ordersState.pagination.totalElements} total orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-2xl p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order number or items..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setOrdersState((prev) => ({
                  ...prev,
                  pagination: { ...prev.pagination, currentPage: 1 },
                }));
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setOrdersState((prev) => ({
                ...prev,
                pagination: { ...prev.pagination, currentPage: 1 },
              }));
            }}
            className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersState.loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          </div>
        ) : ordersState.orders.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground mb-6">
              {filters.status || filters.search
                ? "No orders match your filters. Try adjusting your search."
                : "You haven't placed any orders yet."}
            </p>
            <CustomButton
              onClick={() => router.push("/products")}
              className="gap-2 h-10 rounded-lg"
            >
              Start Shopping
            </CustomButton>
          </div>
        ) : (
          <>
            {ordersState.orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block"
              >
                <div className="bg-card border rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            STATUS_COLORS[order.orderProcessStatus?.name || ""] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {order.orderProcessStatus?.name || "Unknown"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {dateTimeFormat(order.createdAt)}
                      </p>

                      {/* Items */}
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {item.product.name} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 2} more item
                            {order.items.length - 2 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex flex-col items-end gap-2 sm:text-right">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">
                          {formatCurrency(order.pricing.finalTotal)}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          order.payment.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {order.payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {ordersState.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOrdersState((prev) => ({
                      ...prev,
                      pagination: {
                        ...prev.pagination,
                        currentPage: Math.max(1, prev.pagination.currentPage - 1),
                      },
                    }))
                  }
                  disabled={ordersState.pagination.currentPage === 1}
                  className="rounded-lg"
                >
                  Previous
                </CustomButton>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(5, ordersState.pagination.totalPages),
                  }).map((_, i) => {
                    const pageNum =
                      ordersState.pagination.currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > ordersState.pagination.totalPages)
                      return null;
                    return (
                      <CustomButton
                        key={pageNum}
                        variant={
                          pageNum === ordersState.pagination.currentPage
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setOrdersState((prev) => ({
                            ...prev,
                            pagination: {
                              ...prev.pagination,
                              currentPage: pageNum,
                            },
                          }))
                        }
                        className="h-8 w-8 rounded-lg"
                      >
                        {pageNum}
                      </CustomButton>
                    );
                  })}
                </div>

                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOrdersState((prev) => ({
                      ...prev,
                      pagination: {
                        ...prev.pagination,
                        currentPage: Math.min(
                          prev.pagination.totalPages,
                          prev.pagination.currentPage + 1
                        ),
                      },
                    }))
                  }
                  disabled={
                    ordersState.pagination.currentPage ===
                    ordersState.pagination.totalPages
                  }
                  className="rounded-lg"
                >
                  Next
                </CustomButton>
              </div>
            )}
          </>
        )}

        {/* Error State */}
        {ordersState.error && (
          <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-800/30">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                Error loading orders
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {ordersState.error}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function OrdersPageSkeleton() {
  return (
    <PageContainer className="py-4 sm:py-8">
      {/* Header with back button - matches actual page structure */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
        <div className="flex-1">
          <div className="h-8 bg-muted rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-32 animate-pulse mt-2" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-card border rounded-2xl p-4 mb-6 space-y-4">
        <div className="h-6 bg-muted rounded-lg w-24 animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Orders skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border rounded-2xl p-6 h-40 animate-pulse"
          />
        ))}
      </div>
    </PageContainer>
  );
}

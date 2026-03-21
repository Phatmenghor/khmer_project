"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  AlertCircle,
  Loader2,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAppDispatch } from "@/redux/store";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { fetchAllOrderStatusService } from "@/redux/features/master-data/store/thunks/order-status-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Order = OrderResponse;

interface OrderStatus {
  id: string;
  name: string;
  description?: string;
  isInitial?: boolean;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

interface StatusTab {
  value: string;
  label: string;
}

// Color palette for status badges (without icons since API provides status names)
const STATUS_COLOR_PALETTE = [
  { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400" },
  { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400" },
  { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-400" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-400" },
];

// Map status names to colors (cycling through palette)
const getStatusColor = (statusName: string, index: number) => {
  const colorIndex = index % STATUS_COLOR_PALETTE.length;
  return STATUS_COLOR_PALETTE[colorIndex];
};

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, profile, authReady } = useAuthState();

  const [ordersState, setOrdersState] = useState<OrdersState>({
    orders: [],
    loading: false,
    loadingMore: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 15,
      totalElements: 0,
      totalPages: 0,
    },
  });

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    isInitial: true,
  });

  const [mounted, setMounted] = useState(false);
  const [statusTabs, setStatusTabs] = useState<StatusTab[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch order statuses from API
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted || !profile?.businessId) return;

    const fetchStatuses = async () => {
      setStatusesLoading(true);
      try {
        const result = await dispatch(
          fetchAllOrderStatusService({
            businessId: profile.businessId,
            statuses: ["ACTIVE"],
            pageNo: 1,
            pageSize: 100,
          })
        ).unwrap();

        // Create tabs from API response
        const tabs: StatusTab[] = [
          { value: "", label: "All Orders" },
          ...(result.content || []).map((status: OrderStatus) => ({
            value: status.name,
            label: status.name,
          })),
        ];

        setStatusTabs(tabs);
        setStatusesLoading(false);
      } catch (error: any) {
        console.error("Failed to fetch order statuses:", error);
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, [mounted, authReady, isAuthenticated, profile?.businessId, dispatch]);

  // Fetch orders
  const fetchOrders = useCallback(
    async (pageNo: number, isLoadMore: boolean = false) => {
      if (!authReady || !isAuthenticated || !profile?.businessId) return;

      try {
        if (isLoadMore) {
          setOrdersState((prev) => ({ ...prev, loadingMore: true }));
        } else {
          setOrdersState((prev) => ({ ...prev, loading: true }));
        }

        const result = await dispatch(
          fetchMyOrdersService({
            pageNo,
            pageSize: ordersState.pagination.pageSize,
            status: filters.status || undefined,
            businessId: profile.businessId,
            search: filters.search || undefined,
          })
        ).unwrap();

        setOrdersState((prev) => {
          const newOrders = isLoadMore
            ? [...prev.orders, ...(result.content || [])]
            : result.content || [];

          return {
            ...prev,
            orders: newOrders,
            pagination: {
              currentPage: result.pageNo || 1,
              pageSize: result.pageSize || 15,
              totalElements: result.totalElements || 0,
              totalPages: result.totalPages || 0,
            },
            loading: false,
            loadingMore: false,
          };
        });
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        setOrdersState((prev) => ({
          ...prev,
          error: error?.message || "Failed to load orders",
          loading: false,
          loadingMore: false,
        }));
      }
    },
    [dispatch, authReady, isAuthenticated, profile?.businessId, filters, ordersState.pagination.pageSize]
  );

  // Initial fetch on filter change
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;
    isLoadingRef.current = false;
    fetchOrders(1, false);
  }, [mounted, authReady, isAuthenticated, filters, fetchOrders]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          ordersState.pagination.currentPage < ordersState.pagination.totalPages &&
          !ordersState.loadingMore &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true;
          const nextPage = ordersState.pagination.currentPage + 1;
          fetchOrders(nextPage, true).finally(() => {
            isLoadingRef.current = false;
            setOrdersState((prev) => ({
              ...prev,
              pagination: { ...prev.pagination, currentPage: nextPage },
            }));
          });
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [ordersState.pagination, ordersState.loadingMore, fetchOrders]);

  const totalOrders = ordersState.pagination.totalElements;

  // Prevent hydration mismatch
  if (!mounted || !authReady) {
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
    <PageContainer className="py-6 sm:py-8">
      {/* Header */}
      <PageHeader
        title="My Orders"
        subtitle={`You have ${totalOrders} order${totalOrders !== 1 ? "s" : ""}`}
        icon={ShoppingBag}
      />

      {/* Status Filter Tabs */}
      <div className="mt-8 mb-8">
        {statusesLoading ? (
          <div className="flex gap-2 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse flex-shrink-0 w-24" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {statusTabs.map((tab, index) => {
              const isActive = filters.status === tab.value;
              const orderCount = isActive ? ordersState.pagination.totalElements : 0;
              return (
                <button
                  key={tab.value || "all"}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, status: tab.value, isInitial: false }));
                    setOrdersState((prev) => ({
                      ...prev,
                      orders: [],
                      pagination: { ...prev.pagination, currentPage: 1 },
                    }));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card border border-border/50 text-foreground hover:border-primary/30 hover:bg-muted"
                  )}
                >
                  <span>{tab.label}</span>
                  {isActive && orderCount > 0 && (
                    <span className={cn("ml-1 px-2 py-0.5 rounded-full text-xs font-bold", isActive ? "bg-white/20" : "bg-muted")}>
                      {orderCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Search Orders
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order number..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10 h-12 rounded-lg border-border/70 bg-background text-base"
          />
        </div>
      </div>

      {/* Orders List */}
      {ordersState.loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      ) : ordersState.error ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Orders</h3>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">{ordersState.error}</p>
            </div>
          </div>
        </div>
      ) : ordersState.orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filters.status ? "No Orders Found" : "No Orders Yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filters.status
              ? `No orders with ${filters.status.toLowerCase()} status. Try a different filter.`
              : "You haven't placed any orders yet. Start shopping now!"}
          </p>
          <CustomButton
            onClick={() => router.push("/menu")}
            className="rounded-xl h-11 px-6"
          >
            Browse Menu
          </CustomButton>
        </div>
      ) : (
        <div className="space-y-3">
          {ordersState.orders.length === 0 && !ordersState.loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filters.status ? "No Orders Found" : "No Orders Yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filters.status
                  ? `No orders with ${filters.status.toLowerCase()} status. Try a different filter.`
                  : "You haven't placed any orders yet. Start shopping now!"}
              </p>
              <CustomButton
                onClick={() => router.push("/menu")}
                className="rounded-xl h-11 px-6"
              >
                Browse Menu
              </CustomButton>
            </div>
          ) : (
            <>
              {ordersState.orders.map((order, orderIndex) => {
            const statusIndex = statusTabs.findIndex(tab => tab.value === order.orderProcessStatus?.name);
            const statusColor = getStatusColor(order.orderProcessStatus?.name || "", statusIndex >= 0 ? statusIndex : 0);
            const itemCount = order.items?.length || 0;
            const deliveryAddress = [
              order.deliveryAddress?.houseNumber,
              order.deliveryAddress?.streetNumber ? `St. ${order.deliveryAddress.streetNumber}` : null,
              order.deliveryAddress?.village,
              order.deliveryAddress?.commune,
              order.deliveryAddress?.district,
              order.deliveryAddress?.province,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="p-4 sm:p-5">
                  {/* Top row: Order Number, Items Count, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn("p-2.5 rounded-lg shrink-0 flex items-center justify-center", statusColor.bg)}>
                        <Package className={cn("h-5 w-5", statusColor.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Order
                        </p>
                        <p className="text-sm sm:text-base font-bold text-foreground truncate">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col-reverse sm:items-end">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className={cn("px-3 py-1 rounded-lg font-semibold text-xs whitespace-nowrap", statusColor.bg, statusColor.text)}>
                        {order.orderProcessStatus?.name || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Date Created */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2.5 mb-3 pb-3 border-b border-border/50">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Delivery
                      </p>
                      <p className="text-sm text-foreground leading-snug truncate" title={deliveryAddress}>
                        {deliveryAddress || "No address provided"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row: Total Price and View Details Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {formatCurrency(order.pricing?.finalTotal || 0)}
                      </span>
                    </div>
                    <CustomButton
                      variant="ghost"
                      className="h-9 px-4 rounded-lg text-sm font-semibold gap-1.5 flex items-center"
                    >
                      Details
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </CustomButton>
                  </div>
                </div>
              </div>
            );
          })}

              {/* Infinite Scroll Sentinel */}
              <div ref={observerRef} className="flex justify-center py-8">
                {ordersState.loadingMore && (
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading more orders...</p>
                  </div>
                )}
              </div>

              {/* End of list message */}
              {!ordersState.loadingMore && ordersState.pagination.currentPage >= ordersState.pagination.totalPages && ordersState.orders.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">You've seen all your orders</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function OrdersPageSkeleton() {
  return (
    <PageContainer className="py-8">
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
            <div className="h-8 bg-muted rounded-lg animate-pulse" />
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

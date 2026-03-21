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
import { useMyOrdersState, setStatusTabs, setStatusesLoading, setStatusesError } from "@/redux/features/main/store/state/my-orders-state";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { fetchAllOrderStatusService } from "@/redux/features/master-data/store/thunks/order-status-thunks";
import { setLoadedFilters, clearOrders } from "@/redux/features/main/store/slice/my-orders-slice";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

type Order = OrderResponse;

interface StatusTab {
  value: string;
  label: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, profile, authReady } = useAuthState();
  const {
    dispatch,
    orders,
    pagination,
    loading,
    error,
    statusTabs,
    loadedFilters,
  } = useMyOrdersState();

  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
  const [displayTabs, setDisplayTabs] = useState<StatusTab[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const [page, setPage] = useState(1);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart scroll restoration: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "orders",
  });

  // Build current filters string for comparison
  const currentFilters = JSON.stringify({
    status: filters.status,
    search: filters.search,
    businessId: profile?.businessId || AppDefault.BUSINESS_ID,
  });

  // Fetch order statuses
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;
    if (loading.statuses || statusTabs.length > 0) return; // Already loading or loaded

    const fetchStatuses = async () => {
      dispatch(setStatusesLoading(true));
      try {
        const result = await dispatch(
          fetchAllOrderStatusService({
            businessId: AppDefault.BUSINESS_ID,
            statuses: ["ACTIVE"],
            pageNo: 1,
            pageSize: 100,
          })
        ).unwrap();

        dispatch(setStatusTabs(result.content || []));
        dispatch(setStatusesError(null));
      } catch (error: any) {
        console.error("Failed to fetch order statuses:", error);
        dispatch(setStatusesError(error?.message || "Failed to load statuses"));
      } finally {
        dispatch(setStatusesLoading(false));
      }
    };

    fetchStatuses();
  }, [mounted, authReady, isAuthenticated, dispatch, loading.statuses, statusTabs.length]);

  // Build display tabs from Redux status tabs
  useEffect(() => {
    const tabs: StatusTab[] = [
      { value: "", label: "All Orders" },
      ...(statusTabs || []).map((status: any) => ({
        value: status.name,
        label: status.name,
      })),
    ];
    setDisplayTabs(tabs);
  }, [statusTabs]);

  // Load orders function
  const loadOrders = useCallback(
    async (pageNo: number) => {
      await dispatch(
        fetchMyOrdersService({
          pageNo,
          pageSize: 15,
          status: filters.status || undefined,
          search: filters.search || undefined,
          businessId: profile?.businessId || AppDefault.BUSINESS_ID,
        })
      );
    },
    [dispatch, filters, profile]
  );

  // Main fetch effect - matches product page pattern
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;

    const hasOrdersInStore = orders.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    // If data exists and filters match, don't fetch (this prevents double fetch!)
    if (hasOrdersInStore && filtersMatch) {
      return;
    }

    // Need to fetch if filters changed or no data
    if (!filtersMatch || !hasOrdersInStore) {
      // Clear old data if filters changed
      if (!filtersMatch && hasOrdersInStore) {
        dispatch(clearOrders());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setPage(1);
      dispatch(setLoadedFilters(currentFilters));
      loadOrders(1);
    }
  }, [
    currentFilters,
    loadedFilters,
    orders.length,
    loadOrders,
    dispatch,
    authReady,
    isAuthenticated,
    mounted,
  ]);

  // Infinite scroll
  const handleLoadMore = useCallback(() => {
    if (pagination.totalPages > page && !loading.list && !isLoadingRef.current) {
      isLoadingRef.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      loadOrders(nextPage).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [pagination.totalPages, loading.list, page, loadOrders]);

  useEffect(() => {
    if (!observerRef.current || !pagination.totalPages || loading.list) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          page < pagination.totalPages &&
          !loading.list &&
          !isLoadingRef.current
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [pagination.totalPages, loading.list, page, handleLoadMore]);

  const totalOrders = pagination.totalElements;

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
        {loading.statuses ? (
          <div className="flex gap-2 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse flex-shrink-0 w-24" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {displayTabs.map((tab) => {
              const isActive = filters.status === tab.value;
              const orderCount = isActive ? pagination.totalElements : 0;
              return (
                <button
                  key={tab.value || "all"}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, status: tab.value }));
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
      {loading.list && orders.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      ) : error.list ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Orders</h3>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">{error.list}</p>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
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
          {orders.map((order: Order) => {
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
                className="group relative rounded-2xl border border-border bg-card hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer overflow-hidden ring-1 ring-border/50"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                {/* Status indicator line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-5 sm:p-6">
                  {/* Header: Order Number + Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground truncate tracking-tight">
                        {order.orderNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <time dateTime={order.createdAt}>
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-primary/10 text-primary border border-primary/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {order.orderProcessStatus?.name || "Unknown"}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-border via-border to-transparent mb-4" />

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/80 leading-snug line-clamp-2" title={deliveryAddress}>
                          {deliveryAddress || "No address provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items and Total */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Items</p>
                        <p className="text-sm font-semibold text-foreground">{itemCount}</p>
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Amount</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(order.pricing?.finalTotal || 0)}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Infinite Scroll Sentinel */}
          <div ref={observerRef} className="flex justify-center py-8">
            {loading.list && orders.length > 0 && (
              <div className="text-center">
                <Loader2 className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading more orders...</p>
              </div>
            )}
          </div>

          {/* End of list message */}
          {!loading.list && page >= pagination.totalPages && orders.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">You've seen all your orders</p>
            </div>
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

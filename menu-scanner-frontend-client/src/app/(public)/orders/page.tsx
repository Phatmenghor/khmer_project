"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  Eye,
  X,
  ShoppingBag,
} from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useMyOrdersState } from "@/redux/features/main/store/state/my-orders-state";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { setLoadedFilters, clearOrders } from "@/redux/features/main/store/slice/my-orders-slice";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomerOrderDetailModal } from "@/components/shared/modal/customer-order-detail-modal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderId: "",
  });

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
  const loadOrders = async (pageNo: number) => {
    await dispatch(
      fetchMyOrdersService({
        pageNo,
        pageSize: AppDefault.PAGE_SIZE_OPTIONS?.[1] || 15,
        status: filters.status || undefined,
        search: filters.search || undefined,
        businessId: profile?.businessId || AppDefault.BUSINESS_ID,
      })
    );
  };

  // Main fetch effect
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;

    const hasOrdersInStore = orders.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    // If data exists and filters match, don't fetch
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

      setCurrentPage(1);
      dispatch(setLoadedFilters(currentFilters));
      loadOrders(1);
    }
  }, [
    currentFilters,
    loadedFilters,
    orders.length,
    dispatch,
    authReady,
    isAuthenticated,
    mounted,
  ]);

  const handleViewOrder = (order: Order) => {
    setDetailModalState({ isOpen: true, orderId: order.id });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    // Not changing page size dynamically, keeping consistent
  };

  // Create table columns
  const tableColumns = useMemo(
    () => createOrderTableColumns(handleViewOrder),
    []
  );

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

      {/* Filters Section */}
      <div className="mt-8 mb-6 space-y-4">
        {/* Status Filter Tabs */}
        <div>
          {loading.statuses ? (
            <div className="flex gap-2 pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse flex-shrink-0 w-24" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {displayTabs.map((tab) => {
                const isActive = filters.status === tab.value;
                return (
                  <button
                    key={tab.value || "all"}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, status: tab.value }));
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-card border border-border/50 text-foreground hover:border-primary/30 hover:bg-muted"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && pagination.totalElements > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
                        {pagination.totalElements}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Search Orders
          </label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="pl-10 h-11 rounded-lg border-border/70 bg-background text-base"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: "" }));
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      {!isAuthenticated ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Sign In Required</h3>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">
                Please sign in to view your orders.
              </p>
              <CustomButton
                onClick={() => router.push("/login")}
                className="mt-4 h-10 rounded-lg"
              >
                Sign In
              </CustomButton>
            </div>
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
      ) : orders.length === 0 && !loading.list ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
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
        <DataTableWithPagination
          data={orders}
          columns={tableColumns}
          loading={loading.list}
          emptyMessage="No orders found"
          getRowKey={(order) => order.id}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={AppDefault.PAGE_SIZE_OPTIONS?.[1] || 15}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS || [10, 15, 20]}
          showPageSizeSelector={false}
        />
      )}

      {/* Detail Modal */}
      <CustomerOrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, orderId: "" })}
      />
    </PageContainer>
  );
}

// Helper function to create table columns
function createOrderTableColumns(
  handleViewOrder: (order: Order) => void
): TableColumn<Order>[] {
  return [
    {
      key: "orderNumber",
      label: "Order #",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <span className="text-xs font-mono font-bold text-foreground">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      minWidth: "150px",
      maxWidth: "200px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "COMPLETED":
            case "READY":
            case "DELIVERED":
              return "text-green-600 dark:text-green-400 font-semibold";
            case "CANCELLED":
            case "FAILED":
              return "text-red-600 dark:text-red-400 font-semibold";
            case "PENDING":
            case "PREPARING":
            case "CONFIRMED":
            case "PROCESSING":
              return "text-blue-600 dark:text-blue-400 font-semibold";
            case "SHIPPED":
              return "text-cyan-600 dark:text-cyan-400 font-semibold";
            default:
              return "text-gray-600 dark:text-gray-400 font-semibold";
          }
        };
        return (
          <span className={`text-xs ${getStatusColor(order?.orderStatus)}`}>
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => {
        const getPaymentColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "text-green-600 dark:text-green-400 font-semibold";
            case "UNPAID":
            case "PENDING":
              return "text-orange-600 dark:text-orange-400 font-semibold";
            case "REFUNDED":
              return "text-red-600 dark:text-red-400 font-semibold";
            default:
              return "text-gray-600 dark:text-gray-400 font-semibold";
          }
        };
        return (
          <span className={`text-xs ${getPaymentColor(order?.payment?.paymentStatus)}`}>
            {order?.payment?.paymentStatus || "---"}
          </span>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      minWidth: "80px",
      maxWidth: "100px",
      render: (order) => (
        <span className="text-xs font-medium text-foreground">
          {order?.items?.length || 0}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => (
        <span className="text-xs font-bold text-green-600 dark:text-green-400">
          {formatCurrency(
            order?.pricing?.after?.finalTotal ?? order?.pricing?.before?.finalTotal ?? 0
          )}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "120px",
      render: (order) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
        </div>
      ),
    },
  ];
}

function OrdersPageSkeleton() {
  return (
    <PageContainer className="py-8">
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-11 bg-muted rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

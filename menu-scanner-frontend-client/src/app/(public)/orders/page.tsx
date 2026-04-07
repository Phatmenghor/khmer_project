"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  Eye,
  X,
  ShoppingBag,
  XCircle,
  Loader2,
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
import { CancelOrderModal } from "@/components/shared/modal/cancel-order-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { ORDER_STATUS_ADMIN_FILTER, PAYMENT_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { indexDisplay } from "@/utils/common/common";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { cancelOrderService } from "@/redux/features/main/store/thunks/my-orders-thunks";

type Order = OrderResponse;

interface StatusTab {
  value: string;
  label: string;
}

interface FilterState {
  status: string;
  paymentStatus: string;
  search: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const reduxDispatch = useAppDispatch();
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

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
  const [displayTabs, setDisplayTabs] = useState<StatusTab[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderId: "",
  });
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    orderId: "",
    orderNumber: "",
  });
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

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
    paymentStatus: filters.paymentStatus,
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
        pageSize: 15,
        status: filters.status || undefined,
        paymentStatus: filters.paymentStatus && filters.paymentStatus !== "ALL" ? filters.paymentStatus : undefined,
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

  const handleCancelOrder = (order: Order) => {
    // Only allow canceling PENDING orders
    if (order.orderStatus !== "PENDING") {
      showToast.error("Only pending orders can be cancelled");
      return;
    }

    // Open cancel modal instead of calling API directly
    setCancelModalState({
      isOpen: true,
      orderId: order.id,
      orderNumber: order.orderNumber || "",
    });
  };

  const handleConfirmCancel = async (data: {
    status: "CANCELLED";
    customerNote: string;
  }) => {
    const orderId = cancelModalState.orderId;
    if (!orderId) return;

    try {
      setCancelingOrderId(orderId);

      // Call the cancel order service from Redux
      await reduxDispatch(cancelOrderService(orderId)).unwrap();

      showToast.success("Order cancelled successfully");

      // Close the modal
      setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" });

      // Reload orders to reflect the cancellation
      loadOrders(currentPage);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to cancel order. Please try again.";
      showToast.error(errorMessage);
      throw error; // Re-throw to let the modal handle it
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Page size is now fixed at 15 items per page
  // const handlePageSizeChange = (size: number) => {
  //   dispatch(setGlobalPageSize(size));
  //   setCurrentPage(1);
  // };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", paymentStatus: "", search: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.status || filters.paymentStatus || filters.search;

  // Create table columns
  const tableColumns = useMemo(
    () => createOrderTableColumns(handleViewOrder, handleCancelOrder, cancelingOrderId, pagination),
    [cancelingOrderId, pagination]
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
        {/* Search and Filters Row - All on one line, responsive */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full">
          {/* Search Bar */}
          <div className="flex-1 min-w-0">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Search Orders
            </label>
            <div className="relative">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Order Status Filter */}
          <div className="flex-1 min-w-0">
            <CustomSelect
              options={[
                { value: "", label: "All Order Status" },
                ...ORDER_STATUS_ADMIN_FILTER.filter(opt => opt.value !== "ALL"),
              ]}
              value={filters.status || ""}
              placeholder="Filter by order status"
              onValueChange={handleStatusChange}
              label="Order Status"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="flex-1 min-w-0">
            <CustomSelect
              options={PAYMENT_STATUS_ADMIN_FILTER}
              value={filters.paymentStatus || "ALL"}
              placeholder="Filter by payment status"
              onValueChange={handlePaymentStatusChange}
              label="Payment Status"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <CustomButton
              onClick={handleClearFilters}
              variant="ghost"
              className="h-11 px-4 flex items-center gap-2 border border-border/50 self-end"
            >
              <X className="h-4 w-4" />
              Clear
            </CustomButton>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.status && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
                <span>Order: {filters.status}</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, status: "" }))}
                  className="hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.paymentStatus && filters.paymentStatus !== "ALL" && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
                <span>Payment: {filters.paymentStatus}</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, paymentStatus: "" }))}
                  className="hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.search && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
                <span>Search: {filters.search}</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                  className="hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
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
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          pageSize={15}
          pageSizeOptions={[15]}
          hidePageSizeSelector={true}
          hideEllipsis={true}
        />
      )}

      {/* Detail Modal */}
      <CustomerOrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, orderId: "" })}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalState.isOpen}
        onClose={() =>
          setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" })
        }
        orderId={cancelModalState.orderId}
        orderNumber={cancelModalState.orderNumber}
        onConfirm={handleConfirmCancel}
      />
    </PageContainer>
  );
}

// Helper function to create table columns
function createOrderTableColumns(
  handleViewOrder: (order: Order) => void,
  handleCancelOrder: (order: Order) => void,
  cancelingOrderId: string | null,
  pagination: any
): TableColumn<Order>[] {
  return [
    {
      key: "index",
      label: "#",
      minWidth: "40px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="font-medium text-xs">
          {indexDisplay(pagination.pageNo || 1, pagination.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      minWidth: "140px",
      maxWidth: "170px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "orderNumber",
      label: "Order #",
      minWidth: "100px",
      maxWidth: "130px",
      render: (order) => (
        <span className="text-xs font-mono font-medium">
          {order?.orderNumber || "---"}
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
              return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800";
            case "CANCELLED":
            case "FAILED":
              return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800";
            case "PENDING":
              return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800";
            case "PREPARING":
            case "CONFIRMED":
            case "PROCESSING":
              return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
            case "SHIPPED":
            case "IN_TRANSIT":
              return "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800";
            default:
              return "bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-800";
          }
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getStatusColor(order?.orderStatus)}`}>
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      minWidth: "130px",
      maxWidth: "160px",
      render: (order) => {
        const getPaymentColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800";
            case "UNPAID":
            case "PENDING":
              return "bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800";
            case "REFUNDED":
              return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800";
            case "PARTIALLY_PAID":
              return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
            default:
              return "bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-800";
          }
        };
        const paymentStatus = order?.payment?.paymentStatus || "---";
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getPaymentColor(paymentStatus)}`}>
            {paymentStatus}
          </span>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      minWidth: "80px",
      maxWidth: "110px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.items?.length || 0}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => {
        const finalTotal = order?.pricing?.after?.finalTotal ?? order?.pricing?.before?.finalTotal ?? 0;
        const hadChange = order?.pricing?.hadOrderLevelChangeFromPOS;
        const beforeTotal = order?.pricing?.before?.finalTotal ?? 0;

        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">
              {formatCurrency(finalTotal)}
            </span>
            {hadChange && beforeTotal !== finalTotal && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(beforeTotal)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "130px",
      render: (order) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          {order.orderStatus === "PENDING" && (
            <ActionButton
              icon={cancelingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              tooltip="Cancel Order"
              onClick={() => handleCancelOrder(order)}
              variant="destructive"
              disabled={cancelingOrderId === order.id}
            />
          )}
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

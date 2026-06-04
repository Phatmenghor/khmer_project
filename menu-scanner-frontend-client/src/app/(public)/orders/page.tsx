"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  Eye,
  X,
  ShoppingBag,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useMyOrdersState } from "@/features/main/store/state/my-orders-state";
import { fetchMyOrdersService, cancelOrderService } from "@/features/main/store/thunks/my-orders-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
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
import { useAppSelector, useAppDispatch } from "@/store";
import { SignInRequired } from "@/components/shared/auth/sign-in-required";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";

type Order = OrderResponse;

interface FilterState {
  status: string;
  paymentStatus: string;
  search: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, profile, authReady } = useAuthState();
  const {
    orders,
    pagination,
    loading,
    error,
  } = useMyOrdersState();

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
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
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { handleDownloadReceipt, downloadingOrderId } = useDownloadReceipt();
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "orders",
  });

  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;

    dispatch(
      fetchMyOrdersService({
        pageNo: currentPage,
        pageSize: 15,
        status: filters.status || undefined,
        paymentStatus:
          filters.paymentStatus && filters.paymentStatus !== "ALL"
            ? filters.paymentStatus
            : undefined,
        search: debouncedSearch || undefined,
        businessId: profile?.businessId || AppDefault.BUSINESS_ID,
      })
    );
  }, [
    authReady,
    isAuthenticated,
    mounted,
    currentPage,
    debouncedSearch,
    filters.status,
    filters.paymentStatus,
    dispatch,
    profile?.businessId,
  ]);

  const handleViewOrder = useCallback((order: Order) => {
    setDetailModalState({ isOpen: true, orderId: order.id });
  }, []);

  const handleCancelOrder = useCallback((order: Order) => {
    if (order.orderStatus !== "PENDING") {
      showToast.error(Messages.orders.pendingOnly);
      return;
    }
    setCancelModalState({
      isOpen: true,
      orderId: order.id,
      orderNumber: order.orderNumber || "",
    });
  }, []);

  const handleConfirmCancel = async (data: {
    status: "CANCELLED";
    customerNote: string;
  }) => {
    const orderId = cancelModalState.orderId;
    if (!orderId) return;

    try {
      setCancelingOrderId(orderId);
      await dispatch(cancelOrderService(orderId)).unwrap();
      showToast.success(Messages.orders.cancelled);
      setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" });
      dispatch(
        fetchMyOrdersService({
          pageNo: currentPage,
          pageSize: 15,
          status: filters.status || undefined,
          paymentStatus:
            filters.paymentStatus && filters.paymentStatus !== "ALL"
              ? filters.paymentStatus
              : undefined,
          search: debouncedSearch || undefined,
          businessId: profile?.businessId || AppDefault.BUSINESS_ID,
        })
      );
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || "Failed to cancel order. Please try again.";
      showToast.error(errorMessage);
      throw error;
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const tableColumns = useMemo(
    () =>
      createOrderTableColumns(
        handleViewOrder,
        handleCancelOrder,
        handleDownloadReceipt,
        cancelingOrderId,
        downloadingOrderId,
        pagination
      ),
    [handleViewOrder, handleCancelOrder, handleDownloadReceipt, cancelingOrderId, downloadingOrderId, pagination]
  );

  const totalOrders = pagination.totalElements;

  if (!mounted || !authReady) {
    return <OrdersPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <SignInRequired
          title="My Orders"
          description="Sign in to view your orders and track deliveries."
          icon="📦"
          onSignIn={() => setLoginModalOpen(true)}
          browseButtonText="Browse Products"
          onBrowse={() => router.push("/products")}
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  return (
    <PageContainer className="min-h-screen flex flex-col py-6 sm:py-8">
      <PageHeader
        title="My Orders"
        subtitle={`You have ${totalOrders} order${totalOrders !== 1 ? "s" : ""}`}
        icon={ShoppingBag}
      />

      <div className="mt-8 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
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

          <div className="flex flex-shrink-0 gap-3 items-end w-full sm:w-auto">
            <div className="w-auto flex-shrink-0
              [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-1
              [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
              [&_.w-full]:!w-auto">
              <CustomSelect
                options={[
                  { value: "", label: "All Order Status" },
                  ...ORDER_STATUS_ADMIN_FILTER.filter(opt => opt.value !== "ALL"),
                ]}
                value={filters.status || ""}
                placeholder="Filter by order status"
                onValueChange={handleStatusChange}
                label="Order Status"
                size="xl"
              />
            </div>

            <div className="w-auto flex-shrink-0
              [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-1
              [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
              [&_.w-full]:!w-auto">
              <CustomSelect
                options={PAYMENT_STATUS_ADMIN_FILTER}
                value={filters.paymentStatus || "ALL"}
                placeholder="Filter by payment status"
                onValueChange={handlePaymentStatusChange}
                label="Payment Status"
                size="xl"
              />
            </div>

            {hasActiveFilters && (
              <CustomButton
                onClick={handleClearFilters}
                variant="ghost"
                className="h-11 px-4 flex items-center gap-2 border border-border/50 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                Clear
              </CustomButton>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.status && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
                <span>Order: {filters.status}</span>
                <button
                  onClick={() => { setFilters((prev) => ({ ...prev, status: "" })); setCurrentPage(1); }}
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
                  onClick={() => { setFilters((prev) => ({ ...prev, paymentStatus: "" })); setCurrentPage(1); }}
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
                  onClick={() => { setFilters((prev) => ({ ...prev, search: "" })); setCurrentPage(1); }}
                  className="hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error.list ? (
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
          showPageSizeSelector={false}
          hideEllipsis={true}
        />
      )}

      <CustomerOrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, orderId: "" })}
      />

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


function createOrderTableColumns(
  handleViewOrder: (order: Order) => void,
  handleCancelOrder: (order: Order) => void,
  handleDownloadReceipt: (order: Order) => void,
  cancelingOrderId: string | null,
  downloadingOrderId: string | null,
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
          {indexDisplay(pagination.currentPage || 1, pagination.pageSize || 15, index + 1)}
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
      render: (order) => (
        <span className="text-xs font-bold text-green-600 dark:text-green-400">
          {formatCurrency(order?.pricing?.finalTotal ?? 0)}
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
              return "text-green-600 dark:text-green-400 font-medium";
            case "CANCELLED":
            case "FAILED":
              return "text-red-600 dark:text-red-400 font-medium";
            case "PENDING":
              return "text-yellow-600 dark:text-yellow-400 font-medium";
            case "PREPARING":
            case "CONFIRMED":
            case "PROCESSING":
              return "text-blue-600 dark:text-blue-400 font-medium";
            case "SHIPPED":
            case "IN_TRANSIT":
              return "text-cyan-600 dark:text-cyan-400 font-medium";
            default:
              return "text-gray-600 dark:text-gray-400 font-medium";
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
      minWidth: "120px",
      maxWidth: "160px",
      render: (order) => {
        const paymentStatus = order?.payment?.paymentStatus;
        const paymentMethod = order?.payment?.paymentMethod;
        const getPaymentColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "text-green-600 dark:text-green-400 font-medium";
            case "UNPAID":
              return "text-orange-600 dark:text-orange-400 font-medium";
            case "REFUNDED":
              return "text-red-600 dark:text-red-400 font-medium";
            default:
              return "text-gray-600 dark:text-gray-400 font-medium";
          }
        };
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs ${getPaymentColor(paymentStatus ?? "")}`}>
              {paymentStatus || "---"}
            </span>
            <span className="text-xs text-muted-foreground">
              {paymentMethod || "---"}
            </span>
          </div>
        );
      },
    },
    {
      key: "deliveryOption",
      label: "Delivery",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.deliveryOption?.name || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      minWidth: "130px",
      maxWidth: "160px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "120px",
      maxWidth: "160px",
      render: (order) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={
              downloadingOrderId === order.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />
            }
            tooltip="Download Receipt"
            onClick={() => handleDownloadReceipt(order)}
            disabled={downloadingOrderId === order.id}
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
    <PageContainer className="min-h-screen flex flex-col py-8">
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

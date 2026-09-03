"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
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
import { ActionButton, CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { dateTimeFormat } from "@/utils/date/date-time-format";

import { CustomerOrderDetailModal } from "@/components/shared/modal/customer-order-detail-modal";
import { CancelOrderModal } from "@/components/shared/modal/cancel-order-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { ORDER_STATUS_ADMIN_FILTER, PAYMENT_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { indexDisplay } from "@/utils/common/common";
import { useAppDispatch } from "@/store";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { PageState } from "@/components/shared/page-state";
import { Badge } from "@/components/ui/badge";
import { lookupGuestOrdersService } from "@/features/main/store/thunks/order-thunks";
import { LOCAL_STORAGE_KEYS } from "@/constants/storage-keys";

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
  const { orders, pagination, loading, error } = useMyOrdersState();

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [guestOrders, setGuestOrders] = useState<Order[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);

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

  const fetchOrders = useCallback(() => {
    dispatch(
      fetchMyOrdersService({
        pageNo: currentPage,
        pageSize: 15,
        orderStatus: filters.status || undefined,
        paymentStatus:
          filters.paymentStatus && filters.paymentStatus !== "ALL"
            ? filters.paymentStatus
            : undefined,
        search: debouncedSearch || undefined,
        businessId: profile?.businessId || AppDefault.BUSINESS_ID,
      })
    );
  }, [dispatch, currentPage, filters.status, filters.paymentStatus, debouncedSearch, profile?.businessId]);

  const fetchGuestOrders = useCallback(async () => {
    try {
      setGuestLoading(true);
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (ids && ids.length > 0) {
        const results = await dispatch(lookupGuestOrdersService(ids)).unwrap();
        setGuestOrders(results || []);
      } else {
        setGuestOrders([]);
      }
    } catch {
      setGuestOrders([]);
    } finally {
      setGuestLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!authReady || !mounted) return;
    if (isAuthenticated) {
      fetchOrders();
    } else {
      fetchGuestOrders();
    }
  }, [authReady, isAuthenticated, mounted, fetchOrders, fetchGuestOrders]);

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
      if (isAuthenticated) {
        fetchOrders();
      } else {
        fetchGuestOrders();
      }
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

  const filteredGuestOrders = useMemo(() => {
    return guestOrders.filter((order) => {
      if (filters.status && order.orderStatus !== filters.status) return false;
      if (filters.paymentStatus && filters.paymentStatus !== "ALL" && order.payment?.paymentStatus !== filters.paymentStatus) return false;
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchesCustomer = order.customerName?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesCustomer) return false;
      }
      return true;
    });
  }, [guestOrders, filters.status, filters.paymentStatus, debouncedSearch]);

  const effectivePagination = useMemo(() => {
    if (isAuthenticated) return pagination;
    return {
      pageNo: 1,
      pageSize: 50,
      totalElements: filteredGuestOrders.length,
      totalPages: 1,
      last: true,
    };
  }, [isAuthenticated, pagination, filteredGuestOrders.length]);

  const tableColumns = useMemo(
    () =>
      createOrderTableColumns(
        handleViewOrder,
        handleCancelOrder,
        (order) => handleDownloadReceipt(order),
        cancelingOrderId,
        downloadingOrderId,
        effectivePagination
      ),
    [handleViewOrder, handleCancelOrder, handleDownloadReceipt, cancelingOrderId, downloadingOrderId, effectivePagination]
  );

  const displayedOrders = isAuthenticated ? orders : filteredGuestOrders;
  const totalOrders = isAuthenticated ? pagination.totalElements : filteredGuestOrders.length;
  const isPageLoading = isAuthenticated ? (loading && !orders.length) : guestLoading;

  if (!mounted || !authReady || isPageLoading) {
    return <OrdersPageSkeleton />;
  }

  if (!isAuthenticated && guestOrders.length === 0) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <PageState
          type="empty"
          title="No Recent Guest Orders"
          description="You haven't placed any guest orders on this device yet. Start shopping or sign in to access your saved account orders."
          actionLabel="Browse Products"
          onAction={() => router.push("/products")}
          secondaryActionLabel="Sign In"
          onSecondaryAction={() => setLoginModalOpen(true)}
          size="lg"
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen flex flex-col py-4 sm:py-5">
      <PageHeader
        title="My Orders"
        subtitle={`You have ${totalOrders} order${totalOrders !== 1 ? "s" : ""}`}
        icon={ShoppingBag}
      />

      {/* ── CONTROLS: SEARCH & 2 DROPDOWN FILTERS ── */}
      <div className="mt-5 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {/* Search bar following public homepage/products pattern */}
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 h-9 rounded-xl border-border/80 bg-muted/40 hover:bg-muted/60 focus:bg-background text-xs font-medium transition-all"
            />
            {filters.search && (
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: "" }));
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </CustomButton>
            )}
          </div>

          {/* 2 Select Filters following custom-select pattern */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="min-w-[150px] flex-1 sm:flex-initial">
              <CustomSelect
                options={[
                  { value: "", label: "All Order Status" },
                  ...ORDER_STATUS_ADMIN_FILTER.filter((opt) => opt.value !== "ALL"),
                ]}
                value={filters.status || ""}
                placeholder="Order Status"
                onValueChange={handleStatusChange}
                size="md"
              />
            </div>

            <div className="min-w-[150px] flex-1 sm:flex-initial">
              <CustomSelect
                options={PAYMENT_STATUS_ADMIN_FILTER}
                value={filters.paymentStatus || "ALL"}
                placeholder="Payment Status"
                onValueChange={handlePaymentStatusChange}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {error.list && isAuthenticated ? (
        <PageState
          type="error"
          title="Error Loading Orders"
          description={error.list}
          actionLabel="Try again"
          onAction={fetchOrders}
          size="md"
        />
      ) : displayedOrders.length === 0 && !isPageLoading ? (
        <PageState
          type={filters.status || filters.paymentStatus || debouncedSearch ? "no-results" : "empty"}
          title={filters.status || filters.paymentStatus || debouncedSearch ? "No Matching Orders" : "No Orders Yet"}
          description={
            filters.status || filters.paymentStatus || debouncedSearch
              ? "No orders match your current search and filter criteria."
              : "You haven't placed any orders yet. Start ordering your favorite meals now!"
          }
          actionLabel="Browse Products"
          onAction={() => router.push("/products")}
          size="md"
        />
      ) : (
        <DataTableWithPagination
          data={displayedOrders}
          columns={tableColumns}
          loading={isPageLoading}
          emptyMessage="No orders found"
          getRowKey={(order) => order.id}
          currentPage={currentPage}
          totalElements={totalOrders}
          totalPages={effectivePagination.totalPages}
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
        onOrderCancelled={fetchOrders}
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
      maxWidth: "50px",
      render: (_, index) => (
        <span className="text-xs font-semibold text-muted-foreground font-mono">
          {indexDisplay(pagination.currentPage || 1, pagination.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "orderNumber",
      label: "Order #",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => (
        <span className="text-xs font-mono font-extrabold text-foreground">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      minWidth: "80px",
      maxWidth: "100px",
      render: (order) => (
        <span className="text-xs font-bold text-foreground">
          {order?.items?.length || 0} item{(order?.items?.length || 0) !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "110px",
      maxWidth: "130px",
      render: (order) => (
        <span className="text-xs font-black text-primary">
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
        const cfg = ORDER_STATUS_BADGE_CONFIG[order?.orderStatus || "PENDING"] || ORDER_STATUS_BADGE_CONFIG.PENDING;
        return (
          <span
            className={cn(
              "inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-colors duration-150 cursor-default select-none shadow-2xs",
              cfg.badgeBg,
              cfg.border,
              "hover:border-foreground/40 dark:hover:border-foreground/50"
            )}
          >
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => {
        const paymentStatus = order?.payment?.paymentStatus;
        const paymentMethod = order?.payment?.paymentMethod;
        const isPaid = paymentStatus === "PAID";
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-foreground truncate">
              {paymentMethod || "Cash"}
            </span>
            <span className={cn("text-[10px] font-extrabold truncate", isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {paymentStatus || "UNPAID"}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date & Time",
      minWidth: "130px",
      maxWidth: "160px",
      render: (order) => (
        <span className="text-xs text-muted-foreground font-medium">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={
              downloadingOrderId === order.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )
            }
            tooltip="Download Receipt"
            onClick={() => handleDownloadReceipt(order)}
            disabled={downloadingOrderId === order.id}
          />
          {order.orderStatus === "PENDING" && (
            <ActionButton
              icon={cancelingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
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
    <PageContainer className="min-h-screen flex flex-col py-5">
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-xl animate-pulse w-1/3" />
        <div className="h-10 bg-muted rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

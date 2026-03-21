"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  ChevronLeft,
  Search,
  AlertCircle,
  Loader2,
  MapPin,
  Truck,
  CreditCard,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAppDispatch } from "@/redux/store";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";

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

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  CONFIRMED: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  PROCESSING: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  SHIPPED: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  CANCELLED: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
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

  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;

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
  }, [mounted, authReady, isAuthenticated, filters, ordersState.pagination.currentPage, dispatch, profile]);

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
        icon={<Package className="h-8 w-8" />}
        onBack={() => router.back()}
      />

      {/* Filter Section */}
      <div className="mt-8 mb-8 space-y-4 bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Filter by Status
            </label>
            <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger className="h-11 rounded-lg border-border/70 bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <div className="flex-1">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Search Orders
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by order number..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-11 rounded-lg border-border/70 bg-background"
              />
            </div>
          </div>
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
          <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping now!
          </p>
          <CustomButton
            onClick={() => router.push("/menu")}
            className="rounded-xl h-11 px-6"
          >
            Browse Menu
          </CustomButton>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersState.orders.map((order) => {
            const statusColor = STATUS_COLORS[order.orderProcessStatus?.name || "PENDING"] || STATUS_COLORS.PENDING;
            const itemCount = order.items?.length || 0;

            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn("p-3 rounded-xl", statusColor.bg)}>
                        <div className={cn("text-lg", statusColor.text)}>
                          {statusColor.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-muted-foreground">Order Number</p>
                        <p className="text-base sm:text-lg font-bold text-foreground truncate">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>
                    <div className={cn("px-3 py-1.5 rounded-lg font-semibold text-sm whitespace-nowrap", statusColor.bg, statusColor.text)}>
                      {order.orderProcessStatus?.name || "Unknown"}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Order Date
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {dateTimeFormat(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Total Amount
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatCurrency(order.pricing?.finalTotal || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Items Count */}
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Items
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {itemCount} product{itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Payment
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {order.payment?.paymentStatus || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6 pb-6 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-3">Order Items</p>
                    <div className="space-y-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg p-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.product?.imageUrl && (
                              <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={sanitizeImageUrl(item.product.imageUrl)}
                                  alt={item.product?.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {item.product?.name || "Unknown Product"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.product?.sizeName && `Size: ${item.product.sizeName}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-foreground">×{item.quantity}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.totalPrice || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {itemCount > 3 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{itemCount - 3} more item{itemCount - 3 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-start gap-3 mb-6 pb-6 border-b border-border/50">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-2">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryAddress?.houseNumber && `${order.deliveryAddress.houseNumber}, `}
                        {order.deliveryAddress?.streetNumber && `Street ${order.deliveryAddress.streetNumber}, `}
                        {order.deliveryAddress?.village && `${order.deliveryAddress.village}, `}
                        {order.deliveryAddress?.commune && `${order.deliveryAddress.commune}, `}
                        {order.deliveryAddress?.district && `${order.deliveryAddress.district}, `}
                        {order.deliveryAddress?.province}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3">
                    <CustomButton
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </CustomButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {ordersState.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {ordersState.pagination.currentPage} of {ordersState.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <CustomButton
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
              variant="outline"
              className="h-10 rounded-lg"
            >
              Previous
            </CustomButton>
            <CustomButton
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
              variant="outline"
              className="h-10 rounded-lg"
            >
              Next
            </CustomButton>
          </div>
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
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

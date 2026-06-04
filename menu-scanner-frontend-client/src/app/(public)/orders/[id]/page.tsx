"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState } from "react";
import { OrderStatus, getOrderStatusLabel, getOrderStatusColor } from "@/enums/order-status.enum";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Phone, MapPin, Clock, CheckCircle2, XCircle, Truck, Package, AlertCircle, Loader2, User, MessageSquare, Check, Zap } from "lucide-react";
import { useAppDispatch } from "@/store";
import {
  fetchOrderDetailsService,
  cancelOrderService,
} from "@/features/main/store/thunks/my-orders-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; lightBg: string }
> = {
  PENDING: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  CONFIRMED: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  PROCESSING: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    lightBg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    bg: "bg-green-100 dark:bg-green-900/30",
    lightBg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  CANCELLED: {
    bg: "bg-red-100 dark:bg-red-900/30",
    lightBg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
};

interface StatusTimelineItem {
  id: string;
  name: string;
  order: number;
}

interface OrderDetailState {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
  cancelling: boolean;
  statusTimeline: StatusTimelineItem[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const orderId = params.id as string;

  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: true,
    error: null,
    cancelling: false,
    statusTimeline: [],
  });

  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const orderResult = await dispatch(fetchOrderDetailsService(orderId)).unwrap();

        setState((prev) => ({
          ...prev,
          order: orderResult,
          loading: false,
        }));
      } catch (error: unknown) {
        setState((prev) => ({
          ...prev,
          error: (error as { message?: string })?.message || "Failed to load order details",
          loading: false,
        }));
      }
    };

    fetchOrderDetails();
  }, [orderId, dispatch]);

  const handleCopyOrderNumber = () => {
    if (state.order) {
      navigator.clipboard.writeText(state.order.orderNumber);
      setCopied(true);
      showToast.success(Messages.orders.numberCopied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!state.order) return;

    const shareText = `Order #${state.order.orderNumber} - ${formatCurrency(state.order.pricing.finalTotal)}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Order Details",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast.success(Messages.orders.linkCopied);
    }
  };

  const handleCancelOrder = async () => {
    if (!state.order || state.order.orderStatus === "CANCELLED") {
      return;
    }

    try {
      setState((prev) => ({ ...prev, cancelling: true }));
      await dispatch(cancelOrderService(orderId)).unwrap();
      showToast.success(Messages.orders.cancelled);
      setState((prev) => ({
        ...prev,
        order: prev.order
          ? { ...prev.order, orderStatus: OrderStatus.CANCELLED }
          : null,
        cancelling: false,
      }));
      setShowCancelConfirm(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.orders.cancelFailed);
      setState((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const canCancel =
    state.order &&
    (state.order.orderStatus === "PENDING" ||
      state.order.orderStatus === "CONFIRMED");

  const getStatusPosition = (status: string | null): number => {
    if (!status) return -1;
    const statusEntry = state.statusTimeline.find((s) => s.name === status);
    return statusEntry?.order ?? -1;
  };

  if (state.loading) {
    return <OrderDetailSkeleton />;
  }

  if (state.error || !state.order) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-6 sm:py-8">
        <div className="mb-6">
          <CustomButton
            variant="ghost"
            className="gap-2 h-10 px-4 rounded-lg"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </CustomButton>
        </div>

        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8">
          <div className="flex items-start gap-4 max-w-md mx-auto text-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
                Order Not Found
              </h2>
              <p className="text-red-800 dark:text-red-300 text-sm mt-2">
                {state.error || "The order you're looking for doesn't exist."}
              </p>
              <CustomButton
                onClick={() => router.push("/orders")}
                className="mt-6 w-full h-11 rounded-xl"
              >
                Back to Orders
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const order = state.order;
  const statusColor =
    STATUS_COLORS[order.orderStatus || "PENDING"] ||
    STATUS_COLORS.PENDING;
  const currentStatusPosition = getStatusPosition(
    order.orderStatus || null
  );

  const formattedDeliveryAddress = [
    order.deliveryAddress?.houseNumber,
    order.deliveryAddress?.streetNumber
      ? `St. ${order.deliveryAddress.streetNumber}`
      : null,
    order.deliveryAddress?.village,
    order.deliveryAddress?.commune,
    order.deliveryAddress?.district,
    order.deliveryAddress?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <PageContainer className="min-h-screen flex flex-col py-6 sm:py-8">
      {}
      <div className="mb-6">
        <CustomButton
          variant="ghost"
          className="gap-2 h-10 px-4 rounded-lg"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </CustomButton>
      </div>

      {}
      <PageHeader
        title="Order Details"
        icon={Package}
      />

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">
              {}
              <div className="flex items-start justify-between pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Order Number
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {order.orderNumber}
                  </p>
                </div>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 rounded-lg gap-2"
                  onClick={handleCopyOrderNumber}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </CustomButton>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Time
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {}
              <div className="pb-4 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Payment Status
                </p>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs",
                    order.payment?.paymentStatus === "PAID"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : order.payment?.paymentStatus === "REFUNDED"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  )}
                >
                  {order.payment?.paymentStatus === "PAID" && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {order.payment?.paymentStatus || "Unknown"}
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Method
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {order.deliveryOption?.name || "Standard"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Fee
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(order.pricing?.deliveryFee || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Order Progress
            </h2>

            {state.statusTimeline.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex items-flex-start gap-1 min-w-max px-2">
                  {state.statusTimeline.map((status, index) => {
                    const statusOrder = status.order || 0;
                    const isCompleted = currentStatusPosition >= statusOrder;
                    const isCurrent = currentStatusPosition === statusOrder;
                    const statusHistory = order.statusHistory?.find(
                      (h) => h.statusName === status.name
                    );

                    return (
                      <div key={status.id} className="flex flex-col items-center flex-shrink-0">
                        {}
                        <div className="flex gap-1 items-center">
                          <div
                            className={cn(
                              "w-14 h-14 rounded-full flex items-center justify-center font-semibold text-sm transition-all ring-2 ring-offset-2 dark:ring-offset-slate-950 flex-shrink-0",
                              isCompleted
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-200"
                                : isCurrent
                                  ? "bg-primary text-primary-foreground ring-primary/50 shadow-lg shadow-primary/20 animate-pulse"
                                  : "bg-muted text-muted-foreground ring-muted"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-5 w-5" />
                            ) : isCurrent ? (
                              <Zap className="h-5 w-5" />
                            ) : (
                              status.order
                            )}
                          </div>

                          {}
                          {index < state.statusTimeline.length - 1 && (
                            <div
                              className={cn(
                                "w-6 h-1 transition-colors flex-shrink-0",
                                isCompleted
                                  ? "bg-gradient-to-r from-green-200 to-green-200 dark:from-green-900/50 dark:to-green-900/50"
                                  : "bg-muted"
                              )}
                            />
                          )}
                        </div>

                        {}
                        <div className="mt-3 text-center min-w-[70px]">
                          <span className="text-xs font-semibold text-foreground block break-words">
                            {status.name}
                          </span>
                          {statusHistory && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {new Date(statusHistory.changedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {!statusHistory && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No status timeline available
              </p>
            )}
          </div>

          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                  >
                    {}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/50">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.product?.name || "Unknown Product"}
                          </h3>
                          {item.product?.sizeName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Size: {item.product.sizeName}
                            </p>
                          )}
                        </div>
                        {(item as unknown as { hasPromotion?: boolean }).hasPromotion && (
                          <div className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-semibold flex-shrink-0">
                            Sale
                          </div>
                        )}
                      </div>

                      {}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(item.finalPrice)} × {item.quantity}
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items in this order
                </p>
              )}
            </div>
          </div>

          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Pricing Summary
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(order.pricing?.subtotal || 0)}
                </span>
              </div>

              {(order.pricing?.discountAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    -{formatCurrency(order.pricing?.discountAmount || 0)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Delivery Fee
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(order.pricing?.deliveryFee || 0)}
                </span>
              </div>

              {(order.pricing?.taxAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(order.pricing?.taxAmount || 0)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(order.pricing?.finalTotal || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Address
            </h2>

            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {formattedDeliveryAddress || "No address provided"}
              </p>

              {order.deliveryAddress?.note && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Notes
                  </p>
                  <p className="text-sm text-foreground">
                    {order.deliveryAddress.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Info
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {order.customerName || "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Phone
                </p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </a>
              </div>
            </div>
          </div>

          {}
          {order.customerNote && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Customer Notes
              </h2>

              <p className="text-sm text-foreground leading-relaxed">
                {order.customerNote}
              </p>
            </div>
          )}

          {}
          {order.businessNote && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Business Notes
              </h2>

              <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
                {order.businessNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-card border border-border max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Cancel Order?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to cancel order #{order.orderNumber}? This
              action cannot be undone.
            </p>

            <div className="flex gap-3">
              <CustomButton
                variant="outline"
                className="flex-1 h-10 rounded-lg"
                onClick={() => setShowCancelConfirm(false)}
                disabled={state.cancelling}
              >
                Keep Order
              </CustomButton>
              <CustomButton
                variant="destructive"
                className="flex-1 h-10 rounded-lg"
                onClick={handleCancelOrder}
                disabled={state.cancelling}
              >
                {state.cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Order"
                )}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function OrderDetailSkeleton() {
  return (
    <PageContainer className="min-h-screen flex flex-col py-6 sm:py-8">
      <div className="mb-6 h-10 w-24 bg-muted rounded-lg animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="space-y-3">
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded-lg animate-pulse" />
          </div>

          {}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="h-6 w-32 bg-muted rounded-lg animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="h-6 w-32 bg-muted rounded-lg animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

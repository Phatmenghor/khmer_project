
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}


export const OrderStatusConfig = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    color: 'warning',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'info',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    color: 'success',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'danger',
  },
};

export const getOrderStatusLabel = (status: OrderStatus | string): string => {
  return OrderStatusConfig[status as OrderStatus]?.label || status;
};

export const getOrderStatusColor = (status: OrderStatus | string): string => {
  return OrderStatusConfig[status as OrderStatus]?.color || 'secondary';
};

export const isOrderActive = (status: OrderStatus): boolean => {
  return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
};

export const isOrderTerminal = (status: OrderStatus): boolean => {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED;
};

export interface OrderStatusBadgeConfig {
  label: string;
  badgeBg: string;
  text: string;
  border: string;
}

export const ORDER_STATUS_BADGE_CONFIG: Record<string, OrderStatusBadgeConfig> = {
  PENDING: {
    label: "Pending",
    badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    text: "text-blue-600",
    border: "border-blue-200 dark:border-blue-800",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    text: "text-indigo-600",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  PREPARING: {
    label: "Preparing",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    text: "text-amber-600",
    border: "border-amber-200 dark:border-amber-800",
  },
  READY: {
    label: "Ready",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    text: "text-purple-600",
    border: "border-purple-200 dark:border-purple-800",
  },
  COMPLETED: {
    label: "Completed",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    text: "text-emerald-600",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    text: "text-rose-600",
    border: "border-rose-200 dark:border-rose-800",
  },
};


// Order Status Enum - matches backend OrderStatus enum
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Display names and colors for UI
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

// Order Status Enum - matches backend OrderStatus enum
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

// Display names and descriptions for UI
export const OrderStatusConfig = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    description: 'Order placed, awaiting business confirmation',
    color: 'warning',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    description: 'Business confirmed the order',
    color: 'info',
  },
  [OrderStatus.PREPARING]: {
    label: 'Preparing',
    description: 'Staff is preparing the order',
    color: 'warning',
  },
  [OrderStatus.READY]: {
    label: 'Ready',
    description: 'Order ready for pickup or delivery',
    color: 'success',
  },
  [OrderStatus.IN_TRANSIT]: {
    label: 'In Transit',
    description: 'Order is on the way to customer',
    color: 'info',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    description: 'Order delivered/completed',
    color: 'success',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    description: 'Order cancelled',
    color: 'danger',
  },
  [OrderStatus.FAILED]: {
    label: 'Failed',
    description: 'Order failed',
    color: 'danger',
  },
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.label || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.color || 'secondary';
};

export const getOrderStatusDescription = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.description || '';
};

export const isOrderActive = (status: OrderStatus): boolean => {
  return status !== OrderStatus.CANCELLED && status !== OrderStatus.COMPLETED && status !== OrderStatus.FAILED;
};

export const isOrderTerminal = (status: OrderStatus): boolean => {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED || status === OrderStatus.FAILED;
};

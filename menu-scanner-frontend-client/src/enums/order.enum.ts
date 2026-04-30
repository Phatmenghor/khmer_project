/**
 * Order Enums - Frontend Type Definitions
 */

/**
 * OrderFrom Enum - Identifies the source of the order
 * CUSTOMER: Order created from public checkout page
 * BUSINESS: Order created from admin/POS system
 */
export enum OrderFromEnum {
  CUSTOMER = 'CUSTOMER',  // From public checkout page
  BUSINESS = 'BUSINESS',  // From admin/POS system
}

/**
 * Order Status Enum
 */
export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment Method Enum
 */
export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  WALLET = 'WALLET',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Delivery Type Enum
 */
export enum DeliveryTypeEnum {
  STANDARD = 'STANDARD',    // Regular delivery 30-45 min
  EXPRESS = 'EXPRESS',      // Fast delivery 15-20 min
  DINE_IN = 'DINE_IN',      // Eat at restaurant
  PICKUP = 'PICKUP',        // Customer picks up
}

/**
 * Promotion Type Enum
 */
export enum PromotionTypeEnum {
  PERCENTAGE = 'PERCENTAGE',  // Discount as percentage
  FIXED = 'FIXED',            // Fixed amount discount
  NONE = 'NONE',              // No promotion
}

/**
 * Device Type Enum
 */
export enum DeviceTypeEnum {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
}

/**
 * OS Type Enum
 */
export enum OSTypeEnum {
  IOS = 'iOS',
  ANDROID = 'Android',
  WINDOWS = 'Windows',
  MAC = 'Mac',
  LINUX = 'Linux',
}

/**
 * Order Status Display Labels
 */
export const OrderStatusLabels: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PENDING]: 'Pending',
  [OrderStatusEnum.CONFIRMED]: 'Confirmed',
  [OrderStatusEnum.COMPLETED]: 'Completed',
  [OrderStatusEnum.CANCELLED]: 'Cancelled',
};

/**
 * Order Status Colors (for UI)
 */
export const OrderStatusColors: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PENDING]: 'yellow',
  [OrderStatusEnum.CONFIRMED]: 'blue',
  [OrderStatusEnum.COMPLETED]: 'green',
  [OrderStatusEnum.CANCELLED]: 'red',
};

/**
 * OrderFrom Display Labels
 */
export const OrderFromLabels: Record<OrderFromEnum, string> = {
  [OrderFromEnum.CUSTOMER]: 'Customer (Checkout)',
  [OrderFromEnum.BUSINESS]: 'Business (Admin/POS)',
};

/**
 * Delivery Type Display Labels
 */
export const DeliveryTypeLabels: Record<DeliveryTypeEnum, string> = {
  [DeliveryTypeEnum.STANDARD]: 'Standard Delivery',
  [DeliveryTypeEnum.EXPRESS]: 'Express Delivery',
  [DeliveryTypeEnum.DINE_IN]: 'Dine-in',
  [DeliveryTypeEnum.PICKUP]: 'Pickup',
};

/**
 * Helper function to get OrderFrom display name
 */
export const getOrderFromLabel = (orderFrom: OrderFromEnum | string): string => {
  const from = orderFrom as OrderFromEnum;
  return OrderFromLabels[from] || 'Unknown';
};

/**
 * Helper function to get Order Status display name
 */
export const getOrderStatusLabel = (status: OrderStatusEnum | string): string => {
  const s = status as OrderStatusEnum;
  return OrderStatusLabels[s] || 'Unknown';
};

/**
 * Helper function to get Order Status color
 */
export const getOrderStatusColor = (status: OrderStatusEnum | string): string => {
  const s = status as OrderStatusEnum;
  return OrderStatusColors[s] || 'default';
};

/**
 * Helper function to get Delivery Type display name
 */
export const getDeliveryTypeLabel = (deliveryType: DeliveryTypeEnum | string): string => {
  const type = deliveryType as DeliveryTypeEnum;
  return DeliveryTypeLabels[type] || 'Unknown';
};

/**
 * Check if order is from customer
 */
export const isCustomerOrder = (orderFrom: OrderFromEnum | string): boolean => {
  return (orderFrom as OrderFromEnum) === OrderFromEnum.CUSTOMER;
};

/**
 * Check if order is from business/POS
 */
export const isBusinessOrder = (orderFrom: OrderFromEnum | string): boolean => {
  return (orderFrom as OrderFromEnum) === OrderFromEnum.BUSINESS;
};

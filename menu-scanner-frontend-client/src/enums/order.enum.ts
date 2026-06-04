


export enum OrderFromEnum {
  CUSTOMER = 'CUSTOMER',
  BUSINESS = 'BUSINESS',
}


export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}


export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  WALLET = 'WALLET',
}


export enum PaymentStatusEnum {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  REFUNDED = 'REFUNDED',
}


export enum DeliveryTypeEnum {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  DINE_IN = 'DINE_IN',
  PICKUP = 'PICKUP',
}


export enum PromotionTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  NONE = 'NONE',
}


export enum DeviceTypeEnum {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
}


export enum OSTypeEnum {
  IOS = 'iOS',
  ANDROID = 'Android',
  WINDOWS = 'Windows',
  MAC = 'Mac',
  LINUX = 'Linux',
}


export const OrderStatusLabels: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PENDING]: 'Pending',
  [OrderStatusEnum.CONFIRMED]: 'Confirmed',
  [OrderStatusEnum.COMPLETED]: 'Completed',
  [OrderStatusEnum.CANCELLED]: 'Cancelled',
};


export const OrderStatusColors: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PENDING]: 'yellow',
  [OrderStatusEnum.CONFIRMED]: 'blue',
  [OrderStatusEnum.COMPLETED]: 'green',
  [OrderStatusEnum.CANCELLED]: 'red',
};


export const OrderFromLabels: Record<OrderFromEnum, string> = {
  [OrderFromEnum.CUSTOMER]: 'Customer (Checkout)',
  [OrderFromEnum.BUSINESS]: 'Business (Admin/POS)',
};


export const DeliveryTypeLabels: Record<DeliveryTypeEnum, string> = {
  [DeliveryTypeEnum.STANDARD]: 'Standard Delivery',
  [DeliveryTypeEnum.EXPRESS]: 'Express Delivery',
  [DeliveryTypeEnum.DINE_IN]: 'Dine-in',
  [DeliveryTypeEnum.PICKUP]: 'Pickup',
};


export const getOrderFromLabel = (orderFrom: OrderFromEnum | string): string => {
  const from = orderFrom as OrderFromEnum;
  return OrderFromLabels[from] || 'Unknown';
};


export const getOrderStatusLabel = (status: OrderStatusEnum | string): string => {
  const s = status as OrderStatusEnum;
  return OrderStatusLabels[s] || 'Unknown';
};


export const getOrderStatusColor = (status: OrderStatusEnum | string): string => {
  const s = status as OrderStatusEnum;
  return OrderStatusColors[s] || 'default';
};


export const getDeliveryTypeLabel = (deliveryType: DeliveryTypeEnum | string): string => {
  const type = deliveryType as DeliveryTypeEnum;
  return DeliveryTypeLabels[type] || 'Unknown';
};


export const isCustomerOrder = (orderFrom: OrderFromEnum | string): boolean => {
  return (orderFrom as OrderFromEnum) === OrderFromEnum.CUSTOMER;
};


export const isBusinessOrder = (orderFrom: OrderFromEnum | string): boolean => {
  return (orderFrom as OrderFromEnum) === OrderFromEnum.BUSINESS;
};

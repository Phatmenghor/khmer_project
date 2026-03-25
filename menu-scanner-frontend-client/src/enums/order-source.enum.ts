/**
 * Order Source Enum
 * Tracks whether order came from POS (admin) or Public (customer)
 */

export enum OrderSource {
  PUBLIC = 'PUBLIC',      // Customer order from website/app
  POS = 'POS',            // Admin order from POS system
}

export const OrderSourceConfig = {
  [OrderSource.PUBLIC]: {
    label: 'Customer Order',
    description: 'Order placed by customer via website/app',
    color: 'info',
  },
  [OrderSource.POS]: {
    label: 'POS Order',
    description: 'Order created by admin via POS system',
    color: 'primary',
  },
};

export const getOrderSourceLabel = (source: OrderSource): string => {
  return OrderSourceConfig[source]?.label || source;
};

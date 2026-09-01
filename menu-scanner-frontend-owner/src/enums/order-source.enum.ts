


export enum OrderSource {
  PUBLIC = 'PUBLIC',
  POS = 'POS',
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

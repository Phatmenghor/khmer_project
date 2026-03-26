/**
 * POS Order Request Models
 * For managing existing orders (admin only)
 * Order CREATION uses POSCheckoutRequest instead
 */

/**
 * Update status or notes on an existing order (admin)
 */
export interface UpdateOrderRequest {
  orderStatus?: string;
  paymentStatus?: string;
  customerNote?: string;
  businessNote?: string;
  discountAmount?: number;
  taxAmount?: number;
}

/**
 * Customer can update notes only on their own order
 */
export interface UpdateCustomerOrderRequest {
  customerNote?: string;
}

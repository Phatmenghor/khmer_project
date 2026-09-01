


export interface UpdateOrderRequest {
  orderStatus?: string;
  paymentStatus?: string;
  customerNote?: string;
  businessNote?: string;
  discountAmount?: number;
  taxAmount?: number;
}


export interface UpdateCustomerOrderRequest {
  customerNote?: string;
}

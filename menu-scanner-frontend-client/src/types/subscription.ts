export interface SubscriptionHistoryResponse {
  subscriptionId: string;
  businessId: string;
  businessName?: string;
  planId: string;
  planName: string;
  planPrice: number;
  planDurationType: "MONTHLY" | "YEARLY" | "ONE_TIME";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED";
  daysRemaining: number;
  paymentStatus: "PAID" | "PENDING" | "UNPAID" | "PARTIALLY_PAID" | "CANCELLED";
  totalPaid: number;
  payment?: PaymentItem;
  logoBusinessUrl?: string;
}

export interface PaymentItem {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  referenceNumber?: string;
  imageUrl?: string;
  paidAt: string;
}

export interface PaginationResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

import { Pagination } from "@/utils/common/pagination";

export interface SubscriptionHistoryPaymentItem {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  referenceNumber: string | null;
  imageUrl: string | null;
  paidAt: string;
}

export interface SubscriptionHistoryResponseModel {
  subscriptionId: string;
  businessId: string;
  businessName: string;
  logoBusinessUrl?: string;
  planId: string;
  planName: string;
  planPrice: number;
  planDurationType: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: string;
  daysRemaining: number;
  paymentStatus: string;
  totalPaid: number;
  payment: SubscriptionHistoryPaymentItem | null;
}

export interface AllSubscriptionHistoryResponseModel extends Pagination {
  content: SubscriptionHistoryResponseModel[];
}

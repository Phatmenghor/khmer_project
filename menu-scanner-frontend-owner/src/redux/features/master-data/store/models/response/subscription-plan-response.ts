import { Pagination } from "@/utils/common/pagination";

export interface AllSubscriptionPlanResponseModel extends Pagination {
  content: SubscriptionPlanResponseModel[];
}

export interface SubscriptionPlanResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  description: string;
  price: number;
  durationType: string;
  status: string;
  activeSubscriptionsCount: number;
}

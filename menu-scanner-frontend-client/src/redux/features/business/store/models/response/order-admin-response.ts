import { BasePagination } from "@/utils/common/pagination";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";

export interface AllOrderResponseModel extends BasePagination {
  content: OrderResponse[];
}

import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { BasePagination } from "@/utils/common/pagination";

export interface AllFavoriteResponseModel extends BasePagination {
  content: ProductDetailResponseModel[];
}

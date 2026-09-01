import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPublicProducts,
  selectSelectedPublicProduct,
  selectPublicCategories,
  selectPublicBrands,
  selectPublicProductPagination,
  selectPublicProductListLoading,
  selectPublicProductDetailLoading,
  selectPublicFiltersLoading,
  selectPublicProductListError,
  selectPublicProductDetailError,
  selectPublicProductScrollY,
  selectPublicProductLoadedFilters,
} from "../selectors/public-product-selectors";

export const usePublicProductState = () => {
  const dispatch = useAppDispatch();

  return {
    dispatch,
    products: useAppSelector(selectPublicProducts),
    selectedProduct: useAppSelector(selectSelectedPublicProduct),
    categories: useAppSelector(selectPublicCategories),
    brands: useAppSelector(selectPublicBrands),
    pagination: useAppSelector(selectPublicProductPagination),
    loading: {
      list: useAppSelector(selectPublicProductListLoading),
      detail: useAppSelector(selectPublicProductDetailLoading),
      filters: useAppSelector(selectPublicFiltersLoading),
    },
    error: {
      list: useAppSelector(selectPublicProductListError),
      detail: useAppSelector(selectPublicProductDetailError),
    },
    scrollY: useAppSelector(selectPublicProductScrollY),
    loadedFilters: useAppSelector(selectPublicProductLoadedFilters),
  };
};

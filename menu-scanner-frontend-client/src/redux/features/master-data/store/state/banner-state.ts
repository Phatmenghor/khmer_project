import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selecBannerContent,
  selectBanner,
  selectBannerState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/banner-selector";

export const useBannerState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const bannerState = useAppSelector(selectBannerState);
  const bannerData = useAppSelector(selectBanner);
  const bannerContent = useAppSelector(selecBannerContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    bannerState,
    bannerData,
    bannerContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectReviewsData,
  selectReviewsContent,
  selectReviewsLoading,
  selectReviewsFilters,
  selectReviewsOperations,
} from "../selectors/portfolio-selectors";

export const usePortfolioReviewsState = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectReviewsData);
  const content = useAppSelector(selectReviewsContent);
  const isLoading = useAppSelector(selectReviewsLoading);
  const filters = useAppSelector(selectReviewsFilters);
  const operations = useAppSelector(selectReviewsOperations);

  return { data, content, isLoading, filters, operations, dispatch };
};

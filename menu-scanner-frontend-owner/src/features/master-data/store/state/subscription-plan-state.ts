import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectSubscriptionPlan,
  selectSubscriptionPlanContent,
  selectSubscriptionPlanState,
  selectPublicSubscriptionPlans,
  selectIsFetchingPublicPlans,
} from "../selectors/subscription-plan-selector";

export const useSubscriptionPlanState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const subscriptionPlanState = useAppSelector(selectSubscriptionPlanState);
  const subscriptionPlanData = useAppSelector(selectSubscriptionPlan);
  const subscriptionPlanContent = useAppSelector(selectSubscriptionPlanContent);
  const publicPlans = useAppSelector(selectPublicSubscriptionPlans);
  const isFetchingPublic = useAppSelector(selectIsFetchingPublicPlans);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    subscriptionPlanState,
    subscriptionPlanData,
    subscriptionPlanContent,
    publicPlans,
    isFetchingPublic,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

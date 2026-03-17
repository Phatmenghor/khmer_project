import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectLeave,
  selectLeaveContent,
  selectLeaveState,
  selectOperations,
  selectPagination,
} from "../selectors/leave-selectors";

export const useLeaveState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const leaveState = useAppSelector(selectLeaveState);
  const leaveData = useAppSelector(selectLeave);
  const leaveContent = useAppSelector(selectLeaveContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    leaveState,
    leaveData,
    leaveContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

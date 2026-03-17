import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectLeaveType,
  selectLeaveTypeContent,
  selectLeaveTypeState,
  selectOperations,
  selectPagination,
} from "../selectors/leave-type-selectors";

export const useLeaveTypeState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const leaveTypeState = useAppSelector(selectLeaveTypeState);
  const leaveTypeData = useAppSelector(selectLeaveType);
  const leaveTypeContent = useAppSelector(selectLeaveTypeContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    leaveTypeState,
    leaveTypeData,
    leaveTypeContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectWorkScheduleType,
  selectWorkScheduleTypeContent,
  selectWorkScheduleTypeState,
} from "../selectors/work-schedule-type-selectors";

export const useWorkScheduleTypeState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const workScheduleTypeState = useAppSelector(selectWorkScheduleTypeState);
  const workScheduleTypeData = useAppSelector(selectWorkScheduleType);
  const workScheduleTypeContent = useAppSelector(selectWorkScheduleTypeContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    workScheduleTypeState,
    workScheduleTypeData,
    workScheduleTypeContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

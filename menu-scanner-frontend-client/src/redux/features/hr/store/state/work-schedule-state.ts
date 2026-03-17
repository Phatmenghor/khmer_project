import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectWorkSchedule,
  selectWorkScheduleContent,
  selectWorkScheduleState,
} from "../selectors/work-schedule-selectors";

export const useWorkScheduleState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const workScheduleState = useAppSelector(selectWorkScheduleState);
  const workScheduleData = useAppSelector(selectWorkSchedule);
  const workScheduleContent = useAppSelector(selectWorkScheduleContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    workScheduleState,
    workScheduleData,
    workScheduleContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

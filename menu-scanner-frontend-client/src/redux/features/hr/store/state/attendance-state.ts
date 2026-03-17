import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectAttendance,
  selectAttendanceContent,
  selectAttendanceState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/attendance-selectors";

export const useAttendanceState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const attendanceState = useAppSelector(selectAttendanceState);
  const attendanceData = useAppSelector(selectAttendance);
  const attendanceContent = useAppSelector(selectAttendanceContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    attendanceState,
    attendanceData,
    attendanceContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

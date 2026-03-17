import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectSessions,
  selectSessionsContent,
  selectSessionState,
} from "../selectors/session-selector";

export const useSessionState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const sessionState = useAppSelector(selectSessionState);
  const sessionsData = useAppSelector(selectSessions);
  const sessionsContent = useAppSelector(selectSessionsContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    sessionState,
    sessionsData,
    sessionsContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};

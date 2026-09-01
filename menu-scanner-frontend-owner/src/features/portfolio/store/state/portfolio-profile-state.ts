import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectAdminProfile,
  selectAdminProfileLoading,
  selectAdminProfileSaving,
  selectAdminProfileError,
} from "../selectors/portfolio-selectors";

export const usePortfolioProfileState = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectAdminProfile);
  const isLoading = useAppSelector(selectAdminProfileLoading);
  const isSaving = useAppSelector(selectAdminProfileSaving);
  const error = useAppSelector(selectAdminProfileError);

  return { profile, isLoading, isSaving, error, dispatch };
};

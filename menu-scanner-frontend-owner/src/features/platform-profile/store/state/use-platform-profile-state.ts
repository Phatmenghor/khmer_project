import { useAppDispatch, useAppSelector } from "@/store";

export const usePlatformProfileState = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s: any) => s.platformProfile);

  return {
    dispatch,
    profile: state?.profile || null,
    publicProfile: state?.publicProfile || {
      brandName: "ScanMe KH",
      brandSlogan: "Digital Menu & Smart POS Platform",
      supportEmail: "phatmenghor7@gmail.com",
      supportTelegram: "070411260",
      supportPhone: "070411260",
    },
    isLoading: state?.isLoading ?? false,
    isUpdating: state?.isUpdating ?? false,
    error: state?.error || null,
  };
};

import { useAppSelector } from "@/store";

export const useHRState = () => {
  const hrState = useAppSelector((state) => (state as any).hr);

  return {
    attendanceList: hrState?.attendanceList || [],
    attendanceTotalItems: hrState?.attendanceTotalItems || 0,
    attendanceLoading: hrState?.attendanceLoading || false,

    leaveList: hrState?.leaveList || [],
    leaveTotalItems: hrState?.leaveTotalItems || 0,
    leaveLoading: hrState?.leaveLoading || false,

    workScheduleList: hrState?.workScheduleList || [],
    workScheduleTotalItems: hrState?.workScheduleTotalItems || 0,
    workScheduleLoading: hrState?.workScheduleLoading || false,

    error: hrState?.error || null,
  };
};

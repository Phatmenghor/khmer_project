"use client";

import { useEffect } from "react";
import { dateTimeFormat, formatTime } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectIsFetchingDetail,
  selectSelectedWorkSchedule,
} from "../store/selectors/work-schedule-selectors";
import { fetchWorkScheduleByIdService } from "../store/thunks/work-schedule-thunks";
import { clearSelectedWorkSchedule } from "../store/slice/work-schedule-slice";
import { Badge } from "@/components/ui/badge";

interface WorkScheduleDetailModalProps {
  workScheduleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkScheduleDetailModal({
  workScheduleId,
  isOpen,
  onClose,
}: WorkScheduleDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const workScheduleData = useAppSelector(selectSelectedWorkSchedule);

  useEffect(() => {
    const fetchWorkScheduleData = async () => {
      if (!workScheduleId || !isOpen) return;
      try {
        await dispatch(fetchWorkScheduleByIdService(workScheduleId)).unwrap();
      } catch (error: unknown) {
      }
    };

    fetchWorkScheduleData();
  }, [workScheduleId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedWorkSchedule());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Work Schedule Details"}
      description={"Detailed information about the selected work schedule."}
    >
      {workScheduleData ? (
        <div className="space-y-2">
          {}
          <DetailSection title="Schedule Information">
            <DetailRow
              label="Schedule Name"
              value={workScheduleData?.name || "---"}
            />

            <DetailRow
              label="Schedule Type"
              value={workScheduleData?.scheduleTypeEnum || "---"}
            />

            <DetailRow
              label="Work Days"
              value={
                workScheduleData?.workDays &&
                workScheduleData.workDays.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {workScheduleData.workDays.map((day) => (
                      <Badge
                        key={day}
                        variant="secondary"
                        className="text-xs px-1 py-0.5"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "---"
                )
              }
              isLast
            />
          </DetailSection>

          {}
          <DetailSection title="Time Information">
            <DetailRow
              label="Start Time"
              value={formatTime(workScheduleData?.startTime)}
            />

            <DetailRow
              label="End Time"
              value={formatTime(workScheduleData?.endTime)}
            />

            <DetailRow
              label="Break Start Time"
              value={formatTime(workScheduleData?.breakStartTime)}
            />

            <DetailRow
              label="Break End Time"
              value={formatTime(workScheduleData?.breakEndTime)}
              isLast
            />
          </DetailSection>

          {}
          {workScheduleData?.userInfo && (
            <DetailSection title="Assigned User">
              <DetailRow
                label="User Name"
                value={workScheduleData.userInfo.fullName || "---"}
              />

              <DetailRow
                label="Email"
                value={workScheduleData.userInfo.email || "---"}
              />

              <DetailRow
                label="Phone Number"
                value={workScheduleData.userInfo.phoneNumber || "---"}
                isLast
              />
            </DetailSection>
          )}

          {}
          <DetailSection title="System Information">
            <DetailRow
              label="Created At"
              value={dateTimeFormat(workScheduleData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={workScheduleData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(workScheduleData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={workScheduleData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No work schedule data available
          </p>
        </div>
      )}
    </DetailModal>
  );
}

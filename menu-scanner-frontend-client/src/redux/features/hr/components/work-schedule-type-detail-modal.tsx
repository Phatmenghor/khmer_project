"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedWorkScheduleType,
} from "../store/selectors/work-schedule-type-selectors";
import { fetchWorkScheduleTypeByIdService } from "../store/thunks/work-schedule-type-thunks";
import { clearSelectedWorkSchedule } from "../store/slice/work-schedule-type-slice";

interface WorkScheduleDetailModalProps {
  workScheduleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkScheduleTypeDetailModal({
  workScheduleId,
  isOpen,
  onClose,
}: WorkScheduleDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const workScheduleData = useAppSelector(selectSelectedWorkScheduleType);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!workScheduleId || !isOpen) return;
      try {
        await dispatch(
          fetchWorkScheduleTypeByIdService(workScheduleId),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching work schedule data:", error);
      }
    };

    fetchUserData();
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
        <div className="space-y-6">
          {/* Work Schedule Information */}
          <DetailSection title="Work Schedule Information">
            <DetailRow
              label="Work Schedule Name"
              value={workScheduleData?.enumName || "---"}
            />

            <DetailRow
              label="Description"
              value={workScheduleData?.description || "---"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Work Schedule ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {workScheduleData?.id}
                </span>
              }
            />
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No work schedule data available
          </p>
        </div>
      )}
    </DetailModal>
  );
}

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
  selectSelectedLeaveType,
} from "../store/selectors/leave-type-selectors";
import { fetchLeaveTypeByIdService } from "../store/thunks/leave-type-thunks";
import { clearSelectedLeaveType } from "../store/slice/leave-type-slice";

interface LeaveTypeDetailModalProps {
  leaveTypeId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveTypeDetailModal({
  leaveTypeId,
  isOpen,
  onClose,
}: LeaveTypeDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const leaveTypeData = useAppSelector(selectSelectedLeaveType);

  useEffect(() => {
    const fetchLeaveTypeData = async () => {
      if (!leaveTypeId || !isOpen) return;
      try {
        await dispatch(fetchLeaveTypeByIdService(leaveTypeId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching leave type data:", error);
      }
    };

    fetchLeaveTypeData();
  }, [leaveTypeId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedLeaveType());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Leave Type Details"}
      description={"Detailed information about the selected leave type."}
    >
      {leaveTypeData ? (
        <div className="space-y-6">
          {/* Leave Type Information */}
          <DetailSection title="Leave Type Information">
            <DetailRow
              label="Leave Type Name"
              value={leaveTypeData?.enumName || "---"}
            />

            <DetailRow
              label="Description"
              value={leaveTypeData?.description || "---"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Leave Type ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {leaveTypeData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(leaveTypeData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={leaveTypeData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(leaveTypeData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={leaveTypeData?.updatedBy || "---"}
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

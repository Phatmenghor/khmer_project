"use client";

import { useEffect } from "react";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchLeaveByIdService } from "../store/thunks/leave-thunks";
import {
  selectIsFetchingDetail,
  selectSelectedLeave,
} from "../store/selectors/leave-selectors";
import { clearSelectedLeave } from "../store/slice/leave-slice";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";
import { LeaveResponseModel } from "../store/models/response/leave-response";

interface LeaveDetailModalProps {
  leaveId?: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (leave: LeaveResponseModel) => void;
  onReject?: (leave: LeaveResponseModel) => void;
  onEdit?: (leave: LeaveResponseModel) => void;
}

export function LeaveDetailModal({
  leaveId,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onEdit,
}: LeaveDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const leaveData = useAppSelector(selectSelectedLeave);

  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!leaveId || !isOpen) return;
      try {
        await dispatch(fetchLeaveByIdService(leaveId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, [leaveId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedLeave());
    onClose();
  };

  const isPending = leaveData?.status === "PENDING";

  const handleApprove = () => {
    if (leaveData && onApprove) {
      onApprove(leaveData);
      handleClose();
    }
  };

  const handleReject = () => {
    if (leaveData && onReject) {
      onReject(leaveData);
      handleClose();
    }
  };

  const handleEdit = () => {
    if (leaveData && onEdit) {
      onEdit(leaveData);
      handleClose();
    }
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Leave Details"}
      description={"Detailed information about the selected leave."}
    >
      {leaveData ? (
        <div className="space-y-6">
          {/* Leave Information */}
          <DetailSection title="Leave Information">
            <DetailRow
              label="Full Name"
              value={leaveData?.userInfo?.fullName || "---"}
            />

            <DetailRow
              label="Phone Number"
              value={leaveData?.userInfo?.phoneNumber || "---"}
            />

            <DetailRow
              label="Email"
              value={leaveData?.userInfo?.email || "---"}
            />

            <DetailRow
              label="Start Date"
              value={formatDate(leaveData?.startDate) || "---"}
            />

            <DetailRow
              label="End Date"
              value={formatDate(leaveData?.endDate) || "---"}
            />

            <DetailRow
              label="Total Days"
              value={leaveData?.totalDays || "---"}
            />

            <DetailRow label="Status" value={leaveData?.status || "---"} />

            <DetailRow
              label="Reason"
              value={leaveData?.reason || "---"}
              isLast
            />
          </DetailSection>

          <DetailSection title="Approved Information">
            <DetailRow
              label="Full Name"
              value={leaveData?.actionUserInfo?.fullName || "---"}
            />

            <DetailRow
              label="Phone Number"
              value={leaveData?.actionUserInfo?.phoneNumber || "---"}
            />

            <DetailRow
              label="Email"
              value={leaveData?.actionUserInfo?.email || "---"}
            />

            <DetailRow
              label="Email"
              value={dateTimeFormat(leaveData?.actionAt) || "---"}
            />

            <DetailRow
              label="Action Note"
              value={leaveData?.actionNote || "---"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Leave Type ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {leaveData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(leaveData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={leaveData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(leaveData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={leaveData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {onEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            {isPending && onApprove && (
              <Button
                onClick={handleApprove}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Approve
              </Button>
            )}
            {isPending && onReject && (
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leave data available</p>
        </div>
      )}
    </DetailModal>
  );
}

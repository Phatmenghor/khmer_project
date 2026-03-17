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
  selectSelectedSession,
} from "../store/selectors/session-selector";
import { fetchSessionByIdService } from "../store/thunks/session-thunks";
import { clearSelectedSession } from "../store/slice/session-slice";

interface SessionDetailModalProps {
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionsDetailModal({
  sessionId,
  isOpen,
  onClose,
}: SessionDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const sessionData = useAppSelector(selectSelectedSession);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId || !isOpen) return;
      try {
        await dispatch(fetchSessionByIdService(sessionId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchSessionData();
  }, [sessionId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedSession());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Session Information Details"}
      description={sessionData?.deviceName || "Loading session information..."}
    >
      {sessionData ? (
        <div className="space-y-6">
          {/* Session Information */}
          <DetailSection title="Personal Information">
            <DetailRow
              label="User Identifier"
              value={sessionData?.userIdentifier || "---"}
            />

            <DetailRow
              label="User Full Name"
              value={sessionData?.userFullName || "---"}
            />

            <DetailRow
              label="Device ID"
              value={sessionData?.deviceId || "---"}
            />

            <DetailRow
              label="Device Name"
              value={sessionData?.deviceName || "---"}
            />

            <DetailRow
              label="Device type"
              value={sessionData?.deviceType || "---"}
            />

            <DetailRow
              label="Device Display Name"
              value={sessionData?.deviceDisplayName || "---"}
            />

            <DetailRow label="Browser" value={sessionData?.browser || "---"} />

            <DetailRow
              label="Operating System"
              value={sessionData?.operatingSystem || "---"}
            />
            <DetailRow
              label="IP Address"
              value={sessionData?.ipAddress || "---"}
            />

            <DetailRow
              label="Location"
              value={sessionData?.location || "---"}
            />

            <DetailRow label="Status" value={sessionData?.status || "---"} />

            <DetailRow
              label="Login At"
              value={dateTimeFormat(sessionData?.loginAt ?? "")}
            />

            <DetailRow
              label="Last Active At"
              value={dateTimeFormat(sessionData?.lastActiveAt ?? "")}
            />

            <DetailRow
              label="Logged Out At"
              value={dateTimeFormat(sessionData?.loggedOutAt ?? "")}
            />

            <DetailRow
              label="Logout Reason"
              value={sessionData?.logoutReason || "---"}
            />

            <DetailRow
              label="Current Session"
              value={sessionData?.isCurrentSession ? "Yes" : "No"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Session ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {sessionData?.id}
                </span>
              }
            />

            <DetailRow
              label="Created At"
              value={dateTimeFormat(sessionData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={sessionData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(sessionData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={sessionData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No session data available</p>
        </div>
      )}
    </DetailModal>
  );
}

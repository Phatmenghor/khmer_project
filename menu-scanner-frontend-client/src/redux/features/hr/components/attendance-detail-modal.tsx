"use client";

import { useEffect, useState } from "react";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedAttendance,
} from "../store/selectors/attendance-selectors";
import { fetchAttendanceByIdService } from "../store/thunks/attendance-thunks";
import { clearSelectedAttendance } from "../store/slice/attendance-slice";
import {
  MapPin,
  ExternalLink,
  Loader2,
  Navigation,
  Map,
  Info,
} from "lucide-react";
import {
  calculateDistance,
  formatCoordinates,
  getAddressesFromCoordinates,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsUrl,
  getStaticMapImageUrl,
} from "@/utils/location/geocoding";

interface AttendanceDetailModalProps {
  attendanceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CheckInWithDetails {
  id: string;
  checkInType: "START" | "END";
  checkInTime: string;
  latitude: number;
  longitude: number;
  remarks?: string;
  address?: string;
  staticMapUrl?: string;
}

export function AttendanceDetailModal({
  attendanceId,
  isOpen,
  onClose,
}: AttendanceDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const attendanceData = useAppSelector(selectSelectedAttendance);

  const [addressMap, setAddressMap] = useState<Record<string, string>>({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [expandedCheckIn, setExpandedCheckIn] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!attendanceId || !isOpen) return;
      try {
        await dispatch(fetchAttendanceByIdService(attendanceId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [attendanceId, isOpen, dispatch]);

  // Fetch addresses for all check-ins
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!attendanceData?.checkIns || attendanceData.checkIns.length === 0) {
        return;
      }

      setLoadingAddresses(true);

      const coordinates = attendanceData.checkIns.map((checkIn) => ({
        id: checkIn.id,
        latitude: checkIn.latitude,
        longitude: checkIn.longitude,
      }));

      try {
        const addresses = await getAddressesFromCoordinates(coordinates);
        setAddressMap(addresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [attendanceData?.checkIns]);

  // Calculate distance between START and END
  useEffect(() => {
    if (!attendanceData?.checkIns || attendanceData.checkIns.length < 2) {
      setDistance(null);
      return;
    }

    const startCheckIn = attendanceData.checkIns.find(
      (c: any) => c.checkInType === "START",
    );
    const endCheckIn = attendanceData.checkIns.find(
      (c: any) => c.checkInType === "END",
    );

    if (startCheckIn && endCheckIn) {
      const dist = calculateDistance(
        startCheckIn.latitude,
        startCheckIn.longitude,
        endCheckIn.latitude,
        endCheckIn.longitude,
      );
      setDistance(dist);
    }
  }, [attendanceData?.checkIns]);

  const handleClose = () => {
    dispatch(clearSelectedAttendance());
    onClose();
    setExpandedCheckIn(null);
  };

  const getStaticMapUrl = (latitude: number, longitude: number) => {
    return getStaticMapImageUrl(latitude, longitude, 600, 300, 15);
  };

  const renderCheckInCard = (checkIn: any, index: number) => {
    const isExpanded = expandedCheckIn === checkIn.id;
    const address = addressMap[checkIn.id];
    const staticMapUrl = getStaticMapUrl(checkIn.latitude, checkIn.longitude);

    const directionUrl =
      attendanceData?.checkIns && attendanceData.checkIns.length > 1
        ? getGoogleMapsDirectionsUrl(
            attendanceData.checkIns[0].latitude,
            attendanceData.checkIns[0].longitude,
            checkIn.latitude,
            checkIn.longitude,
            "driving",
          )
        : null;

    return (
      <div
        key={checkIn.id}
        className="border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
      >
        {/* Header - Always visible */}
        <button
          onClick={() => setExpandedCheckIn(isExpanded ? null : checkIn.id)}
          className="w-full p-4 text-left hover:bg-muted/70 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <MapPin
                size={20}
                className={
                  checkIn.checkInType === "START"
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">
                {checkIn.checkInType} Check-in
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {address || "Loading address..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                checkIn.checkInType === "START"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
              }`}
            >
              {checkIn.checkInType}
            </span>

            {/* Expand/Collapse arrow */}
            <div
              className={`transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <Info size={16} className="text-muted-foreground" />
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t px-4 py-4 space-y-4 bg-background/50">
            {/* Time and Coordinates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Check-in Time
                </p>
                <p className="font-medium">
                  {dateTimeFormat(checkIn.checkInTime)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Coordinates
                </p>
                <p className="font-mono text-xs">
                  {formatCoordinates(checkIn.latitude, checkIn.longitude)}
                </p>
              </div>
            </div>

            {/* Full Address */}
            {address && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Full Address
                </p>
                <p className="text-sm break-words">{address}</p>
              </div>
            )}

            {/* Static Map Preview */}
            {staticMapUrl && (
              <div className="rounded border overflow-hidden">
                <img
                  src={staticMapUrl}
                  alt="Location map"
                  className="w-full h-48 object-cover"
                  onError={() => console.log("Map image failed to load")}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Google Maps Button */}
              <a
                href={getGoogleMapsUrl(checkIn.latitude, checkIn.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
              >
                <MapPin size={14} />
                View on Maps
                <ExternalLink size={12} />
              </a>

              {/* Directions Button */}
              {directionUrl && (
                <a
                  href={directionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
                >
                  <Navigation size={14} />
                  Get Directions
                  <ExternalLink size={12} />
                </a>
              )}

              {/* Copy Coordinates */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    formatCoordinates(checkIn.latitude, checkIn.longitude),
                  );
                  alert("Coordinates copied!");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium transition-colors"
              >
                📋 Copy Coords
              </button>
            </div>

            {/* Remarks */}
            {checkIn.remarks && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                <p className="text-sm italic text-muted-foreground">
                  {checkIn.remarks}
                </p>
              </div>
            )}

            {/* Distance info */}
            {distance !== null &&
              checkIn.checkInType === "END" &&
              attendanceData?.checkIns?.length &&
              attendanceData?.checkIns?.length > 1 && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground mb-1">
                    Distance Traveled
                  </p>
                  <p className="font-semibold text-sm">
                    {distance.toFixed(2)} km
                  </p>
                </div>
              )}

            {/* Meta Information */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>ID: {checkIn.id}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Attendance Details"}
      description={"Detailed information about the selected attendance."}
    >
      {attendanceData ? (
        <div className="space-y-6">
          {/* Attendance Information */}
          <DetailSection title="Schedule Information">
            <DetailRow
              label="Full Name"
              value={attendanceData?.userInfo?.fullName || "---"}
            />

            <DetailRow
              label="Phone Number"
              value={attendanceData?.userInfo?.phoneNumber || "---"}
            />

            <DetailRow
              label="Email"
              value={attendanceData?.userInfo?.email || "---"}
            />

            <DetailRow
              label="Attendance Date"
              value={formatDate(attendanceData?.attendanceDate)}
            />

            <DetailRow
              label="Status"
              value={attendanceData?.status || "- - -"}
            />

            <DetailRow
              label="Remarks"
              value={attendanceData?.remarks || "- - -"}
            />
          </DetailSection>

          {/* Summary Stats */}
          {attendanceData?.checkIns && attendanceData.checkIns.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-muted-foreground">Check-ins</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {attendanceData.checkIns.length}
                </p>
              </div>

              {distance !== null && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {distance.toFixed(2)} km
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Check-ins Section */}
          {attendanceData?.checkIns && attendanceData.checkIns.length > 0 && (
            <DetailSection title="Check-in Details">
              <div className="space-y-3">
                {loadingAddresses && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    Loading address information...
                  </div>
                )}

                {attendanceData.checkIns.map((checkIn: any, index: number) =>
                  renderCheckInCard(checkIn, index),
                )}
              </div>
            </DetailSection>
          )}

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Attendance ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {attendanceData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(attendanceData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={attendanceData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(attendanceData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={attendanceData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attendance data available</p>
        </div>
      )}
    </DetailModal>
  );
}

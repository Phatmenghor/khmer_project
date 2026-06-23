"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedDistrict,
} from "../store/selectors/district-selector";
import { fetchDistrictByIdService } from "../store/thunks/district-thunks";
import { clearSelectedDistrict } from "../store/slice/district-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { MapPin } from "lucide-react";

interface DistrictDetailModalProps {
  districtId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DistrictDetailModal({
  districtId,
  isOpen,
  onClose,
}: DistrictDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const districtData = useAppSelector(selectSelectedDistrict);

  useEffect(() => {
    const fetchData = async () => {
      if (!districtId || !isOpen) return;
      try {
        await dispatch(fetchDistrictByIdService(districtId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching district data:", error);
      }
    };
    fetchData();
  }, [districtId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedDistrict());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!isFetchingDetail && !districtData}
      emptyMessage="No district data available"
      title={districtData ? `District Details - ${districtData.districtEn}` : "District Details"}
      description="Detailed information about the selected district"
      icon={MapPin}
      maxWidthClass="sm:max-w-4xl"
    >
      {districtData && (
        <>
          {/* District Information */}
          <Card>
            <CardHeader>
              <CardTitle>District Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="District Code"
                  value={districtData.districtCode || "—"}
                />
                <DisplayField
                  label="District EN"
                  value={districtData.districtEn || "—"}
                />
                <DisplayField
                  label="District KH"
                  value={districtData.districtKh || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Province Information */}
          <Card>
            <CardHeader>
              <CardTitle>Province Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Province Code"
                  value={districtData.province?.provinceCode || "—"}
                />
                <DisplayField
                  label="Province EN"
                  value={districtData.province?.provinceEn || "—"}
                />
                <DisplayField
                  label="Province KH"
                  value={districtData.province?.provinceKh || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="District ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
                      {districtData.id}
                    </span>
                  }
                />
                <DisplayField
                  label="Created At"
                  value={dateTimeFormat(districtData.createdAt ?? "")}
                />
                <DisplayField
                  label="Created By"
                  value={districtData.createdBy || "—"}
                />
                <DisplayField
                  label="Last Updated"
                  value={dateTimeFormat(districtData.updatedAt ?? "")}
                />
                <DisplayField
                  label="Updated By"
                  value={districtData.updatedBy || "—"}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}

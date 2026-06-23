"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedProvince,
} from "../store/selectors/province-selector";
import { fetchProvinceByIdService } from "../store/thunks/province-thunks";
import { clearSelectedProvince } from "../store/slice/province-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { MapPin } from "lucide-react";

interface ProvinceDetailModalProps {
  provinceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProvinceDetailModal({
  provinceId,
  isOpen,
  onClose,
}: ProvinceDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = selectIsFetchingDetail ? useAppSelector(selectIsFetchingDetail) : false;
  const provinceData = useAppSelector(selectSelectedProvince);

  useEffect(() => {
    const fetchData = async () => {
      if (!provinceId || !isOpen) return;
      try {
        await dispatch(fetchProvinceByIdService(provinceId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching province data:", error);
      }
    };
    fetchData();
  }, [provinceId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProvince());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!isFetchingDetail && !provinceData}
      emptyMessage="No province data available"
      title={provinceData ? `Province Details - ${provinceData.provinceEn}` : "Province Details"}
      description="Detailed information about the selected province"
      icon={MapPin}
      maxWidthClass="sm:max-w-4xl"
    >
      {provinceData && (
        <>
          {/* Province Information */}
          <Card>
            <CardHeader>
              <CardTitle>Province Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Province Code"
                  value={provinceData.provinceCode || "—"}
                />
                <DisplayField
                  label="Province EN"
                  value={provinceData.provinceEn || "—"}
                />
                <DisplayField
                  label="Province KH"
                  value={provinceData.provinceKh || "—"}
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
                  label="Province ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      {provinceData.id}
                    </span>
                  }
                />
                <DisplayField
                  label="Created At"
                  value={dateTimeFormat(provinceData.createdAt ?? "")}
                />
                <DisplayField
                  label="Created By"
                  value={provinceData.createdBy || "—"}
                />
                <DisplayField
                  label="Last Updated"
                  value={dateTimeFormat(provinceData.updatedAt ?? "")}
                />
                <DisplayField
                  label="Updated By"
                  value={provinceData.updatedBy || "—"}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}

"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchCommuneByIdService } from "../store/thunks/commune-thunks";
import {
  selectIsFetchingDetail,
  selectSelectedCommune,
} from "../store/selectors/commune-selector";
import { clearSelectedCommune } from "../store/slice/commune-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { MapPin } from "lucide-react";

interface CommuneDetailModalProps {
  communeId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommuneDetailModal({
  communeId,
  isOpen,
  onClose,
}: CommuneDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const communeData = useAppSelector(selectSelectedCommune);

  useEffect(() => {
    const fetchData = async () => {
      if (!communeId || !isOpen) return;
      try {
        await dispatch(fetchCommuneByIdService(communeId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching commune data:", error);
      }
    };
    fetchData();
  }, [communeId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedCommune());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!isFetchingDetail && !communeData}
      emptyMessage="No commune data available"
      title={communeData ? `Commune Details - ${communeData.communeEn}` : "Commune Details"}
      description="Detailed information about the selected commune"
      icon={MapPin}
      maxWidthClass="sm:max-w-4xl"
    >
      {communeData && (
        <>
          {/* Commune Information */}
          <Card>
            <CardHeader>
              <CardTitle>Commune Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Commune Code"
                  value={communeData.communeCode || "—"}
                />
                <DisplayField
                  label="Commune EN"
                  value={communeData.communeEn || "—"}
                />
                <DisplayField
                  label="Commune KH"
                  value={communeData.communeKh || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* District Information */}
          <Card>
            <CardHeader>
              <CardTitle>District Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="District Code"
                  value={communeData.district?.districtCode || "—"}
                />
                <DisplayField
                  label="District EN"
                  value={communeData.district?.districtEn || "—"}
                />
                <DisplayField
                  label="District KH"
                  value={communeData.district?.districtKh || "—"}
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
                  value={communeData.district?.province?.provinceCode || "—"}
                />
                <DisplayField
                  label="Province EN"
                  value={communeData.district?.province?.provinceEn || "—"}
                />
                <DisplayField
                  label="Province KH"
                  value={communeData.district?.province?.provinceKh || "—"}
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
                  label="Commune ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      {communeData.id}
                    </span>
                  }
                />
                <DisplayField
                  label="Created At"
                  value={dateTimeFormat(communeData.createdAt ?? "")}
                />
                <DisplayField
                  label="Created By"
                  value={communeData.createdBy || "—"}
                />
                <DisplayField
                  label="Last Updated"
                  value={dateTimeFormat(communeData.updatedAt ?? "")}
                />
                <DisplayField
                  label="Updated By"
                  value={communeData.updatedBy || "—"}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}

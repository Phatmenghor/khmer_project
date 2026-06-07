"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import Loading from "@/components/shared/common/loading";

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">District Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                District Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {districtData
                  ? districtData.districtEn
                  : "Detailed information about the selected district"}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !districtData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No district data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

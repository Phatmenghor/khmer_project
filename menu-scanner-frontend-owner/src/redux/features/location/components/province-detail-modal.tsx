"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import Loading from "@/components/shared/common/loading";

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
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Province Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                Province Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {provinceData
                  ? provinceData.provinceEn
                  : "Detailed information about the selected province"}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !provinceData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No province data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Province Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Province Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Province Code"
                      value={provinceData.provinceCode || "---"}
                    />
                    <DisplayField
                      label="Province EN"
                      value={provinceData.provinceEn || "---"}
                    />
                    <DisplayField
                      label="Province KH"
                      value={provinceData.provinceKh || "---"}
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
                        <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
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
                      value={provinceData.createdBy || "---"}
                    />
                    <DisplayField
                      label="Last Updated"
                      value={dateTimeFormat(provinceData.updatedAt ?? "")}
                    />
                    <DisplayField
                      label="Updated By"
                      value={provinceData.updatedBy || "---"}
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

"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import Loading from "@/components/shared/common/loading";

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Commune Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Commune Details
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {communeData
                  ? communeData.communeEn
                  : "Detailed information about the selected commune"}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !communeData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No commune data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Commune Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Commune Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Commune Code"
                      value={communeData.communeCode || "---"}
                    />
                    <DisplayField
                      label="Commune EN"
                      value={communeData.communeEn || "---"}
                    />
                    <DisplayField
                      label="Commune KH"
                      value={communeData.communeKh || "---"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* District Information */}
              <Card>
                <CardHeader>
                  <CardTitle>District Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="District Code"
                      value={communeData.district?.districtCode || "---"}
                    />
                    <DisplayField
                      label="District EN"
                      value={communeData.district?.districtEn || "---"}
                    />
                    <DisplayField
                      label="District KH"
                      value={communeData.district?.districtKh || "---"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Province Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Province Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Province Code"
                      value={communeData.district?.province?.provinceCode || "---"}
                    />
                    <DisplayField
                      label="Province EN"
                      value={communeData.district?.province?.provinceEn || "---"}
                    />
                    <DisplayField
                      label="Province KH"
                      value={communeData.district?.province?.provinceKh || "---"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Commune ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
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
                      value={communeData.createdBy || "---"}
                    />
                    <DisplayField
                      label="Last Updated"
                      value={dateTimeFormat(communeData.updatedAt ?? "")}
                    />
                    <DisplayField
                      label="Updated By"
                      value={communeData.updatedBy || "---"}
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

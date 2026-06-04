"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedVillage,
} from "../store/selectors/vaillage-selector";
import { fetchVillageByIdService } from "../store/thunks/village-thunks";
import { clearSelectedVillage } from "../store/slice/village-slice";
import Loading from "@/components/shared/common/loading";

interface VillageDetailModalProps {
  villageId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VillageDetailModal({
  villageId,
  isOpen,
  onClose,
}: VillageDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const villageData = useAppSelector(selectSelectedVillage);

  useEffect(() => {
    const fetchData = async () => {
      if (!villageId || !isOpen) return;
      try {
        await dispatch(fetchVillageByIdService(villageId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching village data:", error);
      }
    };
    fetchData();
  }, [villageId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedVillage());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Village Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                Village Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {villageData
                  ? villageData.villageEn
                  : "Detailed information about the selected village"}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !villageData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No village data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Village Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Village Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Village Code"
                      value={villageData.villageCode || "---"}
                    />
                    <DisplayField
                      label="Village EN"
                      value={villageData.villageEn || "---"}
                    />
                    <DisplayField
                      label="Village KH"
                      value={villageData.villageKh || "---"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Commune Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Commune Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Commune Code"
                      value={villageData.commune?.communeCode || "---"}
                    />
                    <DisplayField
                      label="Commune EN"
                      value={villageData.commune?.communeEn || "---"}
                    />
                    <DisplayField
                      label="Commune KH"
                      value={villageData.commune?.communeKh || "---"}
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
                      value={villageData.commune?.district?.districtCode || "---"}
                    />
                    <DisplayField
                      label="District EN"
                      value={villageData.commune?.district?.districtEn || "---"}
                    />
                    <DisplayField
                      label="District KH"
                      value={villageData.commune?.district?.districtKh || "---"}
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
                      value={
                        villageData.commune?.district?.province?.provinceCode || "---"
                      }
                    />
                    <DisplayField
                      label="Province EN"
                      value={
                        villageData.commune?.district?.province?.provinceEn || "---"
                      }
                    />
                    <DisplayField
                      label="Province KH"
                      value={
                        villageData.commune?.district?.province?.provinceKh || "---"
                      }
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
                      label="Village ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
                          {villageData.id}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(villageData.createdAt ?? "")}
                    />
                    <DisplayField
                      label="Created By"
                      value={villageData.createdBy || "---"}
                    />
                    <DisplayField
                      label="Last Updated"
                      value={dateTimeFormat(villageData.updatedAt ?? "")}
                    />
                    <DisplayField
                      label="Updated By"
                      value={villageData.updatedBy || "---"}
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

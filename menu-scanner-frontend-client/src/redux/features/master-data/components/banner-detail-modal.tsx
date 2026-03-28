"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedBanner,
} from "../store/selectors/banner-selector";
import { fetchBannerByIdService } from "../store/thunks/banner-thunks";
import { clearSelectedBanner } from "../store/slice/banner-slice";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Skeleton } from "@/components/ui/skeleton";

interface BannerDetailModalProps {
  bannerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BannerDetailModal({
  bannerId,
  isOpen,
  onClose,
}: BannerDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const bannerData = useAppSelector(selectSelectedBanner);

  useEffect(() => {
    const fetchBannerData = async () => {
      if (!bannerId || !isOpen) return;

      try {
        await dispatch(fetchBannerByIdService(bannerId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching banner data:", error);
      }
    };

    fetchBannerData();
  }, [bannerId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBanner());
    onClose();
  };

  if (!bannerData && !isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Banner Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No banner data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Banner Details - {bannerData?.businessName}</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Banner Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              Detailed information about the selected banner
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {isFetchingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : bannerData ? (
              <>
                {/* Banner Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Banner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Labels Row - Top alignment */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left label - Business Name */}
                      <div className="w-full md:w-1/2">
                        <p className="text-sm font-medium text-foreground">Business Name</p>
                      </div>
                      {/* Right label - Banner Image */}
                      {bannerData.imageUrl && (
                        <div className="w-full md:w-1/2">
                          <p className="text-sm font-medium text-foreground">Banner Image</p>
                        </div>
                      )}
                    </div>

                    {/* Content Row - Fields and Image */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Basic Info - Left Side (50%) */}
                      <div className="w-full md:w-1/2 space-y-4">
                        <p className="text-foreground">{bannerData.businessName || "---"}</p>
                        <DisplayField label="Link URL" value={bannerData.linkUrl || "---"} />
                        <DisplayField label="Status" value={bannerData.status ? formatEnumValue(bannerData.status) : "---"} />
                      </div>

                      {/* Banner Image - Right Side (50%) */}
                      {bannerData.imageUrl && (
                        <div className="w-full md:w-1/2">
                          <div className="max-w-md h-40 rounded-md overflow-hidden bg-muted border border-border">
                            <img
                              src={bannerData.imageUrl}
                              alt={bannerData.businessName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
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
                      <DisplayField label="Banner ID" value={bannerData.id} />
                      <DisplayField label="Created At" value={dateTimeFormat(bannerData.createdAt ?? "")} />
                      <DisplayField label="Created By" value={bannerData.createdBy || "---"} />
                      <DisplayField label="Last Updated" value={dateTimeFormat(bannerData.updatedAt ?? "")} />
                      <DisplayField label="Updated By" value={bannerData.updatedBy || "---"} />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No banner data available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

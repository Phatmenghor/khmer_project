"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { BannerResponseModel } from "../store/models/response/banner-response";

interface BannerDetailModalProps {
  banner: BannerResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BannerDetailModal({
  banner,
  isOpen,
  onClose,
}: BannerDetailModalProps) {
  if (!banner) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Banner Details - {banner?.businessName}</DialogTitle>
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
                  {banner.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <p className="text-sm font-medium text-foreground">Banner Image</p>
                    </div>
                  )}
                </div>

                {/* Content Row - Fields and Image */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Basic Info - Left Side (50%) */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <p className="text-foreground">{banner.businessName || "---"}</p>
                    <DisplayField label="Link URL" value={banner.linkUrl || "---"} />
                    <DisplayField label="Status" value={banner.status ? formatEnumValue(banner.status) : "---"} />
                  </div>

                  {/* Banner Image - Right Side (50%) */}
                  {banner.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <div className="max-w-md h-40 rounded-md overflow-hidden bg-muted border border-border">
                        <img
                          src={banner.imageUrl}
                          alt={banner.businessName}
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
                  <DisplayField label="Banner ID" value={banner.id} />
                  <DisplayField label="Created At" value={dateTimeFormat(banner.createdAt ?? "")} />
                  <DisplayField label="Created By" value={banner.createdBy || "---"} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(banner.updatedAt ?? "")} />
                  <DisplayField label="Updated By" value={banner.updatedBy || "---"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { BannerResponseModel } from "../store/models/response/banner-response";
import { cn } from "@/lib/utils";

interface BannerDetailModalProps {
  banner: BannerResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value ?? "---"}</span>
    </div>
  );
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
        <DialogContent className="w-full sm:max-w-xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No banner data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = banner.status === "ACTIVE";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Banner Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-2">
          <p className="text-sm font-bold text-foreground flex-1 min-w-0 truncate">
            {banner.businessName || "Banner"}
          </p>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0",
              isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}
          >
            {banner.status ? formatEnumValue(banner.status) : "---"}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Banner Image */}
            {banner.imageUrl && (
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Banner Image</SectionTitle>
                <div className="w-full h-36 rounded overflow-hidden bg-muted border border-border/50">
                  <img
                    src={banner.imageUrl}
                    alt={banner.description || "Banner"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Banner Information */}
            <div className="rounded border border-border/50 bg-card p-3">
              <SectionTitle>Banner Information</SectionTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={cn(
                        "font-semibold",
                        isActive ? "text-green-700" : "text-gray-500"
                      )}
                    >
                      {banner.status ? formatEnumValue(banner.status) : "---"}
                    </span>
                  }
                />
                <InfoRow label="Business" value={banner.businessName || "---"} />
                <InfoRow
                  label="Description"
                  value={banner.description || "---"}
                  fullWidth
                />
              </div>
            </div>

            {/* System Info */}
            <div className="rounded border border-border/50 bg-card p-3">
              <SectionTitle>System Info</SectionTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <InfoRow label="Created By" value={banner.createdBy || "---"} />
                <InfoRow label="Created At" value={dateTimeFormat(banner.createdAt ?? "")} />
                <InfoRow label="Updated By" value={banner.updatedBy || "---"} />
                <InfoRow label="Last Updated" value={dateTimeFormat(banner.updatedAt ?? "")} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

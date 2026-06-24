"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { selecBannerContent, selectSelectedBanner } from "../store/selectors/banner-selector";
import { clearSelectedBanner } from "../store/slice/banner-slice";
import { fetchBannerByIdService } from "../store/thunks/banner-thunks";

function BannerDetailImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative w-full rounded overflow-hidden bg-muted border border-border/50 aspect-[16/5]">
      {src ? (
        <SmartImage src={src} alt={alt} fill />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

interface BannerDetailModalProps {
  bannerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground break-words">{value || "-"}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-2 mb-0.5 first:mt-0 border-b border-border/40 pb-1">
      <h3 className="text-xs font-bold text-primary">{children}</h3>
    </div>
  );
}

export function BannerDetailModal({
  bannerId,
  isOpen,
  onClose,
}: BannerDetailModalProps) {
  const dispatch = useAppDispatch();
  const bannerContent = useAppSelector(selecBannerContent);
  const selectedBanner = useAppSelector(selectSelectedBanner);
  const banner = bannerContent.find(b => b.id === bannerId) || (selectedBanner?.id === bannerId ? selectedBanner : null);

  useEffect(() => {
    if (isOpen && bannerId && !banner) {
      dispatch(fetchBannerByIdService(bannerId));
    }
  }, [isOpen, bannerId, banner, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBanner());
    onClose();
  };

  const isActive = banner?.status === "ACTIVE";

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !banner}
      isEmpty={!banner}
      emptyMessage="No banner data available"
      title="Banner"
      description="Manage promotional banners for your business"
      size="xl"
    >
      {banner && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Banner Image</SectionTitle>
          <div className="col-span-2">
            <BannerDetailImage src={banner.image?.md ?? banner.image?.o} alt={banner.description || "Banner"} />
          </div>

          <SectionTitle>Banner Information</SectionTitle>
          <InfoRow
            label="Status"
            value={
              <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                {banner.status ? formatEnumValue(banner.status) : "-"}
              </span>
            }
          />
          <InfoRow label="Business" value={banner.businessName || "-"} />
          <InfoRow label="Description" value={banner.description || "-"} fullWidth />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created By" value={banner.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(banner.createdAt ?? "")} />
          <InfoRow label="Updated By" value={banner.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(banner.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

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

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";

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
            <CustomImagePreview
              src={banner.image?.sm ?? banner.image?.md}
              previewSrc={banner.image?.o ?? banner.image?.md ?? banner.image?.sm}
              alt={banner.description || "Banner"}
              fallbackText={banner.description || "B"}
              className="w-full h-36 rounded-xl aspect-[16/5]"
              aspectRatio="banner"
            />
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

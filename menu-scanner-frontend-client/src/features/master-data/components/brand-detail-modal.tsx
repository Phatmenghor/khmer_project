"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { BrandResponseModel } from "../store/models/response/brand-response";
import {
  selectBrandContent,
  selectSelectedBrand,
} from "../store/selectors/brand-selector";
import { clearSelectedBrand } from "../store/slice/brand-slice";
import { fetchBrandByIdService } from "../store/thunks/brand-thunks";

function BrandDetailImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative flex-shrink-0 w-14 h-14 rounded-[10px] overflow-hidden bg-muted border border-border flex items-center justify-center shadow-xs">
      {src ? (
        <SmartImage src={src} alt={alt} fill showSkeleton={false} />
      ) : (
        <Package className="h-6 w-6 text-muted-foreground/60" />
      )}
    </div>
  );
}

interface BrandDetailModalProps {
  brandId?: string;
  brand?: BrandResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModal({
  brandId,
  brand: propBrand,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  const dispatch = useAppDispatch();
  const brandContent = useAppSelector(selectBrandContent);
  const selectedBrand = useAppSelector(selectSelectedBrand);
  const targetId = brandId || propBrand?.id;

  const brand =
    propBrand ||
    brandContent.find((b) => b.id === targetId) ||
    (selectedBrand?.id === targetId ? selectedBrand : null);

  useEffect(() => {
    if (isOpen && targetId && !brand) {
      dispatch(fetchBrandByIdService(targetId));
    }
  }, [isOpen, targetId, brand, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBrand());
    onClose();
  };

  const isActive = brand?.status === "ACTIVE";
  const totalProducts = brand?.totalProducts ?? 0;
  const activeProducts = brand?.activeProducts ?? 0;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !brand}
      isEmpty={!brand}
      emptyMessage="No brand data available"
      title="Brand"
      description="Manage product brands for your business"
      size="xl"
    >
      {brand && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Brand Information</SectionTitle>
          <div className="col-span-2 flex items-center gap-3.5 p-2 rounded-[12px] bg-muted/30 border border-border/60 mb-1">
            <BrandDetailImage
              src={brand.image?.md ?? brand.image?.o ?? brand.image?.sm}
              alt={brand.name || "Brand"}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {brand.name || "-"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>Status:</span>
                <span
                  className={cn(
                    "font-semibold px-2 py-0.5 rounded-md text-[11px]",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {brand.status ? formatEnumValue(brand.status) : "-"}
                </span>
              </p>
            </div>
          </div>

          <InfoRow label="Description" value={brand.description || "-"} fullWidth />

          <SectionTitle>Product Stats</SectionTitle>
          <InfoRow label="Total Products" value={totalProducts} />
          <InfoRow label="Active Products" value={activeProducts} />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created By" value={brand.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(brand.createdAt ?? "")} />
          <InfoRow label="Updated By" value={brand.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(brand.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

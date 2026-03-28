"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { BrandResponseModel } from "../store/models/response/brand-response";

interface BrandDetailModalProps {
  brand: BrandResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModal({
  brand,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  if (!brand) {
    return null;
  }

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={false}
      title={"Brand information Details"}
      description={brand?.name || "Brand information"}
    >
      <div className="space-y-6">
        {/* Brand Information */}
        <DetailSection title="Personal Information">
          <CustomAvatar
            imageUrl={brand.imageUrl}
            name={brand?.name}
            size="xl"
          />
          <DetailRow label="Brand Name" value={brand?.name || "---"} />
          <DetailRow
            label="Description"
            value={brand?.description || "---"}
          />
          <DetailRow label="Status" value={brand?.status || "---"} />
          <DetailRow
            label="Total Products"
            value={formatProductCount(brand?.totalProducts)}
          />
          <DetailRow
            label="Active Products"
            value={formatProductCount(brand?.activeProducts)}
          />
        </DetailSection>

        {/* System Information */}
        <DetailSection title="System Information">
          <DetailRow
            label="Brand ID"
            value={
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                {brand?.id}
              </span>
            }
          />
          <DetailRow
            label="Business Name"
            value={brand?.businessName || "---"}
          />
          <DetailRow
            label="Created At"
            value={dateTimeFormat(brand?.createdAt ?? "")}
          />
          <DetailRow
            label="Created By"
            value={brand?.createdBy || "---"}
          />
          <DetailRow
            label="Last Updated"
            value={dateTimeFormat(brand?.updatedAt ?? "")}
          />
          <DetailRow
            label="Updated By"
            value={brand?.updatedBy || "---"}
            isLast
          />
        </DetailSection>
      </div>
    </DetailModal>
  );
}

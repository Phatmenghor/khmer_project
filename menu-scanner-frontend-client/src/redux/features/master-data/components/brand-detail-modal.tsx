"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  selectIsFetchingDetail,
  selectSelectedBrand,
} from "../store/selectors/brand-selector";
import { fetchBrandByIdService } from "../store/thunks/brand-thunks";
import { clearSelectedBrand } from "../store/slice/brand-slice";

interface BrandDetailModalProps {
  brandId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModal({
  brandId,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const brandData = useAppSelector(selectSelectedBrand);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId || !isOpen) return;

      try {
        await dispatch(fetchBrandByIdService(brandId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching brand data:", error);
      }
    };

    fetchBrandData();
  }, [brandId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBrand());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Brand information Details"}
      description={brandData?.name || "Loading brand information..."}
    >
      {brandData ? (
        <div className="space-y-6">
          {/* Brand Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              imageUrl={brandData.imageUrl}
              name={brandData?.name}
              size="xl"
            />
            <DetailRow label="Brand Name" value={brandData?.name || "---"} />
            <DetailRow
              label="Description"
              value={brandData?.description || "---"}
            />
            <DetailRow label="Status" value={brandData?.status || "---"} />
            <DetailRow
              label="Total Products"
              value={brandData?.totalProducts || "---"}
            />
            <DetailRow
              label="Active Products"
              value={brandData?.activeProducts || "---"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Banner ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {brandData?.id}
                </span>
              }
            />
            <DetailRow
              label="Business Name"
              value={brandData?.businessName || "---"}
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(brandData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={brandData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(brandData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={brandData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Brand data available</p>
        </div>
      )}
    </DetailModal>
  );
}

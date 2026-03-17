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
  selectSelectedDeliveryOptions,
} from "../store/selectors/delivery-options-selector";
import { fetchDeliveryOptionsByIdService } from "../store/thunks/delivery-options-thunks";
import { clearSelectedDeliveryOptions } from "../store/slice/delivery-options-slice";

interface DeliveryOptionsDetailModalProps {
  deliveryOptionsId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryOptionsDetailModal({
  deliveryOptionsId,
  isOpen,
  onClose,
}: DeliveryOptionsDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const deliveryOptionsData = useAppSelector(selectSelectedDeliveryOptions);

  useEffect(() => {
    const fetchDeliveryOptionsData = async () => {
      if (!deliveryOptionsId || !isOpen) return;
      try {
        await dispatch(
          fetchDeliveryOptionsByIdService(deliveryOptionsId)
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching delivery options data:", error);
      }
    };

    fetchDeliveryOptionsData();
  }, [deliveryOptionsId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedDeliveryOptions());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Delivery Options Information Details"}
      description={
        deliveryOptionsData?.name || "Loading delivery options information..."
      }
    >
      {deliveryOptionsData ? (
        <div className="space-y-6">
          {/* Delivery Options Information */}
          <DetailSection title="Personal Information">
            <CustomAvatar
              imageUrl={deliveryOptionsData.imageUrl}
              name={deliveryOptionsData?.name}
              size="xl"
            />

            <DetailRow
              label="Delivery Options Name"
              value={deliveryOptionsData?.name || "---"}
            />

            <DetailRow
              label="Price"
              value={deliveryOptionsData?.price || "---"}
            />

            <DetailRow
              label="Status"
              value={deliveryOptionsData?.status || "---"}
            />

            <DetailRow
              label="Description"
              value={deliveryOptionsData?.description || "---"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Banner ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {deliveryOptionsData?.id}
                </span>
              }
            />
            <DetailRow
              label="Business Name"
              value={deliveryOptionsData?.businessName || "---"}
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(deliveryOptionsData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={deliveryOptionsData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(deliveryOptionsData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={deliveryOptionsData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      )}
    </DetailModal>
  );
}

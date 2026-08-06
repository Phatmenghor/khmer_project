"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { Truck } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  selecDeliveryOptionsContent,
  selectSelectedDeliveryOptions,
} from "../store/selectors/delivery-options-selector";
import { clearSelectedDeliveryOptions } from "../store/slice/delivery-options-slice";
import { fetchDeliveryOptionsByIdService } from "../store/thunks/delivery-options-thunks";

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";

interface DetailModalProps {
  deliveryOptionsId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryOptionsDetailModal({
  deliveryOptionsId,
  isOpen,
  onClose,
}: DetailModalProps) {
  const dispatch = useAppDispatch();
  const deliveryOptionsContent = useAppSelector(selecDeliveryOptionsContent);
  const selectedDeliveryOptions = useAppSelector(selectSelectedDeliveryOptions);
  const deliveryOptions = deliveryOptionsContent.find(d => d.id === deliveryOptionsId) || (selectedDeliveryOptions?.id === deliveryOptionsId ? selectedDeliveryOptions : null);

  useEffect(() => {
    if (isOpen && deliveryOptionsId && !deliveryOptions) {
      dispatch(fetchDeliveryOptionsByIdService(deliveryOptionsId));
    }
  }, [isOpen, deliveryOptionsId, deliveryOptions, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedDeliveryOptions());
    onClose();
  };

  const isActive = deliveryOptions?.status === "ACTIVE";

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !deliveryOptions}
      isEmpty={!deliveryOptions}
      emptyMessage="No delivery options data available"
      title="Delivery Options"
      description="Manage delivery methods for your business"
      size="xl"
    >
      {deliveryOptions && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Delivery Options Information</SectionTitle>
          <div className="col-span-2 flex items-center gap-3.5 p-2 rounded-[12px] bg-muted/30 border border-border/60 mb-1">
            <CustomImagePreview
              src={deliveryOptions.image?.sm ?? deliveryOptions.image?.md}
              previewSrc={deliveryOptions.image?.o ?? deliveryOptions.image?.md ?? deliveryOptions.image?.sm}
              alt={deliveryOptions.name || "Delivery option"}
              fallbackText={deliveryOptions.name || "D"}
              className="h-14 w-14 rounded-[12px] aspect-square"
              aspectRatio="1x1"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {deliveryOptions.name || "-"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>Status:</span>
                <span className={cn("font-semibold px-2 py-0.5 rounded-md text-[11px]", isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                  {deliveryOptions.status ? formatEnumValue(deliveryOptions.status) : "-"}
                </span>
              </p>
            </div>
          </div>

          <InfoRow
            label="Price"
            value={deliveryOptions.price != null ? `$${deliveryOptions.price.toFixed(2)}` : "-"}
          />
          <InfoRow label="Description" value={deliveryOptions.description || "-"} fullWidth />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created By" value={deliveryOptions.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(deliveryOptions.createdAt ?? "")} />
          <InfoRow label="Updated By" value={deliveryOptions.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(deliveryOptions.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

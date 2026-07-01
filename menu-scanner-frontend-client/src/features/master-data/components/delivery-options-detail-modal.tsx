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

function DeliveryOptionsDetailImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
      {src ? (
        <SmartImage src={src} alt={alt} fill showSkeleton={false} />
      ) : (
        <Truck className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

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
          <SectionTitle>Delivery Options Image</SectionTitle>
          <div className="col-span-2">
            <DeliveryOptionsDetailImage
              src={deliveryOptions.image?.md ?? deliveryOptions.image?.o ?? deliveryOptions.image?.sm}
              alt={deliveryOptions.name || "Delivery option"}
            />
          </div>

          <SectionTitle>Delivery Options Information</SectionTitle>
          <InfoRow label="Name" value={deliveryOptions.name || "-"} />
          <InfoRow
            label="Status"
            value={
              <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                {deliveryOptions.status ? formatEnumValue(deliveryOptions.status) : "-"}
              </span>
            }
          />
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

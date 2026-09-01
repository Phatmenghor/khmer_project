"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  selectPaymentOptionsContent,
  selectSelectedPaymentOption,
} from "../store/selectors/payment-options-selectors";
import { clearSelectedPaymentOption } from "../store/slice/payment-options-slice";
import { fetchPaymentOptionByIdService } from "../store/thunks/payment-options-thunks";

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";

interface PaymentOptionDetailModalProps {
  paymentOptionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentOptionDetailModal({
  paymentOptionId,
  isOpen,
  onClose,
}: PaymentOptionDetailModalProps) {
  const dispatch = useAppDispatch();
  const paymentOptionsContent = useAppSelector(selectPaymentOptionsContent);
  const selectedPaymentOption = useAppSelector(selectSelectedPaymentOption);
  const paymentOption =
    paymentOptionsContent.find(p => p.id === paymentOptionId) ||
    (selectedPaymentOption?.id === paymentOptionId ? selectedPaymentOption : null);

  useEffect(() => {
    if (isOpen && paymentOptionId && !paymentOption) {
      dispatch(fetchPaymentOptionByIdService(paymentOptionId));
    }
  }, [isOpen, paymentOptionId, paymentOption, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedPaymentOption());
    onClose();
  };

  const isActive = paymentOption?.status === "ACTIVE";

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !paymentOption}
      isEmpty={!paymentOption}
      emptyMessage="No payment option data available"
      title="Payment Options"
      description="Manage payment methods for your business"
      size="xl"
    >
      {paymentOption && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Payment Option Information</SectionTitle>
          <div className="col-span-2 flex items-center gap-3.5 p-2 rounded-[12px] bg-muted/30 border border-border/60 mb-1">
            <CustomImagePreview
              src={paymentOption.image?.sm ?? paymentOption.image?.md}
              previewSrc={paymentOption.image?.o ?? paymentOption.image?.md ?? paymentOption.image?.sm}
              alt={paymentOption.name || "Payment option"}
              fallbackText={paymentOption.name || "P"}
              className="h-14 w-14 rounded-[12px] aspect-square"
              aspectRatio="1x1"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {paymentOption.name || "-"}
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
                  {paymentOption.status ? formatEnumValue(paymentOption.status) : "-"}
                </span>
              </p>
            </div>
          </div>

          <InfoRow
            label="Type"
            value={paymentOption.paymentOptionType ? formatEnumValue(paymentOption.paymentOptionType) : "-"}
          />
          {paymentOption.description && (
            <InfoRow label="Description" value={paymentOption.description} className="col-span-2" />
          )}

          <SectionTitle>System Information</SectionTitle>
          <InfoRow label="Created At" value={dateTimeFormat(paymentOption.createdAt ?? "")} />
          <InfoRow label="Last Updated" value={dateTimeFormat(paymentOption.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

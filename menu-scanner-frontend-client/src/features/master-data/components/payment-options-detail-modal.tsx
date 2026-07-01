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

function PaymentOptionDetailImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
      {src ? (
        <SmartImage src={src} alt={alt} fill showSkeleton={false} />
      ) : (
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

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
          <SectionTitle>Payment Option Image</SectionTitle>
          <div className="col-span-2">
            <PaymentOptionDetailImage
              src={paymentOption.image?.md ?? paymentOption.image?.o ?? paymentOption.image?.sm}
              alt={paymentOption.name || "Payment option"}
            />
          </div>

          <SectionTitle>Payment Option Information</SectionTitle>
          <InfoRow label="Payment Method Name" value={paymentOption.name || "-"} />
          <InfoRow
            label="Status"
            value={
              <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                {paymentOption.status ? formatEnumValue(paymentOption.status) : "-"}
              </span>
            }
          />
          <InfoRow
            label="Type"
            value={paymentOption.paymentOptionType ? formatEnumValue(paymentOption.paymentOptionType) : "-"}
          />

          <SectionTitle>System Information</SectionTitle>
          <InfoRow label="Created At" value={dateTimeFormat(paymentOption.createdAt ?? "")} />
          <InfoRow label="Last Updated" value={dateTimeFormat(paymentOption.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

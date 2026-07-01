"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatKhrRate } from "@/utils/format/exchange-rate-formatter";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  selectExchangeRateContent,
  selectSelectedExchangeRate,
} from "../store/selectors/exchange-rate-selector";
import { clearSelectedExchangeRate } from "../store/slice/exchange-rate-slice";
import { fetchExchangeRateByIdService } from "../store/thunks/exchange-rate-thunks";

interface DetailModalProps {
  exchangeRateId?: string;
  isOpen: boolean;
  onClose: () => void;
}

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

export function ExchangeRateDetailModal({
  exchangeRateId,
  isOpen,
  onClose,
}: DetailModalProps) {
  const dispatch = useAppDispatch();
  const exchangeRateContent = useAppSelector(selectExchangeRateContent);
  const selectedExchangeRate = useAppSelector(selectSelectedExchangeRate);
  const exchangeRate = exchangeRateContent.find(r => r.id === exchangeRateId) || (selectedExchangeRate?.id === exchangeRateId ? selectedExchangeRate : null);

  useEffect(() => {
    if (isOpen && exchangeRateId && !exchangeRate) {
      dispatch(fetchExchangeRateByIdService(exchangeRateId));
    }
  }, [isOpen, exchangeRateId, exchangeRate, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedExchangeRate());
    onClose();
  };

  const isActive = exchangeRate?.status === "ACTIVE";

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !exchangeRate}
      isEmpty={!exchangeRate}
      emptyMessage="No exchange rate data available"
      title="Exchange Rate"
      description="Current exchange rate for currency conversion"
      size="xl"
    >
      {exchangeRate && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Exchange Rate Information</SectionTitle>
          <InfoRow label="🇰🇭 USD To KHR Rate" value={formatKhrRate(exchangeRate.usdToKhrRate)} />
          <InfoRow
            label="Status"
            value={
              <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                {exchangeRate.status ? formatEnumValue(exchangeRate.status) : "-"}
              </span>
            }
          />
          <InfoRow label="Notes" value={exchangeRate.notes || "-"} fullWidth />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created By" value={exchangeRate.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(exchangeRate.createdAt ?? "")} />
          <InfoRow label="Updated By" value={exchangeRate.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(exchangeRate.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import {
  formatKhrRate,
  formatCnyRate,
  formatVndRate,
  formatExchangeRateStatus,
} from "@/utils/format/exchange-rate-formatter";
import { ExchangeRateResponseModel } from "../store/models/response/exchange-rate-response";

interface DetailModalProps {
  exchangeRate: ExchangeRateResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeRateDetailModal({
  exchangeRate,
  isOpen,
  onClose,
}: DetailModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={false}
      title="Exchange Rate Details"
      description={
        exchangeRate ? formatKhrRate(exchangeRate?.usdToKhrRate) : "No Exchange Rate selected"
      }
    >
      {exchangeRate ? (
        <div className="space-y-6">
          {/* Exchange Rate Information */}
          <DetailSection title="Exchange Rate Information">
            <DetailRow
              label="USD To KHR Rate"
              value={formatKhrRate(exchangeRate?.usdToKhrRate) || "---"}
            />

            <DetailRow
              label="USD To CNY Rate"
              value={formatCnyRate(exchangeRate?.usdToCnyRate) || "---"}
            />

            <DetailRow
              label="USD To VND Rate"
              value={formatVndRate(exchangeRate?.usdToVndRate) || "---"}
            />

            <DetailRow
              label="Status"
              value={formatExchangeRateStatus(exchangeRate?.status) || "---"}
            />

            <DetailRow label="Notes" value={exchangeRate?.notes || "---"} />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Exchange Rate ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {exchangeRate?.id}
                </span>
              }
            />
            <DetailRow
              label="Business Name"
              value={exchangeRate?.businessName || "---"}
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(exchangeRate?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={exchangeRate?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(exchangeRate?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={exchangeRate?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No Exchange Rate data available
          </p>
        </div>
      )}
    </DetailModal>
  );
}

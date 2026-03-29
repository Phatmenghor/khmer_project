"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedExchangeRate,
} from "../store/selectors/exchange-rate-selector";
import { fetchExchangeRateByIdService } from "../store/thunks/exchange-rate-thunks";
import { clearSelectedExchangeRate } from "../store/slice/exchange-rate-slice";
import {
  formatKhrRate,
  formatCnyRate,
  formatVndRate,
  formatExchangeRateStatus,
} from "@/utils/format/exchange-rate-formatter";

interface DetailModalProps {
  exchangeRateId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeRateDetailModal({
  exchangeRateId,
  isOpen,
  onClose,
}: DetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const detailData = useAppSelector(selectSelectedExchangeRate);

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!exchangeRateId || !isOpen) return;

      try {
        await dispatch(fetchExchangeRateByIdService(exchangeRateId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching exchange rate data:", error);
      }
    };

    fetchDetailData();
  }, [exchangeRateId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedExchangeRate());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Exchange Rate information Details"}
      description={
        formatKhrRate(detailData?.usdToKhrRate) || "Loading Exchange Rate information..."
      }
    >
      {detailData ? (
        <div className="space-y-6">
          {/* Exchange Rate Information */}
          <DetailSection title="Exchange Rate Information">
            <DetailRow
              label="USD To KHR Rate"
              value={formatKhrRate(detailData?.usdToKhrRate) || "---"}
            />

            <DetailRow
              label="USD To CNY Rate"
              value={formatCnyRate(detailData?.usdToCnyRate) || "---"}
            />

            <DetailRow
              label="USD To VND Rate"
              value={formatVndRate(detailData?.usdToVndRate) || "---"}
            />

            <DetailRow
              label="Status"
              value={formatExchangeRateStatus(detailData?.status) || "---"}
            />

            <DetailRow label="Notes" value={detailData?.notes || "---"} />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Banner ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {detailData?.id}
                </span>
              }
            />
            <DetailRow
              label="Business Name"
              value={detailData?.businessName || "---"}
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(detailData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={detailData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(detailData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={detailData?.updatedBy || "---"}
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

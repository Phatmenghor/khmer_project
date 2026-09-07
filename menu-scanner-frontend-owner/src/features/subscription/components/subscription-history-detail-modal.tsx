"use client";

import { useEffect, useState } from "react";
import { useSubscriptionHistoryState } from "../store/state/subscription-history-state";
import { fetchSubscriptionHistoryByIdService, downloadSubscriptionReceiptPdfService } from "../store/thunks/subscription-history-thunks";
import { clearSelectedHistory } from "../store/slice/subscription-history-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { formatDate, dateTimeFormat } from "@/utils/date/date-time-format";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Download, Loader2 } from "lucide-react";

interface SubscriptionHistoryDetailModalProps {
  subscriptionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionHistoryDetailModal({
  subscriptionId,
  isOpen,
  onClose,
}: SubscriptionHistoryDetailModalProps) {
  const { selectedHistory, operations, dispatch } = useSubscriptionHistoryState();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!subscriptionId || !isOpen) return;
    dispatch(fetchSubscriptionHistoryByIdService(subscriptionId));
  }, [subscriptionId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedHistory());
    onClose();
  };

  const handleDownloadPdf = async () => {
    const targetSubId = subscriptionId || selectedHistory?.subscriptionId;
    if (!targetSubId) return;
    setIsDownloading(true);
    try {
      await downloadSubscriptionReceiptPdfService(targetSubId);
    } finally {
      setIsDownloading(false);
    }
  };

  const h = selectedHistory;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={operations.isFetchingDetail}
      isEmpty={!h}
      emptyMessage="No subscription history data available"
      title={h ? `${h.businessName} — ${h.planName}` : "Subscription Details"}
      description="Detailed information about the selected subscription"
      avatarUrl={h?.logoBusinessUrl}
      avatarName={h?.businessName}
      size="4xl"
    >
      {h && (
        <div className="space-y-6 p-1 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Store & Subscriber Details */}
            <SectionTitle>Store & Subscriber Details</SectionTitle>
            <InfoRow label="Business Name" value={h.businessName || "-"} />
            <InfoRow
              label="Invoice Number"
              value={h.invoiceNumber || (h.subscriptionId ? `SUB-${h.subscriptionId.substring(0, 8).toUpperCase()}` : "-")}
            />

            {/* Subscription & Plan Details */}
            <SectionTitle>Subscription & Plan Details</SectionTitle>
            <InfoRow label="Plan Name" value={h.planName || "-"} />
            <InfoRow
              label="Plan Price"
              value={h.planPrice !== undefined ? `$${h.planPrice.toFixed(2)}` : "-"}
            />
            <InfoRow label="Duration Type" value={h.planDurationType ? formatEnumValue(h.planDurationType) : "-"} />
            <InfoRow
              label="Subscription Status"
              value={
                h.status ? (
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                    h.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : h.status === "CANCELLED"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      : h.status === "CHANGE_PLAN"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  }`}>
                    {formatEnumValue(h.status)}
                  </span>
                ) : "-"
              }
            />
            <InfoRow label="Start Date" value={formatDate(h.startDate)} />
            <InfoRow label="End Date" value={formatDate(h.endDate)} />
            <InfoRow
              label="Days Remaining"
              value={h.status === "EXPIRED" ? "Expired" : h.status === "CANCELLED" ? "Cancelled" : `${h.daysRemaining ?? 0} days`}
            />
            <InfoRow label="Auto Renew" value={h.autoRenew ? "Enabled" : "Disabled"} />

            {/* Payment & Invoice Details */}
            <SectionTitle>Payment & Invoice Details</SectionTitle>
            <InfoRow label="Payment Status" value={h.paymentStatus ? formatEnumValue(h.paymentStatus) : "-"} />
            <InfoRow
              label="Total Paid"
              value={h.totalPaid !== undefined ? `$${h.totalPaid.toFixed(2)}` : "$0.00"}
            />
            {h.payment ? (
              <>
                <InfoRow
                  label="Amount"
                  value={h.payment.amount !== undefined ? `$${h.payment.amount.toFixed(2)}` : "-"}
                />
                <InfoRow label="Payment Method" value={h.payment.paymentMethod ? formatEnumValue(h.payment.paymentMethod) : "-"} />
                <InfoRow label="Payment Type" value={h.payment.paymentType ? formatEnumValue(h.payment.paymentType) : "-"} />
                <InfoRow label="Reference No." value={h.payment.referenceNumber || "-"} />
                {h.payment.paidAt && (
                  <InfoRow
                    label="Paid At"
                    value={dateTimeFormat(h.payment.paidAt)}
                  />
                )}
              </>
            ) : (
              <InfoRow label="Payment Record" value="No payment record available" fullWidth />
            )}
          </div>

          {/* Download Receipt Bar */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-end">
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Downloading PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-primary" />
                  <span>Download PDF Receipt</span>
                </>
              )}
            </CustomButton>
          </div>
        </div>
      )}
    </DetailModal>
  );
}

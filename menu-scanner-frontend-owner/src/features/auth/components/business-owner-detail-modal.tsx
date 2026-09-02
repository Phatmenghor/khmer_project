"use client";

import { useEffect, useState } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectIsFetchingDetail,
  selectSelectedBusinessOwner,
} from "../store/selectors/business-owner-selectors";
import { fetchBusinessOwnerByIdService } from "../store/thunks/business-owner-thunks";
import { clearSelectedBusinessOwner } from "../store/slice/business-owner-slice";
import Loading from "@/components/shared/common/loading";
import { fetchAllSubscriptionsByBusinessIdService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { SubscriptionHistoryResponseModel } from "@/features/subscription/store/models/response/subscription-history-response";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { CreditCard } from "lucide-react";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";

interface BusinessOwnerDetailModalProps {
  businessOwnerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessOwnerDetailModal({
  businessOwnerId,
  isOpen,
  onClose,
}: BusinessOwnerDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const d = useAppSelector(selectSelectedBusinessOwner);

  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryResponseModel[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!businessOwnerId || !isOpen) return;
    dispatch(fetchBusinessOwnerByIdService(businessOwnerId)).unwrap().catch(console.error);
  }, [businessOwnerId, isOpen, dispatch]);

  useEffect(() => {
    if (!d?.businessId || !isOpen) return;
    setIsLoadingHistory(true);
    dispatch(fetchAllSubscriptionsByBusinessIdService(d.businessId))
      .unwrap()
      .then((data: SubscriptionHistoryResponseModel[]) => setSubscriptionHistory(data ?? []))
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [d?.businessId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBusinessOwner());
    setSubscriptionHistory([]);
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!d}
      emptyMessage="No business owner data available"
      title={d?.businessName || d?.ownerFullName || "Business Owner Details"}
      description="Manage business owner accounts and subscriptions"
      avatarUrl={d?.logoBusinessUrl}
      avatarName={d?.businessName || d?.ownerFullName}
      size="5xl"
    >
      {d && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          {/* Owner Information */}
          <SectionTitle>Owner Information</SectionTitle>
          <InfoRow label="User Identifier" value={d.ownerUserIdentifier || "-"} />
          <InfoRow label="Full Name" value={d.ownerFullName || "-"} />
          <InfoRow label="Email" value={d.ownerEmail || "-"} />
          <InfoRow label="Phone" value={d.ownerPhone || "-"} />
          <InfoRow
            label="Account Status"
            value={
              d.ownerAccountStatus ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                  {formatEnumValue(d.ownerAccountStatus)}
                </span>
              ) : "-"
            }
          />

          {/* Business Information */}
          <SectionTitle>Business Information</SectionTitle>
          <InfoRow label="Business Name" value={d.businessName || "-"} />
          <InfoRow label="Subdomain" value={d.subdomain || "-"} />
          <InfoRow label="Business Email" value={d.businessEmail || "-"} />
          <InfoRow label="Business Phone" value={d.businessPhone || "-"} />
          <InfoRow
            label="Business Status"
            value={
              d.businessStatus ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  {formatEnumValue(d.businessStatus)}
                </span>
              ) : "-"
            }
          />
          <InfoRow label="Subscription Active" value={d.isSubscriptionActive ? "Yes" : "No"} />
          <InfoRow label="Stock Management" value={d.enableStock ? "Enabled" : "Disabled"} />
          <InfoRow label="Business Address" value={d.businessAddress || "-"} fullWidth />

          {/* Subscription Information */}
          <SectionTitle>Subscription Information</SectionTitle>
          <InfoRow label="Plan Name" value={d.currentPlanName || "-"} />
          <InfoRow
            label="Plan Price"
            value={d.currentPlanPrice !== undefined ? `$${d.currentPlanPrice}` : "-"}
          />
          <InfoRow label="Duration Type" value={d.currentPlanDurationType ? formatEnumValue(d.currentPlanDurationType) : "-"} />
          <InfoRow
            label="Status"
            value={
              d.subscriptionStatus ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">
                  {formatEnumValue(d.subscriptionStatus)}
                </span>
              ) : "-"
            }
          />
          <InfoRow label="Start Date" value={formatDate(d.subscriptionStartDate)} />
          <InfoRow label="End Date" value={formatDate(d.subscriptionEndDate)} />
          <InfoRow
            label="Days Remaining"
            value={d.daysRemaining !== undefined ? `${d.daysRemaining} days` : "-"}
          />
          <InfoRow
            label="Days Active"
            value={d.daysActive !== undefined ? `${d.daysActive} days` : "-"}
          />
          <InfoRow label="Auto Renew" value={d.autoRenew ? "Enabled" : "Disabled"} />
          {d.subscriptionCancellationReason && (
            <InfoRow label="Cancellation Reason" value={d.subscriptionCancellationReason} fullWidth />
          )}

          {/* Subscription History Table */}
          <SectionTitle className="col-span-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-primary" />
            Subscription History
          </SectionTitle>
          <div className="col-span-2">
            <DataTableWithPagination
              data={subscriptionHistory}
              columns={[
                {
                  key: "index",
                  label: "#",
                  minWidth: "40px",
                  maxWidth: "50px",
                  render: (_, idx) => <span className="text-xs text-muted-foreground">{idx + 1}</span>,
                },
                {
                  key: "planName",
                  label: "Plan",
                  minWidth: "100px",
                  render: (row) => <span className="text-xs font-semibold text-foreground">{row.planName || "—"}</span>,
                },
                {
                  key: "planDurationType",
                  label: "Duration",
                  minWidth: "90px",
                  render: (row) => <span className="text-xs text-muted-foreground">{row.planDurationType || "—"}</span>,
                },
                {
                  key: "planPrice",
                  label: "Price",
                  minWidth: "80px",
                  render: (row) => <span className="text-xs font-medium text-foreground tabular-nums">${row.planPrice?.toFixed(2) ?? "0.00"}</span>,
                },
                {
                  key: "startDate",
                  label: "Start Date",
                  minWidth: "100px",
                  render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.startDate)}</span>,
                },
                {
                  key: "endDate",
                  label: "End Date",
                  minWidth: "100px",
                  render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.endDate)}</span>,
                },
                {
                  key: "status",
                  label: "Status",
                  minWidth: "90px",
                  render: (row) => (
                    <span className={`text-xs font-semibold ${row.status === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : row.status === "CANCELLED" ? "text-amber-600 dark:text-amber-400" : row.status === "CHANGE_PLAN" ? "text-blue-600 dark:text-blue-400" : "text-destructive"}`}>
                      {row.status || "—"}
                    </span>
                  ),
                },
                {
                  key: "paymentStatus",
                  label: "Payment",
                  minWidth: "100px",
                  render: (row) => (
                    <span className={`text-xs font-semibold ${row.paymentStatus === "PAID" ? "text-emerald-600 dark:text-emerald-400" : row.paymentStatus === "PENDING" || row.paymentStatus === "PARTIALLY_PAID" ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`}>
                      {row.paymentStatus?.replace("_", " ") || "—"}
                    </span>
                  ),
                },
                {
                  key: "totalPaid",
                  label: "Total Paid",
                  minWidth: "90px",
                  render: (row) => <span className="text-xs font-medium text-foreground tabular-nums">${row.totalPaid?.toFixed(2) ?? "0.00"}</span>,
                },
              ]}
              loading={isLoadingHistory}
              emptyMessage="No subscription history found"
              getRowKey={(row, idx) => `${row.subscriptionId}-${idx}`}
              showPagination={false}
              showPageSizeSelector={false}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
            />
          </div>

          {/* System Information */}
          <SectionTitle className="col-span-2">System Info</SectionTitle>
          <InfoRow label="Owner ID" value={d.ownerId || "-"} />
          <InfoRow label="Business ID" value={d.businessId || "-"} />
          <InfoRow label="Setting ID" value={d.businessSettingId || "-"} />
          <InfoRow label="Plan ID" value={d.currentPlanId || "-"} />
          <InfoRow label="Subscription ID" value={d.currentSubscriptionId || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(d.createdAt ?? "")} />
          <InfoRow label="Created By" value={d.createdBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(d.updatedAt ?? "")} />
          <InfoRow label="Updated By" value={d.updatedBy || "-"} fullWidth />
        </div>
      )}
    </DetailModal>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { bakongApiService } from "../services/bakong-api-service";
import { BakongAccountModel } from "../models/bakong-models";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { CheckCircle2, XCircle } from "lucide-react";

interface BakongAccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string | null;
}

export function BakongAccountDetailModal({
  isOpen,
  onClose,
  accountId,
}: BakongAccountDetailModalProps) {
  const [account, setAccount] = useState<BakongAccountModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accountId && isOpen) {
      setIsLoading(true);
      bakongApiService
        .getAccountById(accountId)
        .then((res) => {
          setAccount(res);
        })
        .catch(() => {
          setAccount(null);
        })
        .finally(() => setIsLoading(false));
    } else if (!isOpen) {
      setAccount(null);
    }
  }, [accountId, isOpen]);

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      isEmpty={!isLoading && !account}
      emptyMessage="Account detail not found"
      title="Bakong Account Detail"
      description="Detailed merchant Bakong account configuration and active status"
      size="5xl"
    >
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Account Information</SectionTitle>
          <InfoRow label="Bakong Account ID" value={<span className="font-mono">{account.accountId || "-"}</span>} />
          <InfoRow
            label="Status"
            value={
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                  account.enabled || account.isDefault
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {account.enabled || account.isDefault ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> ACTIVE PRIMARY
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> INACTIVE
                  </>
                )}
              </span>
            }
          />
          <InfoRow label="Merchant Name" value={account.merchantName || "-"} />
          <InfoRow label="Merchant City" value={account.merchantCity || "-"} />
          <InfoRow label="Acquiring Bank" value={account.acquiringBank || "-"} />
          <InfoRow label="Currency" value={account.currency || "-"} />

          <SectionTitle>Audit & System Info</SectionTitle>
          <InfoRow label="Record ID" value={account.id || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(account.createdAt)} />
          <InfoRow label="Last Updated" value={dateTimeFormat(account.updatedAt)} />
        </div>
      )}
    </DetailModal>
  );
}

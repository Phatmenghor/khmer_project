"use client";

import React, { useEffect, useState } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { useAppDispatch } from "@/store";
import { fetchTransactionDetailThunk } from "../store/thunks/bakong-thunks";
import { BakongTransactionModel, BakongTransactionLogModel } from "../models/bakong-models";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface BakongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export function BakongDetailModal({ isOpen, onClose, transactionId }: BakongDetailModalProps) {
  const dispatch = useAppDispatch();
  const [detail, setDetail] = useState<{
    transaction: BakongTransactionModel;
    logs: BakongTransactionLogModel[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transactionId && isOpen) {
      setIsLoading(true);
      dispatch(fetchTransactionDetailThunk(transactionId))
        .unwrap()
        .then((res) => setDetail(res))
        .catch(() => setDetail(null))
        .finally(() => setIsLoading(false));
    }
  }, [transactionId, isOpen, dispatch]);

  const tx = detail?.transaction;
  const logs = detail?.logs || [];

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      isEmpty={!isLoading && !tx}
      emptyMessage="Transaction detail not found"
      title="Bakong Transaction Detail"
      description="Detailed transaction audit trail and append-only action logs"
      size="5xl"
    >
      {tx && (
        <div className="space-y-4 p-1 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
            <SectionTitle>Transaction Overview</SectionTitle>
            <InfoRow label="System Transaction ID" value={<span className="font-mono font-bold text-foreground">{tx.transactionId || tx.id}</span>} />
            <InfoRow label="MD5 Hash" value={<span className="font-mono">{tx.md5 || "-"}</span>} />
            <InfoRow
              label="Status"
              value={
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                    tx.status === "SUCCESS" || tx.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}
                >
                  {tx.status === "SUCCESS" || tx.status === "PAID" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> PAID
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> {tx.status || "UNPAID"}
                    </>
                  )}
                </span>
              }
            />
            <InfoRow label="Amount" value={tx.amount != null ? `${tx.amount} ${tx.currency || ""}` : "-"} />
            <InfoRow label="Merchant Name" value={tx.merchantName || "-"} />
            <InfoRow label="Receiver Account" value={tx.toAccountId || "-"} />
            <InfoRow label="Payer Account" value={tx.fromAccountId || "-"} />
            <InfoRow label="Transaction Hash" value={<span className="font-mono text-xs">{tx.hash || "-"}</span>} fullWidth />
            {tx.rawQrString && (
              <InfoRow
                label="Raw QR String"
                value={
                  <span className="font-mono text-[11px] bg-muted/40 px-2 py-1 rounded border border-border/40 block overflow-x-auto break-all">
                    {tx.rawQrString}
                  </span>
                }
                fullWidth
              />
            )}

            <SectionTitle>Audit & System Info</SectionTitle>
            <InfoRow label="System Internal UUID" value={tx.id || "-"} />
            <InfoRow label="Project Code" value={tx.projectCode || "-"} />
            <InfoRow label="Created At" value={dateTimeFormat(tx.createdAt)} />
            <InfoRow label="Last Updated" value={dateTimeFormat(tx.updatedAt)} />
          </div>

          <SectionTitle>Append-Only Event History Logs ({logs.length})</SectionTitle>
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg border border-border/50 bg-muted/30 text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground font-mono">{log.action}</span>
                    <span className="text-muted-foreground text-[10px]">{dateTimeFormat(log.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[10px]">
                    <span>Status: <strong className="text-foreground">{log.status}</strong></span>
                    {log.amount && <span>Amount: {log.amount} {log.currency || ""}</span>}
                  </div>
                  {log.errorMessage && (
                    <p className="text-destructive font-mono text-[10px]">{log.errorMessage}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">No event logs recorded</p>
            )}
          </div>
        </div>
      )}
    </DetailModal>
  );
}

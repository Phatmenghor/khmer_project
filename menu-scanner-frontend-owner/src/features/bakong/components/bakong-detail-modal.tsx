"use client";

import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { useAppDispatch } from "@/store";
import { fetchTransactionDetailThunk } from "../store/thunks/bakong-thunks";
import { BakongTransactionModel, BakongTransactionLogModel } from "../models/bakong-models";
import { FileText, Clock, ArrowRightLeft } from "lucide-react";

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
    <CustomModal isOpen={isOpen} onClose={onClose} size="xl">
      <FormHeader
        title="Bakong Transaction & Event Logs History"
        description="Detailed transaction audit trail and append-only action logs"
        icon={FileText}
      />

      <FormBody className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading details...</div>
        ) : tx ? (
          <div className="space-y-4 text-xs">
            {/* Transaction Overview Card */}
            <div className="p-3.5 rounded-lg bg-card border border-border/80 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="font-bold text-foreground font-mono">MD5: {tx.md5}</span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    tx.status === "SUCCESS" || tx.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <strong className="text-foreground">{tx.amount} {tx.currency}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Receiver Account: </span>
                  <strong className="text-foreground">{tx.toAccountId || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Hash: </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{tx.hash || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created At: </span>
                  <span>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Event Audit Logs Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Append-Only Event History Logs ({logs.length})
              </h3>

              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg border border-border/50 bg-muted/30 text-[11px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary flex items-center gap-1">
                          <ArrowRightLeft className="h-3 w-3" /> {log.action}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Status: <strong className="text-foreground">{log.status}</strong></span>
                        <span>Amount: {log.amount ? `${log.amount} ${log.currency}` : "N/A"}</span>
                      </div>
                      {log.errorMessage && (
                        <p className="text-destructive font-mono text-[10px]">{log.errorMessage}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-3">No event logs recorded for this transaction.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">Transaction details not found.</div>
        )}
      </FormBody>

      <FormFooter isSubmitting={false} isDirty={false} showStatusText={false}>
        <CancelButton onClick={onClose} text="Close" />
      </FormFooter>
    </CustomModal>
  );
}

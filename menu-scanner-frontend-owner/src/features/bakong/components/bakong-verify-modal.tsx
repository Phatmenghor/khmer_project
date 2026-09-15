"use client";

import React, { useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { useAppDispatch } from "@/store";
import { verifyTransactionThunk } from "../store/thunks/bakong-thunks";
import { BakongVerifyResponseModel } from "../models/bakong-models";
import { Search, Database, Globe, CheckCircle2 } from "lucide-react";

interface BakongVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BakongVerifyModal({ isOpen, onClose, onSuccess }: BakongVerifyModalProps) {
  const dispatch = useAppDispatch();

  const [transactionId, setTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<BakongVerifyResponseModel | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      showToast.error("Please enter Transaction ID");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await dispatch(
        verifyTransactionThunk({
          transactionId: transactionId.trim(),
        })
      ).unwrap();

      setResult(res);
      if (res.searchedLocal) {
        showToast.success("Found transaction record in local database!");
      } else {
        showToast.success("Queried NBC upstream Bakong API successfully!");
      }
      onSuccess();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Transaction verification failed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const resetModal = () => {
    setTransactionId("");
    setResult(null);
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={resetModal} size="2xl">
      <FormHeader
        title="Verify Transaction"
        description="Search local database or query live NBC Bakong API"
      />

      <form onSubmit={handleVerify} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-3">
          <CustomInput
            label="Transaction ID"
            placeholder="Enter Transaction ID (e.g. TXN-20260915114600)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="font-mono"
            required
          />

          {result && (
            <div className="p-3.5 rounded-lg bg-card border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  {result.searchedLocal ? (
                    <Database className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-emerald-500" />
                  )}
                  Source: {result.source}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    result.searchedLocal
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}
                >
                  {result.searchedLocal ? "LOCAL DB HIT" : "LIVE NBC UPSTREAM"}
                </span>
              </div>

              <p className="text-muted-foreground">{result.message}</p>

              {result.transaction && (
                <div className="pt-2 border-t border-border/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {result.transaction.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">
                      {result.transaction.amount} {result.transaction.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{result.transaction.transactionId || result.transaction.md5}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormBody>

        <FormFooter isSubmitting={isVerifying} isDirty={true} showStatusText={false}>
          <CancelButton onClick={resetModal} disabled={isVerifying} />
          <SubmitButton
            isSubmitting={isVerifying}
            isCreate={true}
            createText="Verify Transaction"
            submittingCreateText="Verifying..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}

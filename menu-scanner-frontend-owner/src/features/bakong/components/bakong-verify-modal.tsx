"use client";

import React, { useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
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

  const [md5, setMd5] = useState("");
  const [hash, setHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<BakongVerifyResponseModel | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!md5.trim() && !hash.trim()) {
      showToast.error("Please enter MD5 hash or transaction hash");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await dispatch(
        verifyTransactionThunk({
          md5: md5.trim() || undefined,
          hash: hash.trim() || undefined,
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
    setMd5("");
    setHash("");
    setResult(null);
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={resetModal} size="lg">
      <FormHeader
        title="Check & Verify Bakong Transaction"
        description="Searches local database first. If missing or unpaid, queries live NBC Bakong API."
        icon={Search}
      />

      <form onSubmit={handleVerify} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">MD5 Hash</label>
            <input
              type="text"
              placeholder="e.g. 5d41402abc4b2a76b9719d911017c592"
              value={md5}
              onChange={(e) => setMd5(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Transaction Hash (or Hash String)</label>
            <input
              type="text"
              placeholder="e.g. 6f1a8c... OR full transaction hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

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
                    <span className="text-muted-foreground">MD5:</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{result.transaction.md5}</span>
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

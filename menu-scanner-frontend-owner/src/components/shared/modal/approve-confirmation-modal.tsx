"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, type LucideIcon } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApproveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  title: string;
  description: string;
  icon?: LucideIcon;
  itemName?: string;
  isSubmitting?: boolean;
  confirmButtonText?: string;
  errorMessage?: string;
}

export function ApproveConfirmationModal({
  isOpen,
  onClose,
  onApprove,
  title,
  description,
  icon,
  itemName,
  isSubmitting = false,
  confirmButtonText = "Approve Round",
  errorMessage,
}: ApproveConfirmationModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsApproving(false);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    try {
      setError(null);
      setIsApproving(true);
      await onApprove();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const inFlight = isApproving || isSubmitting;
  const IconComponent = icon ?? CheckCircle2;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/60 bg-gradient-to-r from-background via-card to-background shrink-0">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 shadow-2xs">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Confirm kitchen order round approval</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 px-5 space-y-3.5 bg-card/40">
        {description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
            {description}
          </p>
        )}

        {itemName && (
          <div className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 space-y-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Target Order Round
              </span>
              <span className="text-xs font-semibold text-foreground truncate">
                {itemName}
              </span>
            </div>
          </div>
        )}

        {(error || errorMessage) && (
          <Alert variant="destructive" className="py-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs font-bold">
              {error || errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-4 px-5 border-t border-border/60 bg-background flex items-center justify-end gap-2.5 shrink-0">
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={inFlight}
          className="font-bold min-w-[85px] rounded-xl border-border/60 hover:bg-muted/50 text-xs py-2 cursor-pointer"
        >
          Cancel
        </CustomButton>
        <CustomButton
          type="button"
          variant="default"
          size="sm"
          onClick={handleApprove}
          disabled={inFlight}
          isLoading={inFlight}
          className="font-bold min-w-[125px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 shadow-xs cursor-pointer"
        >
          {inFlight ? "Approving..." : confirmButtonText}
        </CustomButton>
      </div>
    </CustomModal>
  );
}

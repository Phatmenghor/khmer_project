"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, type LucideIcon } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: string;
  icon?: LucideIcon;
  itemName?: string;
  isSubmitting?: boolean;
  variant?: "default" | "critical";
  requireConfirmation?: boolean;
  confirmationText?: string;
  confirmButtonText?: string;
  errorMessage?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  icon,
  itemName,
  isSubmitting = false,
  variant = "default",
  requireConfirmation = false,
  confirmationText = "DELETE",
  confirmButtonText,
  errorMessage,
}: DeleteConfirmationDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationValue("");
      setError(null);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const inFlight = isDeleting || isSubmitting;
  const isCritical = variant === "critical";
  const isDeleteDisabled =
    inFlight ||
    (requireConfirmation && confirmationValue.trim() !== confirmationText);

  const buttonLabel = confirmButtonText
    ? confirmButtonText
    : isCritical
      ? "Delete Permanently"
      : "Delete";

  const IconComponent = icon ?? Trash2;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/60 bg-gradient-to-r from-background via-card to-background shrink-0">
        <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0 shadow-2xs">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Action cannot be undone</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 px-5 space-y-3.5 bg-card/40">
        {description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
            {description}
          </p>
        )}

        {(itemName || isCritical) && (
          <div className="p-3.5 bg-destructive/5 rounded-2xl border border-destructive/15 space-y-2">
            {itemName && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-destructive flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  Target Item
                </span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {itemName}
                </span>
              </div>
            )}

            {isCritical && (
              <div className="flex items-center gap-2 pt-1 border-t border-destructive/10 text-destructive text-xs font-medium">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                <span>Warning: This action will permanently remove selected data.</span>
              </div>
            )}
          </div>
        )}

        {requireConfirmation && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="confirmation" className="text-xs font-bold text-foreground flex items-center gap-1 flex-wrap">
              <span>Type</span>
              <code className="bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded text-xs font-mono font-extrabold">
                {confirmationText}
              </code>
              <span>to confirm:</span>
            </Label>
            <Input
              id="confirmation"
              value={confirmationValue}
              onChange={(e) => setConfirmationValue(e.target.value)}
              placeholder={`Type "${confirmationText}" to confirm`}
              className="font-mono text-xs h-9 uppercase tracking-wider border-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/25 rounded-xl"
              autoComplete="off"
              disabled={inFlight}
            />
          </div>
        )}

        {(error || errorMessage) && (
          <Alert variant="destructive" className="py-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
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
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleteDisabled}
          isLoading={inFlight}
          className="font-bold min-w-[125px] rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs py-2 shadow-xs cursor-pointer"
        >
          {inFlight ? "Processing..." : buttonLabel}
        </CustomButton>
      </div>
    </CustomModal>
  );
}

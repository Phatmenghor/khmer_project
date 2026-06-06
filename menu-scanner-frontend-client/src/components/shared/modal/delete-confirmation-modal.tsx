"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormDialogBase } from "./form-dialog-base";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: string;
  icon?: React.ReactNode;
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
    (requireConfirmation && confirmationValue !== confirmationText);

  const buttonLabel = confirmButtonText
    ? confirmButtonText
    : isCritical
      ? "Delete Permanently"
      : "Delete";

  const headerSlot = (
    <div className="px-4 pt-4 pb-3 border-b">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md shrink-0">
          {icon ?? (
            <AlertTriangle
              className="h-5 w-5 text-destructive"
              strokeWidth={2.25}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs leading-snug text-muted-foreground mt-0.5">
            Confirm deletion
          </p>
        </div>
      </div>
    </div>
  );

  const customFooter = (
    <div
      className={
        "flex gap-2 justify-end border-t bg-muted/30 px-4 py-3 " +
        "pb-[max(env(safe-area-inset-bottom),0.75rem)] sticky bottom-0"
      }
    >
      <Button variant="outline" onClick={onClose} disabled={inFlight}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={isDeleteDisabled}
      >
        {inFlight ? "Processing..." : buttonLabel}
      </Button>
    </div>
  );

  return (
    <FormDialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      hideTitle
      noForm
      size="default"
      contentClassName="p-0 gap-0"
      bodyClassName="px-4 py-3 space-y-3"
      headerSlot={headerSlot}
      customFooter={customFooter}
    >
      {description && (
        <p className="text-sm text-foreground leading-relaxed">{description}</p>
      )}

      {itemName && (
        <div className="px-3 py-2 bg-muted/60 rounded-md border border-border">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            Item
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
            {itemName}
          </p>
        </div>
      )}

      {isCritical && (
        <Alert className="border-destructive/30 bg-destructive/5 py-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs text-destructive font-medium">
            This action cannot be undone.
          </AlertDescription>
        </Alert>
      )}

      {requireConfirmation && (
        <div className="space-y-1">
          <Label htmlFor="confirmation" className="text-xs font-medium">
            Type{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-destructive font-mono text-xs">
              {confirmationText}
            </code>{" "}
            to confirm:
          </Label>
          <Input
            id="confirmation"
            value={confirmationValue}
            onChange={(e) => setConfirmationValue(e.target.value)}
            placeholder="Type to confirm"
            className="font-mono"
            autoComplete="off"
            disabled={inFlight}
          />
        </div>
      )}

      {(error || errorMessage) && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error || errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </FormDialogBase>
  );
}

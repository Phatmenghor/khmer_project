"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { useEffect, useState } from "react";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Loader2, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

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
    (requireConfirmation && confirmationValue !== confirmationText);

  const buttonLabel = confirmButtonText
    ? confirmButtonText
    : isCritical
      ? "Delete Permanently"
      : "Delete";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      <FormHeader
        title={title}
        description="Confirm deletion"
        icon={icon ?? Trash2}
        variant="destructive"
        className="m-0 mx-0 mt-0 md:mx-0 md:mt-0 p-4 md:p-4"
      />

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <FormBody className="px-4 py-3.5 space-y-3">
          {description && (
            <p className="text-xs text-foreground leading-relaxed">
              {description}
            </p>
          )}

          {itemName && (
            <div className="px-3 py-2.5 bg-muted/50 rounded-lg border border-border/70">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Item
              </p>
              <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                {itemName}
              </p>
            </div>
          )}

          {isCritical && (
            <Alert className="border-destructive/30 bg-destructive/5 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <AlertDescription className="text-xs text-destructive font-medium">
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {requireConfirmation && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="confirmation" className="text-xs font-medium">
                Type{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-destructive font-mono text-xs">
                  {confirmationText}
                </code>{" "}
                to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationValue}
                onChange={(e) => setConfirmationValue(e.target.value)}
                placeholder="Type to confirm"
                className="font-mono text-xs"
                autoComplete="off"
                disabled={inFlight}
              />
            </div>
          )}

          {(error || errorMessage) && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                {error || errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </FormBody>

        <FormFooter
          isSubmitting={inFlight}
          isDirty={true}
          showStatusText={false}
          className="m-0 mx-0 mb-0 md:mx-0 md:mb-0 p-4 md:p-4"
        >
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={inFlight}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            isLoading={inFlight}
          >
            {inFlight ? "Deleting..." : buttonLabel}
          </CustomButton>
        </FormFooter>
      </div>
    </CustomModal>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

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

  const isDeleteDisabled =
    isSubmitting ||
    isDeleting ||
    (requireConfirmation && confirmationValue !== confirmationText);

  const isCritical = variant === "critical";

  const buttonLabel = confirmButtonText
    ? confirmButtonText
    : isCritical
    ? "Delete Permanently"
    : "Delete";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded shrink-0">
              {icon ?? <AlertTriangle className="h-3 w-3 text-destructive" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </div>

        <FormBody>
          {itemName && (
            <div className="p-2 bg-muted rounded border border-muted-foreground/20">
              <p className="text-xs">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-semibold text-foreground ml-1">"{itemName}"</span>
              </p>
            </div>
          )}

          {isCritical && (
            <Alert className="border-destructive/30 bg-destructive/5">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <AlertDescription className="text-destructive">
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
                disabled={isDeleting || isSubmitting}
              />
            </div>
          )}

          {(error || errorMessage) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription>{error || errorMessage}</AlertDescription>
            </Alert>
          )}
        </FormBody>

        <FormFooter isSubmitting={isDeleting || isSubmitting} isDirty={true}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
          >
            {isDeleting || isSubmitting ? "Processing..." : buttonLabel}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}

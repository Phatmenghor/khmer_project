"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
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
  itemName?: string;
  isSubmitting?: boolean;
  variant?: "default" | "critical";
  requireConfirmation?: boolean;
  confirmationText?: string;
  errorMessage?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  itemName,
  isSubmitting = false,
  variant = "default",
  requireConfirmation = false,
  confirmationText = "DELETE",
  errorMessage,
  maxWidth = "sm",
}: DeleteConfirmationDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const isDeleteDisabled =
    isSubmitting ||
    isDeleting ||
    (requireConfirmation && confirmationValue !== confirmationText);

  const isCritical = variant === "critical";

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`w-full ${maxWidthClass} p-0 flex flex-col`}>
        <FormHeader
          title={title}
          description={description}
        />

        <FormBody>
          {itemName && (
            <div className="p-3 bg-muted rounded-lg border border-muted-foreground/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Item to delete:</span>
                <span className="font-semibold text-foreground ml-2">
                  "{itemName}"
                </span>
              </p>
            </div>
          )}

          {isCritical && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Input for Critical Actions */}
          {requireConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-sm font-medium">
                Type{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-red-600 font-mono text-xs">
                  {confirmationText}
                </code>{" "}
                to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationValue}
                onChange={(e) => setConfirmationValue(e.target.value)}
                placeholder="Type to confirm deletion"
                className="font-mono"
                autoComplete="off"
                disabled={isDeleting || isSubmitting}
              />
            </div>
          )}

          {/* Error Alert */}
          {(error || errorMessage) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || errorMessage}</AlertDescription>
            </Alert>
          )}
        </FormBody>

        <FormFooter isSubmitting={isDeleting || isSubmitting} isDirty={true}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className={`flex-1 sm:flex-initial ${
              isCritical
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isDeleting || isSubmitting ? (
              <>Deleting...</>
            ) : (
              <>Delete{isCritical ? " Permanently" : ""}</>
            )}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}

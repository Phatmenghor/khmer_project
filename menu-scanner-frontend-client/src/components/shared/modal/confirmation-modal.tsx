"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isSubmitting?: boolean;
  actionLabel?: string;
  actionVariant?: "default" | "destructive" | "secondary" | "warning";
  headerBgColor?: string;
  buttonColor?: string;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isSubmitting = false,
  actionLabel = "Confirm",
  actionVariant = "default",
  headerBgColor = "bg-blue-50",
  buttonColor = "",
  isDangerous = false,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete action");
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isSubmitting || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xl p-0 flex flex-col shadow-lg shadow-yellow-200">
        <VisuallyHidden asChild>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className={`p-6 border-b border-border ${headerBgColor}`}>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>

        <FormBody>
          {itemName && (
            <div className="p-3 bg-muted rounded-lg border border-muted-foreground/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-semibold text-foreground ml-2">
                  "{itemName}"
                </span>
              </p>
            </div>
          )}

          {isDangerous && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </FormBody>

        <FormFooter isSubmitting={isProcessing || isSubmitting} isDirty={true}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDisabled}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant={actionVariant}
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`flex-1 sm:flex-initial gap-2 ${buttonColor}`}
          >
            {isProcessing || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>{actionLabel}</span>
              </>
            )}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}

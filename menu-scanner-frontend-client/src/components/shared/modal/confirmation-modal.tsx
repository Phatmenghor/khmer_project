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
  actionVariant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
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
        <div className={`p-4 border-b border-border ${headerBgColor}`}>
          <h2 className="text-xs font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>

        <FormBody>
          {itemName && (
            <div className="p-2 bg-muted rounded border border-muted-foreground/20">
              <p className="text-xs">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-semibold text-foreground ml-1">
                  "{itemName}"
                </span>
              </p>
            </div>
          )}

          {isDangerous && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <AlertDescription className="text-red-700">
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-3 w-3" />
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
            className={`flex-1 sm:flex-initial gap-1 ${buttonColor}`}
          >
            {isProcessing || isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>{actionLabel}</span>
              </>
            )}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}

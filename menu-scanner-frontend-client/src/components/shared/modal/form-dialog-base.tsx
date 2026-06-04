"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface FormDialogBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e?: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  submitVariant?: "default" | "destructive";
  showActions?: boolean;
  size?: "default" | "sm" | "lg";
}

/**
 * Base FormDialog component to standardize 36+ modal forms
 *
 * Replaces boilerplate dialog + form + action buttons pattern
 *
 * Usage:
 * <FormDialogBase
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Edit Profile"
 *   onSubmit={handleSubmit}
 *   isLoading={isSaving}
 * >
 *   <form className="space-y-3">
 *     {/* form fields */}
 *   </form>
 * </FormDialogBase>
 */
export function FormDialogBase({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  submitText = "Save",
  cancelText = "Cancel",
  submitVariant = "default",
  showActions = true,
  size = "default",
}: FormDialogBaseProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          size === "sm"
            ? "max-w-sm"
            : size === "lg"
              ? "max-w-2xl"
              : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto">{children}</div>

          {showActions && (
            <div className="flex gap-2 justify-end border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                variant={submitVariant}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    {submitText}ing...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Extended version with custom actions
 */
export function FormDialogBaseWithCustomActions({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  size = "default",
}: Omit<FormDialogBaseProps, "onSubmit" | "submitText" | "cancelText"> & {
  actions?: ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          size === "sm"
            ? "max-w-sm"
            : size === "lg"
              ? "max-w-2xl"
              : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">{children}</div>

        {actions && <div className="flex gap-2 justify-end border-t pt-3">{actions}</div>}
      </DialogContent>
    </Dialog>
  );
}

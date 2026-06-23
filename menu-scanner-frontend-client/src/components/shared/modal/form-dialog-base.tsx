"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import type { FormDialogProps, ModalSize } from "./modal.types";

export type {
  FormDialogProps as FormDialogBaseProps,
  ModalSize,
  SubmitVariant,
  BaseModalProps,
} from "./modal.types";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-xs",
  default: "sm:max-w-sm",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-3xl",
  full: "sm:max-w-[85vw]",
};

/**
 * Standard form/dialog shell.
 *
 * - Mobile-first: inherits bottom-sheet behavior from ui/dialog (<sm) and
 *   centered modal (>=sm). Uses vh, not vh, so iOS keyboards don't crop.
 * - Safe-area aware: footer respects env(safe-area-inset-bottom) for
 *   iPhone home indicator and Telegram Mini App bottom chrome.
 * - Back-compat: original FormDialogBase props are preserved.
 * - Slots: headerSlot replaces the default header; customFooter replaces
 *   the default Cancel/Submit row; noForm renders content without a
 *   <form> wrapper (for confirmations / detail views).
 *
 * Usage:
 *   <FormDialogBase
 *     isOpen={isOpen}
 *     onClose={onClose}
 *     title="Edit Profile"
 *     onSubmit={handleSubmit}
 *     isLoading={isSaving}
 *   >
 *     ...form fields...
 *   </FormDialogBase>
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
  hideCloseButton = false,
  contentClassName,
  bodyClassName,
  headerSlot,
  customFooter,
  noForm = false,
  submitDisabled = false,
  hideTitle = false,
}: FormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const header = headerSlot ? (
    <>
      {}
      <VisuallyHidden asChild>
        <DialogTitle>{title}</DialogTitle>
      </VisuallyHidden>
      {description && (
        <VisuallyHidden asChild>
          <DialogDescription>{description}</DialogDescription>
        </VisuallyHidden>
      )}
      {headerSlot}
    </>
  ) : (
    <DialogHeader>
      {hideTitle ? (
        <VisuallyHidden asChild>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
      ) : (
        <DialogTitle>{title}</DialogTitle>
      )}
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
  );

  const body = (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto",
        "max-h-[70vh] sm:max-h-[60vh]",
        bodyClassName
      )}
    >
      {children}
    </div>
  );

  const defaultFooter = showActions && (
    <div
      className={cn(
        "flex gap-2 justify-end border-t pt-3 px-3 pb-3",
        "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
        "bg-background sticky bottom-0"
      )}
    >
      <CustomButton
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </CustomButton>
      <CustomButton
        type={noForm ? "button" : "submit"}
        variant={submitVariant}
        disabled={isLoading || submitDisabled}
        onClick={noForm ? () => onSubmit?.() : undefined}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {submitText}ing...
          </>
        ) : (
          submitText
        )}
      </CustomButton>
    </div>
  );

  const footer = customFooter ?? defaultFooter;

  const inner = (
    <>
      {header}
      {body}
      {footer}
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex flex-col gap-2 p-0",
          SIZE_CLASSES[size],
          contentClassName
        )}
        closeButtonClassName={hideCloseButton ? "hidden" : ""}
      >
        {noForm ? (
          <div className="flex flex-col gap-2 px-3 pt-3">{inner}</div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 px-3 pt-3"
          >
            {inner}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Back-compat alias for prior call sites. Prefer FormDialogBase with
 * customFooter / headerSlot props.
 */
export function FormDialogBaseWithCustomActions({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  size = "default",
  contentClassName,
  bodyClassName,
  headerSlot,
}: Omit<FormDialogProps, "onSubmit" | "submitText" | "cancelText"> & {
  actions?: ReactNode;
}) {
  return (
    <FormDialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      contentClassName={contentClassName}
      bodyClassName={bodyClassName}
      headerSlot={headerSlot}
      noForm
      customFooter={
        actions ? (
          <div
            className={cn(
              "flex gap-2 justify-end border-t pt-3 px-3 pb-3",
              "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
              "bg-background sticky bottom-0"
            )}
          >
            {actions}
          </div>
        ) : null
      }
    >
      {children}
    </FormDialogBase>
  );
}

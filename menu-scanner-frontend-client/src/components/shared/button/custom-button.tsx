"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X, Download, FileSpreadsheet, Eye, Edit, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CustomButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  children?: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: ButtonProps["variant"] | "primary" | "unstyled";
  size?: ButtonProps["size"] | "unstyled";
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(({ onClick, className, children, type = "button", isLoading, icon, disabled, variant, size, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const resolvedVariant = (variant === "primary" ? "default" : variant) as ButtonProps["variant"];

  if (variant === "unstyled") {
    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={cn(className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className={cn("h-3 w-3 animate-spin shrink-0", children && "mr-1.5")} />}
        {!isLoading && icon && <span className={cn("flex items-center shrink-0", children && "mr-1.5")}>{icon}</span>}
        {children}
      </button>
    );
  }

  // Radix Slot (activated via asChild) expects exactly one React child element.
  if (props.asChild) {
    return (
      <Button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={cn(className)}
        disabled={isLoading || disabled}
        variant={resolvedVariant}
        size={size as any}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      ref={ref}
      type={type}
      onClick={handleClick}
      className={cn(className)}
      disabled={isLoading || disabled}
      variant={resolvedVariant}
      size={size as any}
      {...props}
    >
      {isLoading && <Loader2 className={cn("h-3 w-3 animate-spin shrink-0", children && "mr-1.5")} />}
      {!isLoading && icon && <span className={cn("flex items-center shrink-0", children && "mr-1.5")}>{icon}</span>}
      {children}
    </Button>
  );
});

CustomButton.displayName = "CustomButton";

export interface SubmitButtonProps {
  isSubmitting: boolean;
  isDirty?: boolean;
  isEdit?: boolean;
  isCreate?: boolean;
  createText?: string;
  updateText?: string;
  submittingCreateText?: string;
  submittingUpdateText?: string;
  customText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: (e?: any) => void;
}

export function SubmitButton({
  isSubmitting,
  isDirty = true,
  isEdit = false,
  isCreate = false,
  createText,
  updateText,
  submittingCreateText,
  submittingUpdateText,
  customText,
  className,
  disabled,
  onClick,
}: SubmitButtonProps) {
  const isCreation = isCreate || !isEdit;
  const defaultText = customText || (isCreation ? (createText || "Create Item") : (updateText || "Save Changes"));
  const defaultSubmittingText = isCreation ? (submittingCreateText || "Creating…") : (submittingUpdateText || "Saving…");
  const buttonText = isSubmitting ? defaultSubmittingText : defaultText;

  return (
    <CustomButton
      type="submit"
      disabled={isSubmitting || !isDirty || disabled}
      isLoading={isSubmitting}
      variant="default"
      onClick={onClick}
      className={cn("min-w-[120px]", className)}
    >
      {buttonText}
    </CustomButton>
  );
}

export interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  customText?: string;
  text?: string;
  variant?: ButtonProps["variant"];
  className?: string;
}

export function CancelButton({
  onClick,
  disabled = false,
  customText,
  text = "Cancel",
  variant = "outline",
  className,
}: CancelButtonProps) {
  return (
    <CustomButton
      type="button"
      variant={variant as any}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {customText || text}
    </CustomButton>
  );
}

export interface ModalFooterActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isDirty?: boolean;
  isEdit?: boolean;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
}

export function ModalFooterActions({
  onCancel,
  onSubmit,
  isSubmitting = false,
  isDirty = true,
  isEdit = false,
  submitText,
  cancelText = "Cancel",
  submitDisabled = false,
}: ModalFooterActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
      <CancelButton
        onClick={onCancel}
        disabled={isSubmitting}
        customText={cancelText}
      />
      {onSubmit ? (
        <CustomButton
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isDirty || submitDisabled}
          isLoading={isSubmitting}
          variant="default"
        >
          {submitText || (isEdit ? "Save Changes" : "Create")}
        </CustomButton>
      ) : (
        <SubmitButton
          isSubmitting={isSubmitting}
          isDirty={isDirty && !submitDisabled}
          isEdit={isEdit}
          customText={submitText}
        />
      )}
    </div>
  );
}

export interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  tooltip?: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function IconButton({
  icon,
  label,
  tooltip,
  onClick,
  variant = "ghost",
  size = "icon",
  className,
  disabled = false,
  loading = false,
}: IconButtonProps) {
  const text = tooltip || label;
  const isDestructive = variant === "destructive";

  const defaultThemeClass = isDestructive
    ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
    : "text-foreground hover:bg-muted/80";

  const finalClassName = cn(
    "h-7 w-7 rounded-lg transition-all duration-150 ease-out hover:scale-105 active:scale-95 flex items-center justify-center shrink-0",
    defaultThemeClass,
    className
  );

  if (!text) {
    return (
      <CustomButton
        type="button"
        variant="ghost"
        size={size}
        onClick={onClick}
        disabled={disabled}
        isLoading={loading}
        className={finalClassName}
      >
        {icon}
      </CustomButton>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <CustomButton
            type="button"
            variant="ghost"
            size={size}
            onClick={onClick}
            disabled={disabled}
            isLoading={loading}
            className={finalClassName}
            aria-label={text}
          >
            {icon}
          </CustomButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} className="z-50 px-2.5 py-1 text-[11px] font-extrabold shadow-md bg-popover/95 backdrop-blur-xs text-popover-foreground border border-border/80 rounded-md animate-in fade-in-0 zoom-in-95 duration-150">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export type ActionButtonProps = IconButtonProps;
export const ActionButton = IconButton;

export interface TableActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  isDeleting?: boolean;
  className?: string;
}

export function TableActionButtons({
  onView,
  onEdit,
  onDelete,
  viewTooltip = "View Details",
  editTooltip = "Edit Item",
  deleteTooltip = "Delete Item",
  isDeleting = false,
  className = "",
}: TableActionButtonsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {onView && (
        <IconButton
          icon={<Eye className="w-3.5 h-3.5" />}
          label={viewTooltip}
          onClick={onView}
        />
      )}
      {onEdit && (
        <IconButton
          icon={<Edit className="w-3.5 h-3.5" />}
          label={editTooltip}
          onClick={onEdit}
        />
      )}
      {onDelete && (
        <IconButton
          icon={<Trash className="w-3.5 h-3.5" />}
          label={deleteTooltip}
          onClick={onDelete}
          variant="destructive"
          disabled={isDeleting}
        />
      )}
    </div>
  );
}

export interface ExportButtonProps {
  onExport: () => void;
  isExporting?: boolean;
  variant?: "csv" | "excel";
  label?: string;
}

export function ExportButton({
  onExport,
  isExporting = false,
  variant = "excel",
  label,
}: ExportButtonProps) {
  const Icon = variant === "excel" ? FileSpreadsheet : Download;
  const defaultLabel = variant === "excel" ? "Export Excel" : "Export CSV";

  return (
    <CustomButton
      type="button"
      variant="outline"
      size="sm"
      onClick={onExport}
      isLoading={isExporting}
      icon={<Icon className="h-4 w-4 text-emerald-600" />}
      className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 font-semibold"
    >
      {label || defaultLabel}
    </CustomButton>
  );
}

export interface DownloadTemplateButtonProps {
  onDownload?: () => void;
  isDownloading?: boolean;
  label?: string;
}

export function DownloadTemplateButton({
  onDownload,
  isDownloading = false,
  label = "Download Template",
}: DownloadTemplateButtonProps) {
  return (
    <CustomButton
      type="button"
      variant="outline"
      size="sm"
      onClick={onDownload}
      isLoading={isDownloading}
      icon={<Download className="h-4 w-4 text-primary" />}
      className="font-semibold"
    >
      {label}
    </CustomButton>
  );
}

export interface ImportSpreadsheetButtonProps {
  onImport?: (file: File) => void;
  isImporting?: boolean;
  label?: string;
}

export function ImportSpreadsheetButton({
  isImporting = false,
  label = "Import Excel",
}: ImportSpreadsheetButtonProps) {
  return (
    <CustomButton
      type="button"
      variant="outline"
      size="sm"
      isLoading={isImporting}
      icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
      className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 font-semibold"
    >
      {label}
    </CustomButton>
  );
}

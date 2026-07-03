"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X, Download, FileSpreadsheet } from "lucide-react";
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
  variant?: ButtonProps["variant"] | "unstyled";
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
  // We pass children directly to avoid breaking Slot with conditional icons or text wrappers.
  if (props.asChild) {
    return (
      <Button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={cn(className)}
        disabled={isLoading || disabled}
        variant={variant as any}
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
      variant={variant as any}
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
  isCreate?: boolean;
  createText?: string;
  updateText?: string;
  submittingCreateText?: string;
  submittingUpdateText?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
}

export function SubmitButton({
  isSubmitting,
  isDirty = true,
  isCreate = false,
  createText = "Create",
  updateText = "Update",
  submittingCreateText = "Creating...",
  submittingUpdateText = "Updating...",
  disabled = false,
  onClick,
  className,
  variant = "default",
  size = "default",
  icon,
}: SubmitButtonProps) {
  const isDisabled = isSubmitting || disabled || (!isDirty && !isCreate);

  const getButtonText = () => {
    if (isSubmitting) {
      return isCreate ? submittingCreateText : submittingUpdateText;
    }
    return isCreate ? createText : updateText;
  };

  return (
    <CustomButton
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={isDisabled}
      variant={variant}
      size={size}
      isLoading={isSubmitting}
      icon={icon}
      className={cn("min-w-[120px] transition-all", className)}
    >
      {getButtonText()}
    </CustomButton>
  );
}

export interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function CancelButton({
  onClick,
  disabled = false,
  text = "Cancel",
  className,
  variant = "outline",
  size = "default",
  showIcon = false,
}: CancelButtonProps) {
  return (
    <CustomButton
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("transition-all", className)}
      icon={showIcon ? <X className="h-4 w-4" /> : undefined}
    >
      {text}
    </CustomButton>
  );
}

export interface ActionButtonProps extends Omit<CustomButtonProps, "onClick"> {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton = ({
  icon,
  tooltip,
  onClick,
  variant = "outline",
  size = "sm",
  disabled = false,
  loading = false,
  className = "",
  ...rest
}: ActionButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <CustomButton
          variant={variant}
          size={size}
          disabled={disabled}
          isLoading={loading}
          icon={icon}
          className={cn(
            "h-6 w-auto min-w-6 px-1.5 py-0 gap-1",
            variant === "outline" &&
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
            variant === "secondary" &&
              "bg-primary/10 border-primary text-primary hover:bg-primary/20",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          {...rest}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ConditionalActionButton = ({
  icon,
  tooltip,
  onClick,
  variant = "outline",
  size = "sm",
  disabled = false,
  loading = false,
  className = "",
  ...rest
}: ActionButtonProps & { tooltip?: string }) => {
  const buttonElement = (
    <CustomButton
      variant={variant}
      size={size}
      disabled={disabled}
      isLoading={loading}
      icon={icon}
      className={cn(
        variant === "outline" &&
          "hover:bg-primary/10 hover:border-primary hover:text-primary",
        variant === "secondary" &&
          "bg-primary/10 border-primary text-primary hover:bg-primary/20",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      {...rest}
    />
  );

  if (!tooltip) {
    return buttonElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export interface DownloadTemplateButtonProps {
  onDownload: () => void | Promise<void>;
  className?: string;
  children?: React.ReactNode;
}

export function DownloadTemplateButton({
  onDownload,
  className,
  children,
}: DownloadTemplateButtonProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Visual feedback delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onDownload();
    } catch (err) {
      console.error("Failed to download template:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <CustomButton
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      isLoading={isDownloading}
      icon={!isDownloading ? <Download className="w-3.5 h-3.5" /> : undefined}
      className={cn(
        "gap-1.5 h-[28px] text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 min-w-[95px]",
        className
      )}
      title="Download Excel template"
    >
      {isDownloading ? "Downloading..." : (children || "Template")}
    </CustomButton>
  );
}

export interface ImportSpreadsheetButtonProps {
  onClick: () => void;
  className?: string;
  title?: string;
  label?: string;
}

export function ImportSpreadsheetButton({
  onClick,
  className,
  title = "Import from Excel",
  label = "Import",
}: ImportSpreadsheetButtonProps) {
  return (
    <CustomButton
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
      className={cn(
        "gap-1.5 h-[28px] text-xs border-pink-500/30 text-pink-600 dark:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500 min-w-[75px]",
        className
      )}
      title={title}
    >
      {label}
    </CustomButton>
  );
}

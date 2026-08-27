"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { Controller, FieldValues } from "react-hook-form";
import { PasswordFieldProps } from ".";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "••••••••",
  onTogglePassword,
  showPassword = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
}: PasswordFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <Label htmlFor={name} className={cn("text-xs font-semibold text-foreground flex items-center min-h-[16px]", labelClassName)}>
          <span>{label}</span>
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <div className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ""}
              id={name}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="new-password"
              className={cn(
                "pr-8",
                error && "border-destructive focus:border-destructive focus:ring-destructive/30",
                inputClassName
              )}
            />
          )}
        />
        {onTogglePassword && (
          <CustomButton
            variant="unstyled"
            size="unstyled"
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </CustomButton>
        )}
      </div>
      {error?.message && (
        <p className="text-xs text-destructive font-medium mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

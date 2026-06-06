"use client";

import { Controller, FieldValues } from "react-hook-form";
import { PasswordFormFieldProps } from "./form-field-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}: PasswordFormFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className="text-xs font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
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
              className={`h-[26px] pr-8 transition-all duration-200 ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "focus:bg-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/30"
              }`}
            />
          )}
        />
        {onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 text-gray-500" />
            ) : (
              <Eye className="h-3 w-3 text-gray-500" />
            )}
          </button>
        )}
      </div>
      <p className={`text-xs text-red-600 ${error?.message ? "min-h-[16px]" : ""}`}>{error?.message || ""}</p>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { CustomButton, CustomButtonProps } from "@/components/shared/button/custom-button";

export interface FileInputButtonProps extends Omit<CustomButtonProps, "onChange"> {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  id?: string;
  children: React.ReactNode;
}

export function FileInputButton({
  onChange,
  accept = "image/*",
  multiple = false,
  disabled = false,
  id,
  children,
  ...buttonProps
}: FileInputButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id={id}
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      <CustomButton
        type="button"
        disabled={disabled}
        onClick={handleClick}
        {...buttonProps}
      >
        {children}
      </CustomButton>
    </>
  );
}

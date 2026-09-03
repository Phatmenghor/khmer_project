"use client";

import Image from "next/image";
import { CustomButton } from "@/components/shared/button/custom-button";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GoogleLoginButton({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  children,
}: GoogleLoginButtonProps) {
  return (
    <CustomButton
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full h-9 text-xs font-semibold rounded-xl gap-2 hover:border-primary/50 cursor-pointer shadow-2xs ${className}`}
    >
      <Image
        src={appImages.google}
        alt="Google Icon"
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
      {children || "Google"}
    </CustomButton>
  );
}

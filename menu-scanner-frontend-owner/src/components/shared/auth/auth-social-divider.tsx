"use client";

import React from "react";
import { GoogleLoginButton } from "@/components/shared/google/google-login-button";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";

interface AuthSocialGridProps {
  onGoogleAuth: () => void;
  onTelegramAuth: (data: TelegramAuthData) => void;
  disabled?: boolean;
  isTelegramLoading?: boolean;
}

export function AuthSocialGrid({
  onGoogleAuth,
  onTelegramAuth,
  disabled = false,
  isTelegramLoading = false,
}: AuthSocialGridProps) {
  return (
    <div className="space-y-3">
      {/* Clean Line Divider */}
      <div className="relative py-1.5 text-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative inline-block px-3 text-[10px] font-extrabold text-muted-foreground/80 uppercase tracking-widest">
          or continue with
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <GoogleLoginButton onClick={onGoogleAuth} disabled={disabled} />

        <TelegramLoginButton
          botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
          botId={SocialAuthConfig.TELEGRAM_BOT_ID}
          onAuth={onTelegramAuth}
          disabled={disabled}
          loading={isTelegramLoading}
          className="w-full h-9 text-xs font-semibold rounded-xl shadow-2xs"
        />
      </div>
    </div>
  );
}

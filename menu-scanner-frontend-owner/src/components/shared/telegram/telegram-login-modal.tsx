"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Loader2 } from "lucide-react";
import { TelegramIcon, TelegramLoginButton } from "./telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";

interface TelegramLoginModalProps {
  onAuth: (data: TelegramAuthData) => Promise<void>;
  buttonLabel?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}


export function TelegramLoginModal({
  onAuth,
  buttonLabel = "Continue with Telegram",
  description,
  className = "",
  disabled = false,
  loading = false,
}: TelegramLoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuth = async (data: TelegramAuthData) => {
    setIsAuthLoading(true);
    try {
      await onAuth(data);
      setIsOpen(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <>
      {}
      <CustomButton
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled || loading}
        isLoading={loading}
        className={`inline-flex items-center justify-center gap-1 ${className}`}
        icon={!loading ? <TelegramIcon className="h-3 w-3 text-[#0088cc]" /> : undefined}
      >
        {loading ? "Connecting..." : buttonLabel}
      </CustomButton>

      {}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-[#0088cc] flex items-center justify-center">
                <TelegramIcon className="h-3 w-3 text-white" />
              </div>
              Sign in with Telegram
            </DialogTitle>
            <DialogDescription>
              {description ??
                "Click the button below to open Telegram. If you don't have an account yet, one will be created automatically."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-1">
            {isAuthLoading ? (
              <div className="flex flex-col items-center gap-1 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#0088cc]" />
                <p className="text-xs text-muted-foreground">
                  Authenticating with Telegram...
                </p>
              </div>
            ) : (
              <>
                <TelegramLoginButton
                  botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                  botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                  onAuth={handleAuth}
                  disabled={isAuthLoading}
                  className="w-full h-[32px] text-xs"
                >
                  Open Telegram to Authorize
                </TelegramLoginButton>

                <p className="text-xs text-center text-muted-foreground px-3">
                  A Telegram popup will open. Approve the login request — your
                  account will be created or signed in automatically.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

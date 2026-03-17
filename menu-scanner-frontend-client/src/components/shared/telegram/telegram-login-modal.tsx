"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TelegramIcon, TelegramLoginButton } from "./telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";

interface TelegramLoginModalProps {
  /** Called with the Telegram auth data after user approves in Telegram */
  onAuth: (data: TelegramAuthData) => Promise<void>;
  /** Button label shown to open the modal */
  buttonLabel?: string;
  /** Button class for the trigger */
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * TelegramLoginModal
 *
 * Shows a styled trigger button. On click, opens a Dialog explaining the
 * Telegram login flow and embeds the custom TelegramLoginButton (popup).
 *
 * The backend auto-detects login vs register — no separate flows needed.
 */
export function TelegramLoginModal({
  onAuth,
  buttonLabel = "Continue with Telegram",
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
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TelegramIcon className="h-4 w-4 text-[#0088cc]" />
        )}
        {loading ? "Connecting..." : buttonLabel}
      </Button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center">
                <TelegramIcon className="h-4 w-4 text-white" />
              </div>
              Sign in with Telegram
            </DialogTitle>
            <DialogDescription>
              Click the button below to open Telegram. If you don&apos;t have an
              account yet, one will be created automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {isAuthLoading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#0088cc]" />
                <p className="text-sm text-muted-foreground">
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
                  className="w-full h-11"
                >
                  Open Telegram to Authorize
                </TelegramLoginButton>

                <p className="text-xs text-center text-muted-foreground px-4">
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

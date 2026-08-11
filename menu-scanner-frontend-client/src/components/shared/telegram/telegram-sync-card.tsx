"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Unlink, Link2, CheckCircle2 } from "lucide-react";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { TelegramIcon, TelegramLoginButton } from "./telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getSocialSyncService,
  syncTelegramAccountService,
  unsyncSocialAccountService,
} from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { formatDistanceToNow } from "date-fns";
import { getAdminUserInfo, getUserInfo } from "@/utils/local-storage/userInfo";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";

function getUserTypeFromStorage(): string {
  return (
    getAdminUserInfo()?.userType ||
    getUserInfo()?.userType ||
    "CUSTOMER"
  );
}

export function TelegramSyncCard() {
  const dispatch = useAppDispatch();
  const socialSync = useAppSelector((state) => state.auth.socialSync);
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const isLoadingSocialSync = useAppSelector((state) => state.auth.isLoadingSocialSync);
  const userType = getUserTypeFromStorage();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (socialSync === null && !isLoadingSocialSync) {
      dispatch(getSocialSyncService());
    }
  }, [dispatch, socialSync, isLoadingSocialSync]);

  const isTelegramConnected =
    socialSync?.telegramId !== null && socialSync?.telegramId !== undefined;

  const handleTelegramSync = async (telegramData: TelegramAuthData) => {
    setIsConnecting(true);
    try {
      await dispatch(syncTelegramAccountService({ telegramData, userType })).unwrap();
      showToast.success(Messages.auth.telegramConnected);
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || "Failed to connect Telegram account.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTelegramUnsync = async () => {
    try {
      await dispatch(unsyncSocialAccountService("TELEGRAM")).unwrap();
      showToast.success(Messages.auth.telegramDisconnected);
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || "Failed to disconnect Telegram account.");
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const displayName = [socialSync?.telegramFirstName, socialSync?.telegramLastName]
    .filter(Boolean)
    .join(" ");

  if (isLoadingSocialSync) {
    return (
      <Card className="border-border/80 overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between p-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/80 overflow-hidden shadow-2xs">
        {/* ── Fixed Header Bar ── */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-border/80 bg-background/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0088cc] flex items-center justify-center shadow-xs shrink-0">
              <TelegramIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-foreground">Telegram Integration</h4>
                {isTelegramConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-muted-foreground bg-muted border border-border/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTelegramConnected
                  ? "Your Telegram account is active and synced for quick login and alerts"
                  : "Connect Telegram for instant order alerts and 1-tap quick sign-in"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTelegramConnected ? (
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isSocialLoading}
                isLoading={isSocialLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 font-bold text-xs h-8 px-3 gap-1.5 rounded-xl"
              >
                <Unlink className="h-3.5 w-3.5" />
                Disconnect
              </CustomButton>
            ) : (
              <TelegramLoginButton
                botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                onAuth={handleTelegramSync}
                disabled={isSocialLoading}
                loading={isConnecting}
                className="h-8 text-xs px-3.5 font-bold rounded-xl"
              >
                Connect Telegram
              </TelegramLoginButton>
            )}
          </div>
        </div>

        {/* ── Content Body ── */}
        <CardContent className="p-4 px-5 bg-card/30">
          {isTelegramConnected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-muted/20 border border-border/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {socialSync?.telegramPhotoUrl ? (
                    <CustomAvatar
                      imageUrl={socialSync.telegramPhotoUrl}
                      name={displayName || socialSync.telegramUsername || "Telegram User"}
                      size="lg"
                      className="w-10 h-10 rounded-xl ring-2 ring-[#0088cc]/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center border border-[#0088cc]/20">
                      <TelegramIcon className="h-5 w-5 text-[#0088cc]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-foreground text-xs leading-tight">
                      {displayName || `@${socialSync?.telegramUsername}`}
                    </p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  {socialSync?.telegramUsername && (
                    <p className="text-xs font-bold text-[#0088cc] mt-0.5">
                      @{socialSync.telegramUsername}
                    </p>
                  )}
                </div>
              </div>

              {socialSync?.syncedAt && (
                <div className="px-2.5 py-1 rounded-lg bg-background border border-border/60 text-[11px] font-semibold text-muted-foreground shrink-0">
                  Synced {formatDistanceToNow(new Date(socialSync.syncedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Linking your Telegram account enables 1-tap fast sign-in and real-time security & system notifications directly on Telegram.
            </p>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onDelete={handleTelegramUnsync}
        title="Disconnect Telegram"
        description="Are you sure you want to disconnect your Telegram account? You will no longer receive instant Telegram alerts or be able to sign in via Telegram."
        itemName={
          socialSync?.telegramUsername
            ? `@${socialSync.telegramUsername}`
            : displayName || "Telegram Account"
        }
        isSubmitting={isSocialLoading}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Unlink, Link2 } from "lucide-react";
import { TelegramIcon, TelegramLoginButton } from "./telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getSocialSyncService,
  syncTelegramAccountService,
  unsyncSocialAccountService,
} from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";

export function TelegramSyncCard() {
  const dispatch = useAppDispatch();
  const socialSync = useAppSelector((state) => state.auth.socialSync);
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const isLoadingSocialSync = useAppSelector((state) => state.auth.isLoadingSocialSync);

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
      await dispatch(syncTelegramAccountService({ telegramData, userType: "PLATFORM_USER" })).unwrap();
      showToast.success("Telegram account connected successfully");
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || "Failed to connect Telegram account.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTelegramUnsync = async () => {
    try {
      await dispatch(unsyncSocialAccountService("TELEGRAM")).unwrap();
      showToast.success("Telegram account disconnected successfully");
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
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        </div>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0088cc] flex items-center justify-center shadow-sm">
              <TelegramIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">Telegram</span>
          </div>
          <div className="flex items-center gap-2">
            {isTelegramConnected ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={isSocialLoading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 h-7 text-xs px-2.5"
                >
                  {isSocialLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Unlink className="h-3 w-3 mr-1" />
                  )}
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 border px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  Not Connected
                </span>
                <TelegramLoginButton
                  botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                  botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                  onAuth={handleTelegramSync}
                  disabled={isSocialLoading}
                  loading={isConnecting}
                  className="h-7 text-xs px-2.5"
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  Connect
                </TelegramLoginButton>
              </>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {isTelegramConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  {displayName && (
                    <p className="font-semibold text-foreground text-base leading-tight truncate">
                      {displayName}
                    </p>
                  )}
                  {socialSync?.telegramUsername && (
                    <p className="text-sm font-medium text-[#0088cc] mt-0.5">
                      @{socialSync.telegramUsername}
                    </p>
                  )}
                </div>
                {socialSync?.syncedAt && (
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    Synced{" "}
                    {formatDistanceToNow(new Date(socialSync.syncedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect your Telegram account to enable quick login and stay synced across devices.
            </p>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onDelete={handleTelegramUnsync}
        title="Disconnect Telegram"
        description="Are you sure you want to disconnect your Telegram account? You will no longer be able to use Telegram to sign in."
        itemName={
          socialSync?.telegramUsername
            ? `@${socialSync.telegramUsername}`
            : undefined
        }
        isSubmitting={isSocialLoading}
      />
    </>
  );
}

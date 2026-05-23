"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Link2, Unlink, Check, Hash } from "lucide-react";
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
      console.log("[TelegramSyncCard] Fetching social sync status on mount");
      dispatch(getSocialSyncService());
    }
  }, [dispatch, socialSync, isLoadingSocialSync]);

  const isTelegramConnected =
    socialSync?.telegramId !== null && socialSync?.telegramId !== undefined;

  const handleTelegramSync = async (telegramData: TelegramAuthData) => {
    setIsConnecting(true);
    console.log("[TelegramSyncCard] Syncing Telegram account:", telegramData.id);
    try {
      const result = await dispatch(
        syncTelegramAccountService({ telegramData, userType })
      ).unwrap();
      console.log("[TelegramSyncCard] Sync successful:", result);
      showToast.success(Messages.auth.telegramConnected);
    } catch (err: unknown) {
      console.error("[TelegramSyncCard] Sync failed:", err);
      showToast.error((err as { message?: string })?.message || "Failed to connect Telegram account.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTelegramUnsync = async () => {
    console.log("[TelegramSyncCard] Unsyncing Telegram account");
    try {
      await dispatch(unsyncSocialAccountService("TELEGRAM")).unwrap();
      console.log("[TelegramSyncCard] Unsync successful");
      showToast.success(Messages.auth.telegramDisconnected);
    } catch (err: unknown) {
      console.error("[TelegramSyncCard] Unsync failed:", err);
      showToast.error((err as { message?: string })?.message || "Failed to disconnect Telegram account.");
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  if (isLoadingSocialSync) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {isTelegramConnected && socialSync?.telegramPhotoUrl ? (
                  <CustomAvatar
                    imageUrl={socialSync.telegramPhotoUrl}
                    name={socialSync.telegramFirstName || socialSync.telegramUsername || "T"}
                    size="md"
                    className="w-12 h-12"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isTelegramConnected ? "bg-[#0088cc]" : "bg-gray-200"
                    }`}
                  >
                    <TelegramIcon
                      className={`h-6 w-6 ${
                        isTelegramConnected ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                )}
                {isTelegramConnected && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0088cc] rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">Telegram</h3>
                {isTelegramConnected ? (
                  <div className="mt-1 space-y-0.5">
                    {(socialSync?.telegramFirstName || socialSync?.telegramLastName) && (
                      <p className="text-sm font-medium text-foreground truncate">
                        {[socialSync.telegramFirstName, socialSync.telegramLastName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                    {socialSync?.telegramUsername && (
                      <p className="text-sm text-muted-foreground">
                        @{socialSync.telegramUsername}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <span>Chat ID: {socialSync?.telegramId}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your Telegram account for quick login
                  </p>
                )}
                {socialSync?.syncedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Synced{" "}
                    {formatDistanceToNow(new Date(socialSync.syncedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>

            {isTelegramConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isSocialLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            ) : (
              <TelegramLoginButton
                botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                onAuth={handleTelegramSync}
                disabled={isSocialLoading}
                loading={isConnecting}
                className="h-9 text-sm"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </TelegramLoginButton>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Telegram Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Telegram account
              {socialSync?.telegramUsername ? ` (@${socialSync.telegramUsername})` : ""}?
              You will no longer be able to use Telegram to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isSocialLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTelegramUnsync}
              disabled={isSocialLoading}
            >
              {isSocialLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

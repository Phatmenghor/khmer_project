"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { ROUTES } from "@/constants/app-routes/routes";
import { useIsMobile } from "@/redux/store/use-mobile";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    clearAllTokens();
    clearUserInfo();

    setShowLogoutAlert(false);

    setTimeout(() => {
      router.replace(ROUTES.AUTH.LOGIN);
    }, 100);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-3 sm:px-4">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-3 w-3" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        <div className="flex items-center gap-2 justify-end flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
            className="flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
        </div>
      </header>
      <Dialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <DialogContent className="w-full sm:max-w-lg max-h-[92dvh] p-0 gap-0 flex flex-col">
          <FormHeader
            title="Sign Out"
            description="End your current session"
            isCreate={false}
          />

          <FormBody className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded">
                <p className="text-xs text-red-900 dark:text-red-100 font-medium leading-relaxed">
                  Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard and saved data.
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded">
                <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                  <span className="font-semibold">⚠️ Important:</span> This action will end your current session and you'll be redirected to the login page. Make sure you've saved any ongoing work before proceeding.
                </p>
              </div>
            </div>
          </FormBody>

          <div className="flex justify-between items-center p-4 border-t bg-muted/30 flex-shrink-0">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutAlert(false)}
                className="rounded"
              >
                Stay Signed In
              </Button>
              <Button
                onClick={handleLogout}
                className="rounded bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-1"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

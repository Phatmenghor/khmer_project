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
import { FormBody } from "@/components/shared/form-field/form-body";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
      <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b bg-background px-4 sm:px-6">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        <div className="flex items-center gap-3 justify-end flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
            className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
        </div>
      </header>
      <Dialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <DialogContent className="w-full sm:max-w-md rounded-2xl p-0 gap-0 flex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shrink-0">
                <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold">Sign Out</DialogTitle>
                <DialogDescription className="text-sm">
                  Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard and saved data.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <FormBody className="flex-1" contentClassName="py-4">
            <div className="text-sm text-muted-foreground leading-relaxed">
              This action will end your current session and you'll be redirected to the login page.
            </div>
          </FormBody>

          <div className="flex justify-end gap-2 p-6 border-t bg-muted/30 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutAlert(false)}
              className="rounded-lg w-full sm:w-auto"
            >
              Stay Signed In
            </Button>
            <Button
              onClick={handleLogout}
              className="rounded-lg w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

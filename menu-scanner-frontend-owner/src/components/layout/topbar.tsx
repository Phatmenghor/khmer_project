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
      <header className="sticky top-0 z-20 flex h-10 items-center gap-3 border-b bg-background px-3 sm:px-4">
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
            className="flex items-center gap-1.5 h-7 px-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
        </div>
      </header>
      <Dialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <DialogContent className="w-full sm:max-w-sm p-0 gap-0 flex flex-col">
          <FormHeader
            title="Sign Out"
            description="End your current session"
            icon={LogOut}
            variant="destructive"
          />

          <FormBody>
            <p className="text-xs text-foreground leading-relaxed">
              Are you sure you want to sign out? You'll need to sign in again
              to access your dashboard.
            </p>
            <div className="px-2.5 py-2 bg-muted/60 rounded border border-border">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Tip
              </p>
              <p className="text-xs text-foreground mt-0.5">
                Save any ongoing work before continuing.
              </p>
            </div>
          </FormBody>

          <div className="flex flex-col gap-1.5 px-2.5 py-2 border-t bg-muted/30 flex-shrink-0 sm:flex-row sm:items-center sm:justify-end sm:px-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutAlert(false)}
              >
                Stay Signed In
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
                className="gap-1"
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

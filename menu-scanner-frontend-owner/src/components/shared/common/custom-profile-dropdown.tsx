"use client";

import React, { useState } from "react";
import { LogOut, ChevronDown, User, KeyRound, LayoutDashboard } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { SignoutModal } from "@/components/shared/modal/signout-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { getProfileImageUrl, getUserInitials } from "@/utils/user/user-helper";

interface CustomProfileDropdownProps {
  className?: string;
}

export function CustomProfileDropdown({ className }: CustomProfileDropdownProps) {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, fullName } = useAuthState();
  const { logout: handleLogout } = useLogout();

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutAlert(false);
    await handleLogout();
    setIsLoggingOut(false);
  };

  const displayEmail = profile?.email || "";
  const userIdentifier = (profile as any)?.userIdentifier || (profile as any)?.employeeId || displayEmail || "User";
  const hasFullName = Boolean(fullName && fullName.trim() !== "" && fullName !== userIdentifier);
  const displayName = hasFullName ? fullName : userIdentifier;

  const rawPlanName = (profile as any)?.planName || (profile as any)?.subscriptionPlan || (profile as any)?.business?.planName;
  const planLabel = rawPlanName ? `Plan: ${rawPlanName}` : "Free Account";

  const profileImageUrl = getProfileImageUrl(profile, "sm");

  const handleStoreDashboardClick = () => {
    showToast.info("eMenu Client Portal is coming soon! Dashboard link will open upon deployment.");
  };

  const handleMyProfileClick = () => {
    showToast.info(`Logged in as ${displayName} (${userIdentifier}). Account is active.`);
  };

  const handleChangePasswordClick = () => {
    showToast.info("Security settings are active for your account.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className={className}>
          <CustomButton
            variant="unstyled"
            size="unstyled"
            className="flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 hover:bg-accent/70 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group cursor-pointer border border-transparent hover:border-border/60"
          >
            {/* User Avatar */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {profileImageUrl ? (
                <SmartImage src={profileImageUrl} alt={displayName} fill className="object-cover" />
              ) : (
                <span className="text-sm font-black text-primary">
                  {getUserInitials(displayName)}
                </span>
              )}
            </div>

            {/* Display Name & Plain Text Plan Status underneath */}
            <div className="flex flex-col items-start leading-tight text-left hidden sm:flex">
              <span className="text-xs font-black text-foreground truncate max-w-[160px] group-hover:text-primary transition-colors tracking-tight">
                {displayName}
              </span>
              <span className="text-[10px] font-bold text-primary/90 truncate max-w-[160px]">
                {hasFullName ? `${userIdentifier} • ${planLabel}` : planLabel}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </CustomButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 p-2 rounded-[20px] shadow-2xl border border-border/80 bg-background/95 backdrop-blur-2xl animate-in fade-in-80 zoom-in-95"
          sideOffset={8}
        >
          {/* Header Card Info - Modern Plain Typography */}
          <DropdownMenuLabel className="font-normal p-3 rounded-[14px] bg-muted/40 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                {profileImageUrl ? (
                  <SmartImage src={profileImageUrl} alt={displayName} fill className="object-cover" />
                ) : (
                  <span className="text-base font-black text-primary">
                    {getUserInitials(displayName)}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                <span className="font-black text-xs tracking-tight truncate text-foreground">{displayName}</span>

                {hasFullName && (
                  <div className="text-[11px] font-mono font-medium text-muted-foreground truncate">
                    {userIdentifier.includes("@") ? userIdentifier : `ID: ${userIdentifier}`}
                  </div>
                )}

                {/* Clean Plain Text Plan Status (No Icon) */}
                <div className="pt-1 flex items-center">
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 tracking-wide">
                    {planLabel}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1.5 bg-border/60" />

          {/* Menu Options - Public Business Client Portal Only */}
          <DropdownMenuItem
            onClick={handleStoreDashboardClick}
            className="py-2.5 px-3 rounded-xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors text-xs font-bold flex items-center gap-2.5 text-foreground"
          >
            <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
            Store Dashboard (eMenu Client)
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleMyProfileClick}
            className="py-2.5 px-3 rounded-xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors text-xs font-bold flex items-center gap-2.5 text-foreground"
          >
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            My Business Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleChangePasswordClick}
            className="py-2.5 px-3 rounded-xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors text-xs font-bold flex items-center gap-2.5 text-foreground"
          >
            <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
            Security Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5 bg-border/60" />

          {/* Sign Out Action */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-bold py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-colors"
            onSelect={() => setShowLogoutAlert(true)}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignoutModal
        open={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}

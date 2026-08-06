"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, ChevronDown, User, KeyRound, CreditCard } from "lucide-react";
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
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { SignoutModal } from "@/components/shared/common/signout-modal";

interface CustomProfileDropdownProps {
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CustomProfileDropdown({ className }: CustomProfileDropdownProps) {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, fullName, profileImage, roles } = useAuthState();
  const { logout: handleLogout } = useLogout();

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutAlert(false);
    await handleLogout();
    setIsLoggingOut(false);
  };

  const displayName = fullName || profile?.fullName || "Admin";
  const displayEmail = profile?.email || "";
  const profileImageUrl = typeof profileImage === "string"
    ? profileImage
    : (profileImage?.sm ?? profile?.profileImage?.sm ?? "");
  const primaryRole = roles?.[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className={className}>
          <CustomButton
            variant="unstyled"
            size="unstyled"
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-accent/80 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            {/* User Avatar */}
            <div className="relative w-[38px] h-[38px] rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
              {profileImageUrl ? (
                <SmartImage src={profileImageUrl} alt={displayName} fill className="object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {getInitials(displayName)}
                </span>
              )}
            </div>

            {/* Name & Role Text */}
            <div className="flex flex-col items-start leading-none text-left hidden sm:flex">
              <span className="text-sm font-bold text-foreground truncate max-w-[140px] group-hover:text-primary transition-colors">
                {displayName}
              </span>
              {primaryRole && (
                <span className="text-xs text-muted-foreground capitalize mt-0.5 font-medium">
                  {primaryRole.toLowerCase().replace(/_/g, " ")}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </CustomButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 p-1.5" sideOffset={8}>
          <DropdownMenuLabel className="font-normal px-2.5 py-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm truncate text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate font-medium">
                {displayEmail}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem asChild className="py-2 px-2.5 rounded-lg">
            <Link href={ROUTES.ADMIN.PROFILE} className="cursor-pointer text-[13px] font-medium">
              <User className="h-4 w-4 mr-2.5 text-muted-foreground" />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="py-2 px-2.5 rounded-lg">
            <Link
              href={`${ROUTES.ADMIN.PROFILE}?tab=security`}
              className="cursor-pointer text-[13px] font-medium"
            >
              <KeyRound className="h-4 w-4 mr-2.5 text-muted-foreground" />
              Change Password
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="py-2 px-2.5 rounded-lg">
            <Link href="/admin/plan" className="cursor-pointer text-[13px] font-medium">
              <CreditCard className="h-4 w-4 mr-2.5 text-muted-foreground" />
              My Plan
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-[13px] font-bold py-2 px-2.5 rounded-lg"
            onSelect={() => setShowLogoutAlert(true)}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
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

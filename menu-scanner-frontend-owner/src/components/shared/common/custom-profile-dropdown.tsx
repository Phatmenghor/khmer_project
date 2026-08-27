"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User, KeyRound } from "lucide-react";
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
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { SignoutModal } from "@/components/shared/modal/signout-modal";

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
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, fullName, profileImage } = useAuthState();

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    clearAllTokens();
    clearUserInfo();
    setShowLogoutAlert(false);
    setTimeout(() => {
      setIsLoggingOut(false);
      router.replace(ROUTES.AUTH.LOGIN);
    }, 100);
  };

  const displayName = fullName || profile?.fullName || "Owner Admin";
  const displayEmail = profile?.email || "";
  const profileImageUrl = typeof profileImage === "string"
    ? profileImage
    : ((profileImage as any)?.sm ?? (profile?.profileImage as any)?.sm ?? profile?.profileImageUrl ?? "");

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

            {/* Clean Name & Email */}
            <div className="flex flex-col items-start leading-tight text-left hidden sm:flex">
              <span className="text-xs font-bold text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">
                {displayName}
              </span>
              {displayEmail && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[150px] mt-0.5">
                  {displayEmail}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </CustomButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-1.5" sideOffset={8}>
          <DropdownMenuLabel className="font-normal px-2.5 py-2">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm truncate text-foreground">{displayName}</span>
              {displayEmail && (
                <span className="text-xs text-muted-foreground truncate font-medium">
                  {displayEmail}
                </span>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem asChild className="py-2 px-2.5 rounded-lg">
            <Link href={ROUTES.DASHBOARD.PROFILE} className="cursor-pointer text-[13px] font-medium">
              <User className="h-4 w-4 mr-2.5 text-muted-foreground" />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="py-2 px-2.5 rounded-lg">
            <Link
              href={`${ROUTES.DASHBOARD.PROFILE}?tab=security`}
              className="cursor-pointer text-[13px] font-medium"
            >
              <KeyRound className="h-4 w-4 mr-2.5 text-muted-foreground" />
              Change Password
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

"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, MapPin, ShoppingBag } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomDropdownMenu } from "../shared/common/custom-dropdown-menu";
import { SignoutModal } from "@/components/shared/modal/signout-modal";
import { getActiveTableSession } from "@/utils/table/table-session";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { getProfileImageUrl } from "@/utils/user/user-helper";

interface NavbarAuthProps {
  isAuthenticated: boolean;
  fullName: string | null;
  email: string | null;
  profileImage?: ImageUrls;
  profile?: {
    profileImage?: ImageUrls;
    fullName?: string;
    email?: string;
  } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  openOnHover: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

function NavbarAuthComponent({
  isAuthenticated,
  fullName,
  email,
  profileImage,
  profile,
  onLoginClick,
  onLogout,
  openOnHover,
}: NavbarAuthProps) {
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const activeTable = getActiveTableSession();

  if (!isAuthenticated) {
    return (
      <CustomButton
        variant="ghost"
        size="icon"
        className="h-6 w-6 lg:hover:bg-primary/10 lg:hover:text-primary transition-colors"
        onClick={onLoginClick}
      >
        <User className="h-3 w-3" />
      </CustomButton>
    );
  }

  const mainItems = [
    {
      label: "My Profile",
      icon: <User className="h-3 w-3" />,
      onClick: () => router.push("/profile"),
    },
    {
      label: "My Orders",
      icon: <ShoppingBag className="h-3 w-3" />,
      onClick: () => router.push("/orders"),
    },
  ];

  // Hide Location link when checked into a table
  if (!activeTable) {
    mainItems.push({
      label: "Location",
      icon: <MapPin className="h-3 w-3" />,
      onClick: () => router.push("/location"),
    });
  }

  const dropdownSections = [
    {
      items: mainItems,
    },
    {
      items: [
        {
          label: "Sign Out",
          icon: <LogOut className="h-3 w-3" />,
          onClick: () => setShowLogoutAlert(true),
          variant: "destructive" as const,
        },
      ],
    },
  ];

  const displayName = fullName || profile?.fullName || "User";
  const greeting = getGreeting();

  const dropdownHeader = (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center gap-2">
        <CustomAvatar
          imageUrl={getProfileImageUrl({ profileImage, profile } as any, "sm")}
          name={displayName}
          size="lg"
        />
        <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-primary">
            ☀️ {greeting}!
          </span>
          <p className="text-xs font-semibold line-clamp-1 text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {email || profile?.email || ""}
          </p>
        </div>
      </div>

      {activeTable && (
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs">
          <span className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center text-[10px] shrink-0">🪑</span>
          <span className="truncate">{activeTable.tableName} Active</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <CustomDropdownMenu
        trigger={
          <div className="flex items-center gap-2 cursor-pointer rounded-xl px-1.5 py-1 hover:bg-accent/80 transition-colors">
            <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
              <CustomAvatar
                imageUrl={getProfileImageUrl({ profileImage, profile } as any, "sm")}
                name={displayName}
                size="md"
              />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight text-left">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">
                {greeting},
              </span>
              <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {displayName}
              </span>
            </div>
          </div>
        }
        header={dropdownHeader}
        sections={dropdownSections}
        align="right"
        openOnHover={openOnHover}
        hoverDelay={200}
      />

      <SignoutModal
        open={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        onConfirm={() => {
          setShowLogoutAlert(false);
          onLogout();
        }}
      />
    </>
  );
}

export const NavbarAuth = memo(NavbarAuthComponent);

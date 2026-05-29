"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomDropdownMenu } from "../shared/common/custom-dropdown-menu";

interface NavbarAuthProps {
  isAuthenticated: boolean;
  fullName: string | null;
  email: string | null;
  profileImage: string | null;
  profile?: {
    profileImageUrl?: string;
    fullName?: string;
    email?: string;
  } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  openOnHover: boolean;
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

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hover:bg-primary/10 lg:hover:text-primary transition-colors"
        onClick={onLoginClick}
      >
        <User className="h-5 w-5" />
      </Button>
    );
  }

  const dropdownSections = [
    {
      items: [
        {
          label: "My Profile",
          icon: <User className="h-4 w-4" />,
          onClick: () => router.push("/profile"),
        },
      ],
    },
    {
      items: [
        {
          label: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          onClick: onLogout,
          variant: "destructive" as const,
        },
      ],
    },
  ];

  const dropdownHeader = (
    <div className="flex items-center gap-3">
      <CustomAvatar
        imageUrl={profileImage || profile?.profileImageUrl}
        name={fullName || profile?.fullName || "User"}
        size="lg"
      />
      <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1">
          {fullName || profile?.fullName || "User"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {email || profile?.email || ""}
        </p>
      </div>
    </div>
  );

  return (
    <CustomDropdownMenu
      trigger={
        <div className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
          <CustomAvatar
            imageUrl={profileImage || profile?.profileImageUrl}
            name={fullName || profile?.fullName || "User"}
            size="md"
          />
        </div>
      }
      header={dropdownHeader}
      sections={dropdownSections}
      align="right"
      openOnHover={openOnHover}
      hoverDelay={200}
    />
  );
}

export const NavbarAuth = memo(NavbarAuthComponent);

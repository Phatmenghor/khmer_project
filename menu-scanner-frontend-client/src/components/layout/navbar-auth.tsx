"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, MapPin } from "lucide-react";
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
        className="h-6 w-6 lg:hover:bg-primary/10 lg:hover:text-primary transition-colors"
        onClick={onLoginClick}
      >
        <User className="h-3 w-3" />
      </Button>
    );
  }

  const dropdownSections = [
    {
      items: [
        {
          label: "My Profile",
          icon: <User className="h-3 w-3" />,
          onClick: () => router.push("/profile"),
        },
        {
          label: "Location",
          icon: <MapPin className="h-3 w-3" />,
          onClick: () => router.push("/location"),
        },
      ],
    },
    {
      items: [
        {
          label: "Logout",
          icon: <LogOut className="h-3 w-3" />,
          onClick: onLogout,
          variant: "destructive" as const,
        },
      ],
    },
  ];

  const dropdownHeader = (
    <div className="flex items-center gap-2">
      <CustomAvatar
        imageUrl={profileImage || profile?.profileImageUrl}
        name={fullName || profile?.fullName || "User"}
        size="lg"
      />
      <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
        <p className="text-xs font-semibold line-clamp-1">
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
        <div className="relative h-7 w-7 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
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

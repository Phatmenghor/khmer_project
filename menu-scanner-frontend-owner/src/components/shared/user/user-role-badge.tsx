"use client";

import React from "react";
import { getUserDisplayRole, UserProfileDto } from "@/utils/user/user-helper";
import { cn } from "@/lib/utils";

interface UserRoleBadgeProps {
  profile?: UserProfileDto | null;
  roleName?: string;
  className?: string;
}

export function UserRoleBadge({ profile, roleName, className }: UserRoleBadgeProps) {
  const displayRole = roleName
    ? roleName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : getUserDisplayRole(profile);

  if (!displayRole) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider",
        className
      )}
    >
      {displayRole}
    </span>
  );
}

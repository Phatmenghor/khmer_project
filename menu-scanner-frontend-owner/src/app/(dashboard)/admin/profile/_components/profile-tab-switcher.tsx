"use client";

import { User, Lock } from "lucide-react";
import { CustomTabSwitcher, TabOption } from "@/components/shared/common/custom-tab-switcher";

interface ProfileTabSwitcherProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const PROFILE_TABS: TabOption[] = [
  {
    value: "profile",
    label: "Profile Details",
    icon: <User className="w-4 h-4 text-primary" />,
  },
  {
    value: "security",
    label: "Security & Accounts",
    icon: <Lock className="w-4 h-4 text-primary" />,
  },
];

export function ProfileTabSwitcher({
  activeSection,
  onSectionChange,
}: ProfileTabSwitcherProps) {
  return (
    <CustomTabSwitcher
      tabs={PROFILE_TABS}
      activeTab={activeSection}
      onTabChange={onSectionChange}
      className="mb-4"
    />
  );
}

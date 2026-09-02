"use client";

import { RefreshCw, LayoutDashboard } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageHeader } from "@/components/shared/common/page-header";

interface DashboardHeaderProps {
  today: string;
  onRefresh: () => void;
}

export function DashboardHeader({ today, onRefresh }: DashboardHeaderProps) {
  return (
    <PageHeader
      title="Platform Dashboard"
      subtitle={today}
      icon={LayoutDashboard}
      badgeText="Last 30 days"
      variant="line"
      className="mb-1"
      actions={
        <CustomButton
          variant="outline"
          size="sm"
          className="gap-1.5 h-[36px] rounded-[12px] px-3.5 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          onClick={onRefresh}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </CustomButton>
      }
    />
  );
}

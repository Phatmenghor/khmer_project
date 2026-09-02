"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  OwnerDashboardRecentOwnersResponse,
  RecentOwner,
} from "@/features/owner-dashboard/store/models/response/owner-dashboard-response";
import { ROUTES } from "@/constants/app-routes/routes";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import { formatDate } from "@/utils/date/date-time-format";

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();
  const textClass =
    normalized === "ACTIVE"
      ? "text-emerald-600 dark:text-emerald-400 font-bold"
      : normalized === "EXPIRING_SOON"
      ? "text-amber-600 dark:text-amber-400 font-bold"
      : "text-rose-600 dark:text-rose-400 font-bold";

  const label =
    normalized === "EXPIRING_SOON"
      ? "Expiring Soon"
      : normalized === "ACTIVE"
      ? "Active"
      : "Expired";

  return (
    <span className={cn("text-xs font-bold", textClass)}>
      {label}
    </span>
  );
}

interface RecentOwnersCardProps {
  recentOwners: OwnerDashboardRecentOwnersResponse | null;
  loading: boolean;
}

export function RecentOwnersCard({ recentOwners, loading }: RecentOwnersCardProps) {
  const columns: TableColumn<RecentOwner>[] = [
    {
      key: "ownerName",
      label: "Owner",
      minWidth: "120px",
      render: (owner) => (
        <div className="flex items-center gap-2.5">
          <TableImage
            src={owner.logoUrl || undefined}
            alt={owner.ownerName}
            fallbackText={owner.ownerName}
            className="h-8 w-8 rounded-[8px]"
          />
          <span className="text-xs font-semibold text-foreground truncate">
            {owner.ownerName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "businessName",
      label: "Business",
      minWidth: "120px",
      render: (owner) => (
        <span className="text-xs text-muted-foreground truncate">
          {owner.businessName || "—"}
        </span>
      ),
    },
    {
      key: "planName",
      label: "Plan",
      minWidth: "100px",
      render: (owner) => (
        <span className="text-xs font-medium text-foreground">
          {owner.planName || "—"}
        </span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Status",
      minWidth: "100px",
      render: (owner) => <StatusBadge status={owner.subscriptionStatus} />,
    },
    {
      key: "joinedAt",
      label: "Joined",
      minWidth: "100px",
      render: (owner) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(owner.joinedAt) || "—"}
        </span>
      ),
    },
  ];

  return (
    <Card className="rounded-[16px] border border-border/80 shadow-2xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground truncate">
              Recent Owners
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">
              Latest business owners on the platform
            </CardDescription>
          </div>
          <Link
            href={ROUTES.DASHBOARD.BUSINESS_OWNER}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold whitespace-nowrap shrink-0"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <DataTableWithPagination
          data={recentOwners?.data || []}
          columns={columns}
          loading={loading}
          emptyMessage="No recent owners found"
          getRowKey={(owner) => owner.ownerId}
          showPagination={false}
        />
      </CardContent>
    </Card>
  );
}

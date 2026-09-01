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

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();
  const textClass =
    normalized === "ACTIVE"
      ? "text-emerald-600 dark:text-emerald-400"
      : normalized === "EXPIRING_SOON"
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-500 dark:text-rose-400";

  const label =
    normalized === "EXPIRING_SOON"
      ? "Expiring Soon"
      : normalized === "ACTIVE"
      ? "Active"
      : "Expired";

  return (
    <span className={cn("text-[10px] font-semibold", textClass)}>
      {label}
    </span>
  );
}

function OwnerRow({ owner }: { owner: RecentOwner }) {
  const initial = (owner.ownerName ?? "?").charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(owner.ownerName ?? "");

  let joinedFormatted = "-";
  try {
    joinedFormatted = format(new Date(owner.joinedAt), "MMM d, yyyy");
  } catch {
    joinedFormatted = owner.joinedAt;
  }

  return (
    <tr className="border-b last:border-0 hover:bg-muted/40 transition-colors">
      <td className="py-2 pr-3">
        <div className="flex items-center gap-2">
          {owner.logoUrl ? (
            <img
              src={owner.logoUrl}
              alt={owner.ownerName}
              className="h-5 w-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                avatarBg
              )}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">
              {owner.ownerName}
            </p>
          </div>
        </div>
      </td>
      <td className="py-2 pr-3">
        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
          {owner.businessName}
        </p>
      </td>
      <td className="py-2 pr-3">
        <span className="text-[10px] text-foreground">{owner.planName}</span>
      </td>
      <td className="py-2 pr-3">
        <StatusBadge status={owner.subscriptionStatus} />
      </td>
      <td className="py-2">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {joinedFormatted}
        </span>
      </td>
    </tr>
  );
}

function OwnerRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" />
          <Skeleton className="h-3 w-16" />
        </div>
      </td>
      <td className="py-2 pr-3">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="py-2 pr-3">
        <Skeleton className="h-3 w-14" />
      </td>
      <td className="py-2 pr-3">
        <Skeleton className="h-3 w-11 rounded-full" />
      </td>
      <td className="py-2">
        <Skeleton className="h-3 w-16" />
      </td>
    </tr>
  );
}

interface RecentOwnersCardProps {
  recentOwners: OwnerDashboardRecentOwnersResponse | null;
  loading: boolean;
}

export function RecentOwnersCard({ recentOwners, loading }: RecentOwnersCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-semibold truncate">
              Recent Owners
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              Latest business owners on the platform
            </CardDescription>
          </div>
          <Link
            href={ROUTES.DASHBOARD.BUSINESS_OWNER}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-primary hover:underline font-medium whitespace-nowrap shrink-0"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-1 pr-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Owner
              </th>
              <th className="pb-1 pr-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Business
              </th>
              <th className="pb-1 pr-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Plan
              </th>
              <th className="pb-1 pr-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <OwnerRowSkeleton />
                <OwnerRowSkeleton />
                <OwnerRowSkeleton />
                <OwnerRowSkeleton />
                <OwnerRowSkeleton />
              </>
            ) : recentOwners?.data?.length ? (
              recentOwners.data.map((owner) => (
                <OwnerRow key={owner.ownerId} owner={owner} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-5 text-center text-muted-foreground text-xs"
                >
                  No recent owners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

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
} from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";
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
  const styles =
    normalized === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      : normalized === "EXPIRING_SOON"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
      : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";

  const label =
    normalized === "EXPIRING_SOON"
      ? "Expiring Soon"
      : normalized === "ACTIVE"
      ? "Active"
      : "Expired";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        styles
      )}
    >
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
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          {owner.logoUrl ? (
            <img
              src={owner.logoUrl}
              alt={owner.ownerName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0",
                avatarBg
              )}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {owner.ownerName}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <p className="text-sm text-muted-foreground truncate max-w-[140px]">
          {owner.businessName}
        </p>
      </td>
      <td className="py-3 pr-4">
        <span className="text-sm text-foreground">{owner.planName}</span>
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={owner.subscriptionStatus} />
      </td>
      <td className="py-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {joinedFormatted}
        </span>
      </td>
    </tr>
  );
}

function OwnerRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="py-3">
        <Skeleton className="h-4 w-24" />
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Owners</CardTitle>
            <CardDescription>Latest business owners on the platform</CardDescription>
          </div>
          <Link
            href={ROUTES.DASHBOARD.BUSINESS_OWNER}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
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
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">
                Owner
              </th>
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">
                Business
              </th>
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">
                Plan
              </th>
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="pb-2 text-xs font-medium text-muted-foreground">
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
                  className="py-8 text-center text-muted-foreground text-sm"
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

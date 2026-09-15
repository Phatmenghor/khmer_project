import { HeaderPanelSkeleton } from "./header-panel-skeleton";
import { StatusCardSkeleton } from "./status-card-skeleton";
import { TableSkeleton } from "./table-skeleton";

export function BakongStatusSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-1 pb-6 animate-in fade-in-50 duration-300">
      {/* Header Panel Skeleton */}
      <HeaderPanelSkeleton />

      {/* 3 Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCardSkeleton count={3} />
      </div>

      {/* Upstream Config Table Skeleton */}
      <TableSkeleton columns={8} rows={5} showHeader={false} />
    </div>
  );
}

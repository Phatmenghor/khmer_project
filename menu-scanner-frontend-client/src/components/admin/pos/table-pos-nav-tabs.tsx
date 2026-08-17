"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Clock, QrCode } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";
import { cn } from "@/lib/utils";

interface TablePosNavTabsProps {
  pendingCount?: number;
  activeOrdersCount?: number;
}

export function TablePosNavTabs({ pendingCount = 0 }: TablePosNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      title: "Table Monitoring",
      href: ROUTES.ADMIN.TABLE_MONITORING,
      icon: LayoutGrid,
      badge: null,
    },
    {
      title: "Table Pending Orders",
      href: ROUTES.ADMIN.TABLE_PENDING_ORDERS,
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-card/80 backdrop-blur-xl border border-border/80 rounded-[20px] shadow-2xs overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-[14px] text-xs font-bold transition-all shrink-0 cursor-pointer select-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="tracking-tight">{tab.title}</span>
            {tab.badge !== null && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black border",
                  isActive
                    ? "bg-white/20 text-white border-white/30"
                    : tab.badgeColor
                )}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}

      <div className="ml-auto pr-1 hidden sm:flex items-center gap-2">
        <Link
          href={ROUTES.ADMIN.QR_GENERATOR}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/60 shadow-2xs hover:border-primary/30"
        >
          <QrCode className="w-3.5 h-3.5 text-primary" />
          <span>QR Studio</span>
        </Link>
      </div>
    </div>
  );
}

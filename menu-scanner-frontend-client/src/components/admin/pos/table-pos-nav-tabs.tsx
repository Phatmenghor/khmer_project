"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShoppingBag, Clock, QrCode } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";
import { cn } from "@/lib/utils";

interface TablePosNavTabsProps {
  pendingCount?: number;
  activeOrdersCount?: number;
}

export function TablePosNavTabs({ pendingCount = 0, activeOrdersCount = 0 }: TablePosNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      title: "Table Monitoring",
      href: ROUTES.ADMIN.TABLE_MONITORING,
      icon: LayoutGrid,
      badge: null,
    },
    {
      title: "Table Live Orders",
      href: ROUTES.ADMIN.TABLE_ORDERS,
      icon: ShoppingBag,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
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
    <div className="flex items-center gap-1.5 p-1 bg-card border border-border/80 rounded-2xl shadow-3xs overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.title}</span>
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

      <div className="ml-auto pr-2 hidden sm:flex items-center gap-2">
        <Link
          href={ROUTES.ADMIN.QR_GENERATOR}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border/60"
        >
          <QrCode className="w-3.5 h-3.5 text-primary" />
          <span>QR Studio</span>
        </Link>
      </div>
    </div>
  );
}

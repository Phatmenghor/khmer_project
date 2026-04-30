import dynamic from "next/dynamic";

export const DashboardSidebarLazy = dynamic(
  () => import("./dashboard-sidebar").then((mod) => ({ default: mod.DashboardSidebar })),
  {
    loading: () => null,
  }
);

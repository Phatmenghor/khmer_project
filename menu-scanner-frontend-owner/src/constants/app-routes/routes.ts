import {
  Home,
  Users,
  Database,
  LucideIcon,
  LucideBriefcaseBusiness,
  ShoppingCart,
  Settings,
  QrCode,
} from "lucide-react";

export const ROUTES = {
  HOME: "/",
  PUBLIC: {
    HOME: "/",
  },
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/admin",
    BUSINESS_OWNER: "/admin/business-owner",
    SUBSCRIPTION_HISTORY: "/admin/subscription-history",
    SUBSCRIPTION_PLAN: "/admin/subscription-plan",
    BUSINESS_USERS: "/admin/business-users",
    BUSINESS_USER: "/admin/business-users",
    PLATFORM_USERS: "/admin/platform-users",
    PLATFORM_USER: "/admin/platform-users",
    USERS: "/admin/platform-users",
    USER_ROLES: "/admin/roles",
    ROLES: "/admin/roles",
  },
  PROFILE: "/profile",
  SUBSCRIPTION_HISTORY: "/subscription-history",
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
  },
} as const;


interface MenuItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: Array<{
    title: string;
    href: string;
  }>;
}

export const SIDEBAR_MENU: MenuItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD.INDEX,
    icon: Home,
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      {
        title: "Roles",
        href: ROUTES.DASHBOARD.ROLES,
      },
      {
        title: "Platform Users",
        href: ROUTES.DASHBOARD.PLATFORM_USERS,
      },
    ],
  },
  {
    title: "Business Management",
    icon: LucideBriefcaseBusiness,
    items: [
      {
        title: "Business Owners",
        href: ROUTES.DASHBOARD.BUSINESS_OWNER,
      },
      {
        title: "Business Users",
        href: ROUTES.DASHBOARD.BUSINESS_USERS,
      },
      {
        title: "Subscription History",
        href: ROUTES.DASHBOARD.SUBSCRIPTION_HISTORY,
      },
    ],
  },
  {
    title: "Master Data",
    icon: Database,
    items: [
      {
        title: "Subscription Plans",
        href: ROUTES.DASHBOARD.SUBSCRIPTION_PLAN,
      },
    ],
  },
];


export const isPublicRoute = (pathname: string): boolean => {
  return pathname === ROUTES.HOME || pathname === ROUTES.AUTH.LOGIN;
};

export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith(ROUTES.ADMIN.ROOT);
};

export const getActiveMenuItem = (pathname: string): MenuItem | null => {
  for (const item of SIDEBAR_MENU) {
    if (item.href === pathname) return item;

    if (item.items) {
      const found = item.items.find((subItem) => subItem.href === pathname);
      if (found) return item;
    }
  }
  return null;
};


export interface Breadcrumb {
  label: string;
  href?: string;
}

export const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: "Home", href: ROUTES.HOME }];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;


    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
};


export const getDefaultAdminRoute = (): string => {
  return "PLATFORM_USERS";
};

export const getLoginRedirectUrl = (): string => {
  return ROUTES.AUTH.LOGIN;
};

export const getDashboardRedirectUrl = (): string => {
  return getDefaultAdminRoute();
};

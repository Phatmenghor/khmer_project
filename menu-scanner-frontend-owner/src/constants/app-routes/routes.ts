import {
  Home,
  Users,
  LucideIcon,
  Database,
  Building2,
} from "lucide-react";

export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    REGISTER: "/register",
  },
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/admin",
    USERS: "/admin/platform-users",
    CALENDAR: "/admin/calendar",
    SECURITY: "/admin/security",
    USER_MANAGEMENT: "/admin/users/manage",
    USER_ROLES: "/admin/roles",
    PROFILE: "/admin/profile",
    BUSINESS_USER: "/admin/business-users",
    BUSINESS_OWNER: "/admin/business-owner",
    SUBSCRIPTION_HISTORY: "/admin/subscription-history",
    PAYMENT: "/admin/payment",
    USERS_BUSINESS: "/admin/users",
    SUBSCRIPTION_PLAN: "/admin/subscription-plan",
  },
} as const;

type Subroute = {
  title: string;
  href: string;
};

type SidebarItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  image?: string;
  section?: string;
  subroutes?: Subroute[];
};

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD.INDEX,
    icon: Home,
  },
  {
    title: "Master Data",
    section: "Master Data",
    icon: Database,
    subroutes: [
      {
        title: "Roles",
        href: ROUTES.DASHBOARD.USER_ROLES,
      },
      {
        title: "Subscription Plan",
        href: ROUTES.DASHBOARD.SUBSCRIPTION_PLAN,
      },
    ],
  },
  {
    title: "Business",
    section: "Business",
    icon: Building2,
    subroutes: [
      {
        title: "Business Owner",
        href: ROUTES.DASHBOARD.BUSINESS_OWNER,
      },
      {
        title: "Subscription History",
        href: ROUTES.DASHBOARD.SUBSCRIPTION_HISTORY,
      },
    ],
  },
  {
    title: "User Management",
    section: "User Management",
    icon: Users,
    subroutes: [
      {
        title: "Platform Users",
        href: ROUTES.DASHBOARD.USERS,
      },
      {
        title: "Business Users",
        href: ROUTES.DASHBOARD.BUSINESS_USER,
      },
    ],
  },
];

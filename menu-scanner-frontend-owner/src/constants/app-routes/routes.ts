import {
  Home,
  Users,
  LucideIcon,
  Database,
  Pin,
} from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/admin",
    USERS: "/admin/platform-users",
    CALENDAR: "/admin/calendar",
    SECURITY: "/admin/security",
    USER_MANAGEMENT: "/admin/users/manage",
    USER_ROLES: "/admin/users/roles",
    PROFILE: "/admin/profile",
    BUSINESS_USER: "/admin/business-users",
    BUSINESS_OWNER: "/admin/business-owner",
    PAYMENT: "/admin/payment",
    USERS_BUSINESS: "/admin/users",
    CUSTOMER_USER: "/admin/customer-user",
    PROVINCE: "/admin/province",
    DISTRICT: "/admin/district",
    VILLAGE: "/admin/village",
    COMMUNE: "/admin/commune",
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
        title: "Payment",
        href: ROUTES.DASHBOARD.PAYMENT,
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
      {
        title: "Business Owner",
        href: ROUTES.DASHBOARD.BUSINESS_OWNER,
      },
      {
        title: "Customer Users",
        href: ROUTES.DASHBOARD.CUSTOMER_USER,
      },
    ],
  },
  {
    title: "Locations",
    section: "Locations",
    icon: Pin,
    subroutes: [
      {
        title: "province",
        href: ROUTES.DASHBOARD.PROVINCE,
      },
      {
        title: "district",
        href: ROUTES.DASHBOARD.DISTRICT,
      },
      {
        title: "commune",
        href: ROUTES.DASHBOARD.COMMUNE,
      },
      {
        title: "village",
        href: ROUTES.DASHBOARD.VILLAGE,
      },
    ],
  },
];

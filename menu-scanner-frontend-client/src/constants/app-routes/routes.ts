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
  AUTH: {
    LOGIN: "/login",
  },

  LOCATION: "/location",


  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
    ADMIN_SESSIONS: "/admin/admin-sessions",
    USERS: "/admin/users",
    ROLES: "/admin/users/roles",
    USER_SESSIONS: "/admin/users/sessions",
    BRAND: "/admin/brand",
    BANNER: "/admin/banner",
    CATEGORIES: "/admin/categories",
    EXCHANGE_RATE: "/admin/exchange-rate",
    DELIVERY_OPTIONS: "/admin/delivery-options",
    PAYMENT_OPTIONS: "/admin/payment-options",
    PRODUCTS: "/admin/products",
    PRODUCTS_PROMOTION: "/admin/product-promotions",
    BULK_PROMOTION_CREATION: "/admin/bulk-promotion",
    ORDERS: "/admin/orders",
    ORDERS_PENDING: "/admin/orders/pending",
    POS: "/admin/pos",
    BUSINESS_SETTINGS: "/admin/manage-business-settings",
    QR_GENERATOR: "/admin/qr-generator",
    PORTFOLIO: "/admin/portfolio",
    PORTFOLIO_REVIEWS: "/admin/portfolio/reviews",
  },

  MANAGE_STOCK: {
    PRODUCTS_STOCK: "/admin/manage-stock/products-stock",
    SIZE_STOCK: "/admin/manage-stock/size-stock",
    STOCK_ITEMS: "/admin/manage-stock/stock-items",
  },

  HR: {
    WORK_SCHEDULE: "/admin/hr/work-schedule",
    WORK_SCHEDULE_TYPE: "/admin/hr/work-schedule-type",
    LEAVE_TYPE: "/admin/hr/leave-type",
    LEAVE: "/admin/hr/leave",
    ATTENDANCE: "/admin/hr/attendance",
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
    href: ROUTES.ADMIN.DASHBOARD,
    icon: Home,
  },

  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "Roles",
        href: ROUTES.ADMIN.ROLES,
      },
      {
        title: "All Users",
        href: ROUTES.ADMIN.USERS,
      },


    ],
  },

  {
    title: "Master Data",
    icon: Database,
    items: [
      {
        title: "Banner",
        href: ROUTES.ADMIN.BANNER,
      },
      {
        title: "Categories",
        href: ROUTES.ADMIN.CATEGORIES,
      },
      {
        title: "Brand",
        href: ROUTES.ADMIN.BRAND,
      },
      {
        title: "Exchange Rate",
        href: ROUTES.ADMIN.EXCHANGE_RATE,
      },
      {
        title: "Delivery Options",
        href: ROUTES.ADMIN.DELIVERY_OPTIONS,
      },
      {
        title: "Payment Options",
        href: ROUTES.ADMIN.PAYMENT_OPTIONS,
      },
    ],
  },
  {
    title: "POS",
    href: ROUTES.ADMIN.POS,
    icon: ShoppingCart,
  },
  {
    title: "Business",
    icon: LucideBriefcaseBusiness,
    items: [
      {
        title: "Products",
        href: ROUTES.ADMIN.PRODUCTS,
      },
      {
        title: "Products Promotion",
        href: ROUTES.ADMIN.PRODUCTS_PROMOTION,
      },
      {
        title: "Orders",
        href: ROUTES.ADMIN.ORDERS,
      },
      {
        title: "Pending Orders",
        href: ROUTES.ADMIN.ORDERS_PENDING,
      },
    ],
  },
  {
    title: "Stock Management",
    icon: ShoppingCart,
    items: [
      {
        title: "Stock Items",
        href: ROUTES.MANAGE_STOCK.STOCK_ITEMS,
      },
      {
        title: "Products Stock",
        href: ROUTES.MANAGE_STOCK.PRODUCTS_STOCK,
      },
      {
        title: "Size Stock",
        href: ROUTES.MANAGE_STOCK.SIZE_STOCK,
      },
    ],
  },
  {
    title: "Services",
    icon: QrCode,
    items: [
      {
        title: "QR Generator",
        href: ROUTES.ADMIN.QR_GENERATOR,
      },
      {
        title: "Portfolio",
        href: ROUTES.ADMIN.PORTFOLIO,
      },
      {
        title: "Reviews",
        href: ROUTES.ADMIN.PORTFOLIO_REVIEWS,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "Business Settings",
        href: ROUTES.ADMIN.BUSINESS_SETTINGS,
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

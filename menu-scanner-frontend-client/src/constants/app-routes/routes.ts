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
    USERS_IMPORT: "/admin/users/import",
    CUSTOMERS: "/admin/customers",
    CUSTOMERS_IMPORT: "/admin/customers/import",
    ROLES: "/admin/users/roles",
    ROLES_IMPORT: "/admin/users/roles/import",
    USER_SESSIONS: "/admin/users/sessions",
    BRAND: "/admin/brand",
    BRAND_IMPORT: "/admin/brand/import",
    BANNER: "/admin/banner",
    BANNER_IMPORT: "/admin/banner/import",
    CATEGORIES: "/admin/categories",
    CATEGORIES_IMPORT: "/admin/categories/import",
    EXCHANGE_RATE: "/admin/exchange-rate",
    EXCHANGE_RATE_IMPORT: "/admin/exchange-rate/import",
    DELIVERY_OPTIONS: "/admin/delivery-options",
    DELIVERY_OPTIONS_IMPORT: "/admin/delivery-options/import",
    PAYMENT_OPTIONS: "/admin/payment-options",
    PAYMENT_OPTIONS_IMPORT: "/admin/payment-options/import",
    PRODUCTS: "/admin/products",
    PRODUCTS_IMPORT: "/admin/products/import",
    PRODUCTS_PROMOTION: "/admin/product-promotions",
    BULK_PROMOTION_CREATION: "/admin/bulk-promotion",
    ORDERS: "/admin/orders",
    ORDERS_PENDING: "/admin/orders/pending",
    POS: "/admin/pos",
    TABLE_MONITORING: "/admin/pos/table-monitoring",
    TABLE_ORDERS: "/admin/pos/table-orders",
    TABLE_PENDING_ORDERS: "/admin/pos/table-pending",
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
      {
        title: "Customers",
        href: ROUTES.ADMIN.CUSTOMERS,
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
    title: "Operations",
    icon: ShoppingCart,
    items: [
      {
        title: "POS Register",
        href: ROUTES.ADMIN.POS,
      },
      {
        title: "Table Monitoring",
        href: ROUTES.ADMIN.TABLE_MONITORING,
      },
      {
        title: "Table Live Orders",
        href: ROUTES.ADMIN.TABLE_ORDERS,
      },
      {
        title: "Table Pending Orders",
        href: ROUTES.ADMIN.TABLE_PENDING_ORDERS,
      },
    ],
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
        title: "Product Stock",
        href: ROUTES.MANAGE_STOCK.PRODUCTS_STOCK,
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

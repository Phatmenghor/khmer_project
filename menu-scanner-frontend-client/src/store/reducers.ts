


import authReducer from "@/features/auth/store/slice/auth-slice";
import roleSlice from "@/features/auth/store/slice/role-slice";
import usersReducer from "@/features/auth/store/slice/users-slice";
import customersReducer from "@/features/auth/store/slice/customers-slice";
import sessionReducer from "@/features/sessions/store/slice/session-slice";

import bannerReducer from "@/features/master-data/store/slice/banner-slice";
import brandReducer from "@/features/master-data/store/slice/brand-slice";
import categoriesReducer from "@/features/master-data/store/slice/categories-slice";
import exchangeRateReducer from "@/features/master-data/store/slice/exchange-rate-slice";
import deliveryOptionsReducer from "@/features/master-data/store/slice/delivery-options-slice";
import paymentOptionsReducer from "@/features/master-data/store/slice/payment-options-slice";

import favoritesReducer from "@/features/main/store/slice/favorite-slice";
import productReducer from "@/features/business/store/slice/product-slice";
import stockReducer from "@/features/business/store/slice/stock-slice";
import stockItemsReducer from "@/features/business/store/slice/stock-items-slice";
import stockManagementReducer from "@/features/business/store/slice/stock-management-slice";
import orderAdminReducer from "@/features/business/store/slice/order-admin-slice";
import posPageReducer from "@/features/business/store/slice/pos-page-slice";
import tableMonitoringReducer from "@/features/business/store/slice/table-monitoring-slice";
import tableSessionReducer from "@/features/business/store/slice/table-session-slice";
import bulkPromotionReducer from "@/features/business/store/slice/bulk-promotion-slice";
import promotionSizeSelectionReducer from "@/features/business/store/slice/promotion-size-selection-slice";
import businessSettingsReducer from "@/features/business/store/slice/business-settings-slice";
import homeReducer from "@/features/main/store/slice/home-slice";
import publicProductReducer from "@/features/main/store/slice/public-product-slice";
import publicBrandsReducer from "@/features/main/store/slice/public-brands-slice";
import publicCategoriesReducer from "@/features/main/store/slice/public-categories-slice";
import myOrdersReducer from "@/features/main/store/slice/my-orders-slice";
import scrollReducer from "@/features/main/store/slice/scroll-slice";
import cartReducer from "@/features/main/store/slice/cart-slice";
import globalSettingsReducer from "./slices/global-settings-slice";
import uiReducer from "./slices/ui-slice";
import comboboxCacheReducer from "./slices/combobox-cache-slice";
import dashboardReducer from "@/features/dashboard/store/slice/dashboard-slice";
import locationReducer from "@/features/location/store/slice/location-slice";

import publicPortfolioReducer from "@/features/portfolio/store/slice/public-portfolio-slice";
import portfolioProfileReducer from "@/features/portfolio/store/slice/portfolio-profile-slice";
import portfolioReviewsReducer from "@/features/portfolio/store/slice/portfolio-reviews-slice";


export const reducers = {

  ui: uiReducer,
  globalSettings: globalSettingsReducer,
  comboboxCache: comboboxCacheReducer,
  dashboard: dashboardReducer,


  auth: authReducer,
  users: usersReducer,
  customers: customersReducer,
  roles: roleSlice,
  sessions: sessionReducer,


  banner: bannerReducer,
  brand: brandReducer,
  categories: categoriesReducer,
  exchangeRate: exchangeRateReducer,
  deliveryOptions: deliveryOptionsReducer,
  paymentOptions: paymentOptionsReducer,


  businessSettings: businessSettingsReducer,
  products: productReducer,
  stocks: stockReducer,
  stockItems: stockItemsReducer,
  stockManagement: stockManagementReducer,
  ordersAdmin: orderAdminReducer,
  posPage: posPageReducer,
  tableMonitoring: tableMonitoringReducer,
  tableSession: tableSessionReducer,
  bulkPromotion: bulkPromotionReducer,
  promotionSizeSelection: promotionSizeSelectionReducer,


  home: homeReducer,
  publicProducts: publicProductReducer,
  publicBrands: publicBrandsReducer,
  publicCategories: publicCategoriesReducer,
  myOrders: myOrdersReducer,
  scroll: scrollReducer,
  favorites: favoritesReducer,
  cart: cartReducer,


  location: locationReducer,

  publicPortfolio: publicPortfolioReducer,
  portfolioProfile: portfolioProfileReducer,
  portfolioReviews: portfolioReviewsReducer,
};

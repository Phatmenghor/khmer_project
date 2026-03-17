/**
 * Store Reducers Configuration
 * Centralized configuration for all Redux reducers
 */

import authReducer from "../features/auth/store/slice/auth-slice";
import roleSlice from "../features/auth/store/slice/role-slice";
import usersReducer from "../features/auth/store/slice/users-slice";
import sessionReducer from "../features/sessions/store/slice/session-slice";

import bannerReducer from "../features/master-data/store/slice/banner-slice";
import orderStatusReducer from "../features/master-data/store/slice/order-status-slice";
import brandReducer from "../features/master-data/store/slice/brand-slice";
import categoriesReducer from "../features/master-data/store/slice/categories-slice";
import exchangeRateReducer from "../features/master-data/store/slice/exchange-rate-slice";
import deliveryOptionsReducer from "../features/master-data/store/slice/delivery-options-slice";

import workScheduleTypeReducer from "../features/hr/store/slice/work-schedule-type-slice";
import leaveTypeReducer from "../features/hr/store/slice/leave-type-slice";
import workScheduleReducer from "../features/hr/store/slice/work-schedule-slice";
import leaveReducer from "../features/hr/store/slice/leave-slice";
import attendanceReducer from "../features/hr/store/slice/attendance-slice";

import favoritesReducer from "../features/main/store/slice/favorite-slice";
import productReducer from "../features/business/store/slice/product-slice";
import homeReducer from "../features/main/store/slice/home-slice";
import publicProductReducer from "../features/main/store/slice/public-product-slice";
import publicBrandsReducer from "../features/main/store/slice/public-brands-slice";
import publicCategoriesReducer from "../features/main/store/slice/public-categories-slice";
import scrollReducer from "../features/main/store/slice/scroll-slice";
import cartReducer from "../features/main/store/slice/cart-slice";
import globalSettingsReducer from "./slices/global-settings-slice";
import locationReducer from "../features/location/store/slice/location-slice";
import publicLocationReducer from "../features/location/store/slice/public-location-slice";

/**
 * Root reducer configuration
 * Add new feature reducers here
 */
export const reducers = {
  // Global Settings
  globalSettings: globalSettingsReducer,

  // Auth
  auth: authReducer,
  users: usersReducer,
  roles: roleSlice,
  sessions: sessionReducer,

  // Master Data (Admin)
  banner: bannerReducer,
  orderStatus: orderStatusReducer,
  brand: brandReducer,
  categories: categoriesReducer,
  exchangeRate: exchangeRateReducer,
  deliveryOptions: deliveryOptionsReducer,

  // Business
  products: productReducer,

  // HR
  workScheduleType: workScheduleTypeReducer,
  leaveType: leaveTypeReducer,
  leave: leaveReducer,
  attendance: attendanceReducer,
  workSchedule: workScheduleReducer,

  // Main/Public
  home: homeReducer,
  publicProducts: publicProductReducer,
  publicBrands: publicBrandsReducer,
  publicCategories: publicCategoriesReducer,
  scroll: scrollReducer,
  favorites: favoritesReducer,
  cart: cartReducer,

  // Location
  location: locationReducer,
  publicLocation: publicLocationReducer,
};




import authReducer from "@/features/auth/store/slice/auth-slice";
import roleSlice from "@/features/auth/store/slice/role-slice";
import usersReducer from "@/features/auth/store/slice/users-slice";
import businessOwnerReducer from "@/features/auth/store/slice/business-owner-slice";

import subscriptionPlanReducer from "@/features/master-data/store/slice/subscription-plan-slice";

import notificationReducer from "@/features/notification/store/slice/notification-slice";
import subscriptionHistoryReducer from "@/features/subscription/store/slice/subscription-history-slice";
import ownerDashboardReducer from "@/features/owner-dashboard/store/slice/owner-dashboard-slice";
import businessSettingsReducer from "@/features/business/store/slice/business-settings-slice";

import globalSettingsReducer from "./slices/global-settings-slice";
import uiReducer from "./slices/ui-slice";
import comboboxCacheReducer from "./slices/combobox-cache-slice";
import websocketReducer from "./slices/websocket-slice";

export const reducers = {
  ui: uiReducer,
  globalSettings: globalSettingsReducer,
  comboboxCache: comboboxCacheReducer,
  websocket: websocketReducer,

  auth: authReducer,
  users: usersReducer,
  businessOwner: businessOwnerReducer,
  roles: roleSlice,

  subscriptionPlan: subscriptionPlanReducer,

  notification: notificationReducer,
  subscriptionHistory: subscriptionHistoryReducer,
  ownerDashboard: ownerDashboardReducer,
  businessSettings: businessSettingsReducer,
};

import globalSettingsReducer from "./slices/global-settings-slice";
import websocketReducer from "./slices/websocket-slice";
import authReducer from "../features/auth/store/slice/auth-slice";
import usersReducer from "../features/auth/store/slice/users-slice";
import businessOwnerReducer from "../features/auth/store/slice/business-owner-slice";
import roleReducer from "../features/auth/store/slice/role-slice";

import exchangeRateReducer from "../features/master-data/store/slice/exchage-rate-slice";
import subscriptionPlanReducer from "../features/master-data/store/slice/subscription-plan-slice";
import paymentReducer from "../features/master-data/store/slice/payment-slice";

import notificationReducer from "../features/notification/store/slice/notification-slice";

import subscriptionHistoryReducer from "../features/subscription/store/slice/subscription-history-slice";
import ownerDashboardReducer from "../features/owner-dashboard/store/slice/owner-dashboard-slice";

export const reducers = {
  globalSettings: globalSettingsReducer,
  websocket: websocketReducer,
  auth: authReducer,
  users: usersReducer,
  businessOwner: businessOwnerReducer,
  roles: roleReducer,
  exchangeRate: exchangeRateReducer,
  subscriptionPlan: subscriptionPlanReducer,
  payment: paymentReducer,
  notification: notificationReducer,
  subscriptionHistory: subscriptionHistoryReducer,
  ownerDashboard: ownerDashboardReducer,
};

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WebSocketResource =
  | "businessOwner"
  | "user"
  | "subscription"
  | "subscriptionPlan"
  | "location"
  | "role"
  | "dashboard";

interface WebSocketState {
  versions: Record<WebSocketResource, number>;
}

const initialState: WebSocketState = {
  versions: {
    businessOwner: 0,
    user: 0,
    subscription: 0,
    subscriptionPlan: 0,
    location: 0,
    role: 0,
    dashboard: 0,
  },
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    bumpVersion: (state, action: PayloadAction<WebSocketResource>) => {
      state.versions[action.payload]++;
    },
  },
});

export const { bumpVersion } = websocketSlice.actions;
export default websocketSlice.reducer;

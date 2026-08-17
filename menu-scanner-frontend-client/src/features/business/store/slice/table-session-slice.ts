import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TableSession,
  TableSessionItem,
} from "../models/type/table-session-type";

interface TableSessionState {
  activeSessions: Record<string, TableSession>; // key: tableId
  isLoading: boolean;
  error: string | null;
}

const initialState: TableSessionState = {
  activeSessions: {},
  isLoading: false,
  error: null,
};

const tableSessionSlice = createSlice({
  name: "tableSession",
  initialState,
  reducers: {
    getOrCreateSession: (
      state,
      action: PayloadAction<{ tableId: string; tableNumber: string; zone?: string }>
    ) => {
      const { tableId, tableNumber, zone } = action.payload;
      if (!state.activeSessions[tableId]) {
        const sessionId = `sess_${tableId}_${Date.now()}`;
        state.activeSessions[tableId] = {
          id: sessionId,
          tableId,
          tableNumber,
          zone,
          sessionNumber: `SESS-${tableNumber.replace(/\s+/g, "")}-${Date.now().toString().slice(-4)}`,
          status: "ACTIVE",
          startedAt: new Date().toISOString(),
          totalItems: 0,
          subtotal: 0,
          customizationTotal: 0,
          totalAmount: 0,
          items: [],
        };
      }
    },

    addItemToSession: (
      state,
      action: PayloadAction<{
        tableId: string;
        tableNumber: string;
        zone?: string;
        item: Omit<TableSessionItem, "id" | "sessionId" | "orderRound" | "createdAt">;
      }>
    ) => {
      const { tableId, tableNumber, zone, item } = action.payload;

      if (!state.activeSessions[tableId]) {
        const sessionId = `sess_${tableId}_${Date.now()}`;
        state.activeSessions[tableId] = {
          id: sessionId,
          tableId,
          tableNumber,
          zone,
          sessionNumber: `SESS-${tableNumber.replace(/\s+/g, "")}-${Date.now().toString().slice(-4)}`,
          status: "ACTIVE",
          startedAt: new Date().toISOString(),
          totalItems: 0,
          subtotal: 0,
          customizationTotal: 0,
          totalAmount: 0,
          items: [],
        };
      }

      const session = state.activeSessions[tableId];
      const maxRound = session.items.reduce((max, i) => Math.max(max, i.orderRound || 1), 0);
      const nextRound = session.items.length === 0 ? 1 : maxRound + 1;

      const newItem: TableSessionItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        sessionId: session.id,
        orderRound: nextRound,
        createdAt: new Date().toISOString(),
        ...item,
      };

      session.items.push(newItem);
      session.totalItems = session.items.reduce((acc, i) => acc + i.quantity, 0);
      session.subtotal = session.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
      session.customizationTotal = session.items.reduce(
        (acc, i) => acc + (i.customizationTotal || 0) * i.quantity,
        0
      );
      session.totalAmount = session.subtotal + session.customizationTotal;
    },

    requestBillForSession: (state, action: PayloadAction<string>) => {
      const tableId = action.payload;
      if (state.activeSessions[tableId]) {
        state.activeSessions[tableId].status = "BILL_REQUESTED";
      }
    },

    closeAndClearSession: (state, action: PayloadAction<string>) => {
      const tableId = action.payload;
      if (state.activeSessions[tableId]) {
        delete state.activeSessions[tableId];
      }
    },
  },
});

export const {
  getOrCreateSession,
  addItemToSession,
  requestBillForSession,
  closeAndClearSession,
} = tableSessionSlice.actions;

export default tableSessionSlice.reducer;

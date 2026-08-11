import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TableMonitoringState,
  TableMonitoringItem,
  TableMonitoringStatus,
  ReservationInfo,
} from "../models/type/table-monitoring-type";
import {
  fetchTablesThunk,
  createTableThunk,
  updateTableStatusThunk,
} from "../thunks/table-monitoring-thunks";

const initialState: TableMonitoringState = {
  tables: [],
  selectedZone: "ALL",
  selectedStatus: "ALL",
  searchQuery: "",
  isLiveSync: true,
  selectedTable: null,
  isPayModalOpen: false,
  isDetailModalOpen: false,
  isCreateModalOpen: false,
  paymentMethod: "ABA_KHQR",
  isLoading: false,
  error: null,
};

const tableMonitoringSlice = createSlice({
  name: "tableMonitoring",
  initialState,
  reducers: {
    setSelectedZone: (state, action: PayloadAction<string>) => {
      state.selectedZone = action.payload;
    },
    setSelectedStatus: (state, action: PayloadAction<string>) => {
      state.selectedStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setIsLiveSync: (state, action: PayloadAction<boolean>) => {
      state.isLiveSync = action.payload;
    },
    setSelectedTable: (state, action: PayloadAction<TableMonitoringItem | null>) => {
      state.selectedTable = action.payload;
    },
    setIsPayModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPayModalOpen = action.payload;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    setPaymentMethod: (
      state,
      action: PayloadAction<"ABA_KHQR" | "CASH" | "CARD">
    ) => {
      state.paymentMethod = action.payload;
    },
    addTableLocal: (state, action: PayloadAction<Omit<TableMonitoringItem, "id">>) => {
      const newTable: TableMonitoringItem = {
        id: `table-${Date.now()}`,
        ...action.payload,
      };
      state.tables.push(newTable);
    },
    updateTableStatusOptimistic: (
      state,
      action: PayloadAction<{ tableId: string; status: TableMonitoringStatus }>
    ) => {
      const table = state.tables.find((t) => t.id === action.payload.tableId);
      if (table) {
        table.status = action.payload.status;
      }
    },
    setTableReservation: (
      state,
      action: PayloadAction<{ tableId: string; reservation: ReservationInfo | null }>
    ) => {
      const table = state.tables.find((t) => t.id === action.payload.tableId);
      if (table) {
        table.status = action.payload.reservation ? "RESERVED" : "AVAILABLE";
        table.reservation = action.payload.reservation;
      }
    },
    payBillSuccess: (state, action: PayloadAction<string>) => {
      const table = state.tables.find((t) => t.id === action.payload);
      if (table) {
        if (table.activeOrder) {
          table.activeOrder.paymentStatus = "PAID";
        }
      }
    },
    resetTableStatus: (
      state,
      action: PayloadAction<{ tableId: string; status?: TableMonitoringStatus }>
    ) => {
      const table = state.tables.find((t) => t.id === action.payload.tableId);
      if (table) {
        table.status = action.payload.status || "AVAILABLE";
        table.activeOrder = null;
        table.reservation = null;
        table.seatedMinutes = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTablesThunk
      .addCase(fetchTablesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTablesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tables = action.payload || [];
      })
      .addCase(fetchTablesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createTableThunk
      .addCase(createTableThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.tables.push(action.payload);
        }
      })
      // updateTableStatusThunk
      .addCase(updateTableStatusThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.tables.findIndex((t) => t.id === action.payload.id);
          if (index !== -1) {
            state.tables[index] = action.payload;
          }
        }
      });
  },
});

export const {
  setSelectedZone,
  setSelectedStatus,
  setSearchQuery,
  setIsLiveSync,
  setSelectedTable,
  setIsPayModalOpen,
  setIsDetailModalOpen,
  setIsCreateModalOpen,
  setPaymentMethod,
  addTableLocal,
  updateTableStatusOptimistic,
  setTableReservation,
  payBillSuccess,
  resetTableStatus,
} = tableMonitoringSlice.actions;

export default tableMonitoringSlice.reducer;

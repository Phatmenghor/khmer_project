import { ActiveTableSession } from "../table/table-session";

export type OrderContextType = "USER" | "GUEST" | "TABLE";

export interface OrderContext {
  type: OrderContextType;
  isTable: boolean;
  isGuest: boolean;
  isUser: boolean;
  label: string;
  tableName?: string;
  tableId?: string;
}

export function getOrderContext(
  isAuthenticated: boolean,
  activeTableSession?: ActiveTableSession | null
): OrderContext {
  if (activeTableSession && activeTableSession.tableId) {
    return {
      type: "TABLE",
      isTable: true,
      isGuest: false,
      isUser: false,
      label: `Dine-In (${activeTableSession.tableName || `Table ${activeTableSession.tableId}`})`,
      tableName: activeTableSession.tableName || `Table ${activeTableSession.tableId}`,
      tableId: activeTableSession.tableId,
    };
  }

  if (isAuthenticated) {
    return {
      type: "USER",
      isTable: false,
      isGuest: false,
      isUser: true,
      label: "Registered Customer Delivery",
    };
  }

  return {
    type: "GUEST",
    isTable: false,
    isGuest: true,
    isUser: false,
    label: "Guest Delivery",
  };
}

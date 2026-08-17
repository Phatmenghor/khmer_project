export type TableMonitoringStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "MAINTENANCE";

export type OrderPaymentStatus = "UNPAID" | "PAID";

export interface ActiveTableOrder {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: OrderPaymentStatus;
  itemsSummary: string;
  createdAt?: string;
}

export interface ReservationInfo {
  guestName: string;
  phone?: string;
  bookingTime: string;
  guestCount: number;
  notes?: string;
}

export interface TableMonitoringItem {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  status: TableMonitoringStatus;
  activeOrder?: ActiveTableOrder | null;
  reservation?: ReservationInfo | null;
  seatedMinutes?: number;
  seatedAt?: string;
}

export interface TableMonitoringState {
  tables: TableMonitoringItem[];
  selectedZone: string;
  selectedStatus: string;
  searchQuery: string;
  isLiveSync: boolean;
  selectedTable: TableMonitoringItem | null;
  isPayModalOpen: boolean;
  isDetailModalOpen: boolean;
  isCreateModalOpen: boolean;
  paymentMethod: "ABA_KHQR" | "CASH" | "CARD";
  isLoading: boolean;
  error: string | null;
}

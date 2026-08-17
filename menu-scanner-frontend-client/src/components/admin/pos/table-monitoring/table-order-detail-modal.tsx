import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { formatCurrency } from "@/utils/common/currency-format";
import { TableMonitoringItem } from "@/features/business/store/models/type/table-monitoring-type";
import { LayoutGrid, Download, ShoppingBag, Clock } from "lucide-react";
import { axiosClient } from "@/utils/axios";

interface TableOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: TableMonitoringItem | null;
  onDownloadReceipt: (table: TableMonitoringItem) => void;
}

export const TableOrderDetailModal: React.FC<TableOrderDetailModalProps> = ({
  isOpen,
  onClose,
  selectedTable,
  onDownloadReceipt,
}) => {
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isOpen || !selectedTable) return;

    const fetchActiveTableSession = async () => {
      try {
        setLoadingOrders(true);
        const response = await axiosClient.get(`/api/v1/table-sessions/active?tableId=${selectedTable.id}`);
        const sessionData = response.data?.data;

        if (sessionData) {
          setTableOrders([sessionData]);
        } else if (selectedTable.activeOrder) {
          setTableOrders([
            {
              id: selectedTable.activeOrder.orderId,
              orderNumber: selectedTable.activeOrder.orderNumber,
              pricing: { finalTotal: selectedTable.activeOrder.totalAmount },
              payment: { paymentStatus: selectedTable.activeOrder.paymentStatus },
              items: [],
              customerNote: selectedTable.activeOrder.itemsSummary,
            },
          ]);
        } else {
          setTableOrders([]);
        }
      } catch {
        setTableOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchActiveTableSession();
  }, [isOpen, selectedTable]);

  const cumulativeTotal = tableOrders.reduce((sum, ord) => {
    return sum + (ord.pricing?.finalTotal || ord.totalAmount || 0);
  }, selectedTable?.activeOrder?.totalAmount || 0);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-0 overflow-hidden"
    >
      <FormHeader
        title={`Table #${selectedTable?.number || ""} - Live Dining Orders`}
        description={`Zone: ${selectedTable?.zone || "Main"} • Seated ${selectedTable?.seatedMinutes || 0} mins ago`}
        avatarIcon={<LayoutGrid className="w-5 h-5 text-primary" />}
        showAvatar
      />

      <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <InfoRow label="Zone" value={selectedTable?.zone} />
          <InfoRow label="Seated Time" value={`${selectedTable?.seatedMinutes || 0} minutes`} />
          <InfoRow label="Table Status" value={selectedTable?.status} />
        </div>

        <SectionTitle>
          Cumulative Orders ({tableOrders.length > 0 ? tableOrders.length : 1} active tab)
        </SectionTitle>

        {loadingOrders ? (
          <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
            Loading table order details...
          </div>
        ) : tableOrders.length > 0 ? (
          <div className="space-y-2.5">
            {tableOrders.map((ord, idx) => (
              <div
                key={ord.id || idx}
                className="p-3.5 rounded-[16px] bg-card border border-border/80 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                    #{ord.orderNumber || `Order ${idx + 1}`}
                  </span>
                  <span className="font-extrabold text-primary">
                    {formatCurrency(ord.pricing?.finalTotal || ord.totalAmount || 0)}
                  </span>
                </div>

                {ord.items && ord.items.length > 0 ? (
                  <div className="space-y-1 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                    {ord.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>
                          {it.productName} × {it.quantity}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(it.totalPrice || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    {ord.customerNote || selectedTable?.activeOrder?.itemsSummary || "Dine-in menu item"}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-[16px] bg-muted/40 border border-border/80 space-y-1">
            <p className="text-xs text-foreground font-medium leading-relaxed">
              {selectedTable?.activeOrder?.itemsSummary || "No active orders for this table."}
            </p>
          </div>
        )}

        {/* Grand Total Bar */}
        <div className="p-3.5 rounded-[16px] bg-primary/10 border border-primary/30 flex items-center justify-between text-xs font-bold">
          <span className="text-foreground">Grand Total Running Bill:</span>
          <span className="text-primary font-black text-base">
            {formatCurrency(cumulativeTotal)}
          </span>
        </div>

        <div className="pt-3 border-t border-border flex justify-between gap-2">
          {selectedTable?.activeOrder?.paymentStatus === "PAID" ? (
            <CustomButton
              variant="primary"
              size="sm"
              className="gap-1 font-bold bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-xl text-xs"
              onClick={() => selectedTable && onDownloadReceipt(selectedTable)}
            >
              <Download className="w-3.5 h-3.5" /> Download Official Receipt
            </CustomButton>
          ) : (
            <div />
          )}
          <CustomButton
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-xs font-bold"
          >
            Close
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

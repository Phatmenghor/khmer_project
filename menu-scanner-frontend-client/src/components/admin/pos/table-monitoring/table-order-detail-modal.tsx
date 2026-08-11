import React from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { formatCurrency } from "@/utils/common/currency-format";
import { TableMonitoringItem } from "@/features/business/store/models/type/table-monitoring-type";
import { LayoutGrid, Download } from "lucide-react";

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
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-0 overflow-hidden"
    >
      <FormHeader
        title={`Table #${selectedTable?.number || ""} - Active Order`}
        subtitle="Detailed order items & customer requests"
        avatarIcon={<LayoutGrid className="w-5 h-5 text-primary" />}
        showAvatar
      />

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Zone" value={selectedTable?.zone} />
          <InfoRow label="Seated Time" value={`${selectedTable?.seatedMinutes || 0} minutes ago`} />
          <InfoRow label="Order Number" value={`#${selectedTable?.activeOrder?.orderNumber || "-"}`} />
          <InfoRow label="Payment Status" value={selectedTable?.activeOrder?.paymentStatus || "UNPAID"} />
          <InfoRow label="Total Amount" value={formatCurrency(selectedTable?.activeOrder?.totalAmount || 0)} />
        </div>

        <SectionTitle>Order Items Summary</SectionTitle>
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
          <p className="text-xs text-foreground font-medium leading-relaxed">
            {selectedTable?.activeOrder?.itemsSummary}
          </p>
        </div>

        <div className="pt-4 border-t border-border flex justify-between gap-2">
          {selectedTable?.activeOrder?.paymentStatus === "PAID" ? (
            <CustomButton
              variant="primary"
              size="sm"
              className="gap-1 font-bold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => selectedTable && onDownloadReceipt(selectedTable)}
            >
              <Download className="w-3.5 h-3.5" /> Download Official Receipt
            </CustomButton>
          ) : (
            <div />
          )}
          <CustomButton variant="outline" size="sm" onClick={onClose}>
            Close
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

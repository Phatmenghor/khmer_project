import React from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { TableMonitoringItem } from "@/features/business/store/models/type/table-monitoring-type";
import { CreditCard, DollarSign, Receipt, Check } from "lucide-react";

interface SettleBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: TableMonitoringItem | null;
  paymentMethod: "CASH" | "CARD" | "ABA_KHQR";
  onSelectPaymentMethod: (method: "CASH" | "CARD" | "ABA_KHQR") => void;
  onConfirmPayment: () => void;
}

export const SettleBillModal: React.FC<SettleBillModalProps> = ({
  isOpen,
  onClose,
  selectedTable,
  paymentMethod,
  onSelectPaymentMethod,
  onConfirmPayment,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-0 overflow-hidden"
    >
      <FormHeader
        title={`Settle Bill - Table #${selectedTable?.number || ""}`}
        subtitle="Process payment for active dine-in customer"
        avatarIcon={<CreditCard className="w-5 h-5 text-amber-500" />}
        showAvatar
      />

      <div className="p-5 space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted-foreground">Order Ref:</span>
            <span className="font-bold text-foreground">{selectedTable?.activeOrder?.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Total Amount Due:</span>
            <span className="text-lg font-black text-primary">
              {formatCurrency(selectedTable?.activeOrder?.totalAmount || 0)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <CustomButton
              type="button"
              variant={paymentMethod === "ABA_KHQR" ? "primary" : "outline"}
              size="sm"
              className="h-14 flex-col gap-1 font-bold text-xs"
              onClick={() => onSelectPaymentMethod("ABA_KHQR")}
            >
              <Receipt className="w-4 h-4 text-primary" />
              ABA KHQR
            </CustomButton>
            <CustomButton
              type="button"
              variant={paymentMethod === "CASH" ? "primary" : "outline"}
              size="sm"
              className="h-14 flex-col gap-1 font-bold text-xs"
              onClick={() => onSelectPaymentMethod("CASH")}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Cash
            </CustomButton>
            <CustomButton
              type="button"
              variant={paymentMethod === "CARD" ? "primary" : "outline"}
              size="sm"
              className="h-14 flex-col gap-1 font-bold text-xs"
              onClick={() => onSelectPaymentMethod("CARD")}
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              Credit Card
            </CustomButton>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-2">
          <CustomButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" size="sm" className="gap-1 font-bold" onClick={onConfirmPayment}>
            <Check className="w-3.5 h-3.5" /> Complete Payment ({formatCurrency(selectedTable?.activeOrder?.totalAmount || 0)})
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectOrderAdminOperations,
  selectSelectedOrder,
} from "../store/selectors/order-admin-selector";
import {
  fetchOrderByIdAdminService,
  updateOrderAdminService,
} from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatus } from "@/enums/order-status.enum";
import { Loader2 } from "lucide-react";

interface OrderUpdateModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.CONFIRMED, label: "Confirmed" },
  { value: OrderStatus.PREPARING, label: "Preparing" },
  { value: OrderStatus.READY, label: "Ready" },
  { value: OrderStatus.IN_TRANSIT, label: "In Transit" },
  { value: OrderStatus.COMPLETED, label: "Completed" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
  { value: OrderStatus.FAILED, label: "Failed" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "ONLINE", label: "Online" },
  { value: "OTHER", label: "Other" },
];

export function OrderUpdateModal({
  orderId,
  isOpen,
  onClose,
}: OrderUpdateModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const operations = useAppSelector(selectOrderAdminOperations);
  const orderData = useAppSelector(selectSelectedOrder);

  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [businessNote, setBusinessNote] = useState("");

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (orderData) {
      setOrderStatus(orderData.orderStatus || "");
      setPaymentStatus(orderData.payment?.paymentStatus || "");
      setPaymentMethod(orderData.payment?.paymentMethod || "");
      setBusinessNote(orderData.businessNote || "");
    }
  }, [orderData]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await dispatch(
        updateOrderAdminService({
          orderId,
          orderData: {
            orderStatus: orderStatus || undefined,
            paymentStatus: paymentStatus || undefined,
            paymentMethod: paymentMethod || undefined,
            businessNote: businessNote || undefined,
          },
        })
      ).unwrap();

      showToast.success("Order updated successfully");
      handleClose();
    } catch (error: any) {
      showToast.error(error || "Failed to update order");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <FormHeader title="Update Order" onClose={handleClose} />

        {isFetchingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FormBody>
            <div className="space-y-4 px-6 pb-6">
              {orderData && (
                <p className="text-sm text-muted-foreground">
                  Order #{orderData.orderNumber}
                </p>
              )}

              {/* Order Status */}
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={setPaymentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Note */}
              <div className="space-y-2">
                <Label>Business Note</Label>
                <Textarea
                  value={businessNote}
                  onChange={(e) => setBusinessNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <CancelButton onClick={handleClose} />
                <SubmitButton
                  onClick={handleSubmit}
                  isSubmitting={operations.isUpdating}
                  label="Update Order"
                />
              </div>
            </div>
          </FormBody>
        )}
      </DialogContent>
    </Dialog>
  );
}

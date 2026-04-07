"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import {
  selectSelectedOrder,
  selectOrderAdminIsFetchingDetail,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";

// Validation schema
const updateOrderSchema = z.object({
  orderStatus: z.string().min(1, "Order status is required"),
  businessNote: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
});

type UpdateOrderData = z.infer<typeof updateOrderSchema>;

interface OrderUpdateModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "Cash", value: "CASH" },
  { label: "Card", value: "CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid", value: "PAID" },
  { label: "Unpaid", value: "UNPAID" },
  { label: "Pending", value: "PENDING" },
];

export function OrderUpdateModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderUpdateModalProps) {
  const dispatch = useAppDispatch();
  const orderData = useAppSelector(selectSelectedOrder);
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrderData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      orderStatus: "PENDING",
      businessNote: "",
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && orderData) {
      reset({
        orderStatus: orderData.orderStatus || "PENDING",
        businessNote: orderData.businessNote || "",
        paymentMethod: orderData.payment?.paymentMethod || "CASH",
        paymentStatus: orderData.payment?.paymentStatus || "PENDING",
      });
    }
  }, [isOpen, orderData, reset]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedOrder());
    onClose();
  };

  const onSubmit = async (data: UpdateOrderData) => {
    if (!orderId) return;

    setIsSaving(true);
    try {
      const updatePayload = {
        orderStatus: data.orderStatus,
        businessNote: data.businessNote,
        payment: {
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
        },
      };

      const response = await fetch(`/api/v1/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        showToast.success("✅ Order updated successfully!");
        if (onOrderUpdated) {
          onOrderUpdated();
        }
        handleClose();
      } else {
        const error = await response.json();
        showToast.error(error.message || "Failed to update order");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Error updating order");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 flex flex-col">
        <FormHeader
          title="Update Order"
          description="Update order status, payment, and notes"
          isCreate={false}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {/* Order Status */}
            <SelectField
              control={control}
              name="orderStatus"
              label="Order Status"
              placeholder="Select order status"
              options={ORDER_STATUS_OPTIONS}
              required
              disabled={isSaving || isFetchingDetail}
              error={errors.orderStatus}
            />

            {/* Payment Method */}
            <SelectField
              control={control}
              name="paymentMethod"
              label="Payment Method"
              placeholder="Select payment method"
              options={PAYMENT_METHOD_OPTIONS}
              required
              disabled={isSaving || isFetchingDetail}
              error={errors.paymentMethod}
            />

            {/* Payment Status */}
            <SelectField
              control={control}
              name="paymentStatus"
              label="Payment Status"
              placeholder="Select payment status"
              options={PAYMENT_STATUS_OPTIONS}
              required
              disabled={isSaving || isFetchingDetail}
              error={errors.paymentStatus}
            />

            {/* Business Note */}
            <TextField
              control={control}
              name="businessNote"
              label="Business Note"
              placeholder="Enter business note (optional)"
              required={false}
              disabled={isSaving || isFetchingDetail}
              error={errors.businessNote}
              multiline
              rows={4}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isSaving}
            isDirty={isDirty}
            isCreate={false}
            updateMessage={isSaving ? "Updating..." : "Updating order..."}
          >
            <CancelButton onClick={handleClose} disabled={isSaving} />
            <SubmitButton
              isSubmitting={isSaving}
              isDirty={isDirty}
              isCreate={false}
              updateText="Update Order"
              submittingUpdateText={isSaving ? "Updating..." : "Updating order..."}
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

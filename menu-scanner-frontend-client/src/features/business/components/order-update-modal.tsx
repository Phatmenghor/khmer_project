"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import {
  selectSelectedOrder,
  selectOrderAdminIsFetchingDetail,
} from "../store/selectors/order-admin-selector";
import { selectBusinessSettings } from "../store/selectors/business-settings-selector";
import { fetchOrderByIdAdminService, updateOrderAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import {
  deductOrderStock,
  formatStockDeductionItems,
} from "@/services/stock-management-service";

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
  { label: "Refunded", value: "REFUNDED" },
];

export function OrderUpdateModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderUpdateModalProps) {
  const dispatch = useAppDispatch();
  const orderData = useAppSelector(selectSelectedOrder);
  const businessSettings = useAppSelector(selectBusinessSettings);
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const [isSaving, setIsSaving] = useState(false);
  const [previousOrderStatus, setPreviousOrderStatus] = useState<string>("");

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
      paymentStatus: "UNPAID",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && orderData) {
      const currentStatus = orderData.orderStatus || "PENDING";
      setPreviousOrderStatus(currentStatus);
      reset({
        orderStatus: currentStatus,
        businessNote: "", // Starts empty so user can add a new remark for this status update
        paymentMethod: orderData.payment?.paymentMethod || "CASH",
        paymentStatus: orderData.payment?.paymentStatus || "UNPAID",
      });
    }
  }, [isOpen, orderData, reset]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedOrder());
    onClose();
  };

  const onSubmit = async (data: UpdateOrderData) => {
    if (!orderId || !orderData) return;

    setIsSaving(true);
    try {
      // Append new remark to existing businessNote if provided
      let finalBusinessNote = orderData.businessNote || "";
      if (data.businessNote && data.businessNote.trim()) {
        const newNote = data.businessNote.trim();
        finalBusinessNote = finalBusinessNote
          ? `${finalBusinessNote} | ${newNote}`
          : newNote;
      }

      const updatePayload = {
        orderStatus: data.orderStatus,
        businessNote: finalBusinessNote,
        payment: {
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
        },
      };

      const isStatusChanging = previousOrderStatus !== data.orderStatus;
      const isConfirmedOrCompleted = ["CONFIRMED", "COMPLETED"].includes(
        data.orderStatus
      );
      const shouldDeductStock =
        isStatusChanging &&
        isConfirmedOrCompleted &&
        businessSettings?.enableStock === "ENABLED" &&
        orderData.items?.length > 0;

      await dispatch(
        updateOrderAdminService({
          orderId,
          orderData: updatePayload,
        })
      ).unwrap();

      if (shouldDeductStock) {
        try {
          const stockItems = formatStockDeductionItems(orderData.items);
          const stockResult = await deductOrderStock({
            orderId,
            items: stockItems,
            reason: `Order status changed to ${data.orderStatus}`,
          });

          if (stockResult.success) {
            showToast.success(
              `Order updated and stock deducted! ${stockResult.message}`
            );
          } else {
            showToast.warning(
              `Order updated, but stock deduction had issues: ${stockResult.message}`
            );
          }
        } catch (stockError: any) {
          showToast.warning(
            `Order updated, but stock deduction failed: ${stockError.message}`
          );
        }
      } else {
        showToast.success(Messages.orders.updated);
      }

      if (onOrderUpdated) {
        onOrderUpdated();
      }
      handleClose();
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.upload.orderError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="default"
      disableScrollWrapper={true}
    >
      <FormHeader
        title="Update Order"
        description="Update order status, payment options, and remarks"
        isCreate={false}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0"
      >
        <FormBody className="space-y-3.5">
          {/* Order Status Selection */}
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

          {/* Payment Method & Status Row */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Remarks Textarea */}
          <TextareaField
            control={control}
            name="businessNote"
            label="Remarks"
            placeholder="Enter order remarks or internal notes..."
            disabled={isSaving || isFetchingDetail}
            error={errors.businessNote}
            rows={3}
          />
        </FormBody>

        <FormFooter
          isSubmitting={isSaving}
          isDirty={isDirty}
          isCreate={false}
          updateMessage={isSaving ? "Saving..." : "Update Order"}
        >
          <CancelButton onClick={handleClose} disabled={isSaving} />
          <SubmitButton
            isSubmitting={isSaving}
            isDirty={isDirty}
            isCreate={false}
            updateText="Update Order"
            submittingUpdateText="Saving..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}

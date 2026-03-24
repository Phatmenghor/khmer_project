"use client";

import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { OrderStatus } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";

// Define the form schema
const updateOrderSchema = z.object({
  orderStatus: z.string().min(1, "Order status is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  businessNote: z.string().optional(),
});

type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrderFormData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      orderStatus: "",
      paymentStatus: "",
      paymentMethod: "",
      businessNote: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (orderData) {
      reset({
        orderStatus: orderData.orderStatus || "",
        paymentStatus: orderData.payment?.paymentStatus || "",
        paymentMethod: orderData.payment?.paymentMethod || "",
        businessNote: orderData.businessNote || "",
      });
    }
  }, [orderData, reset]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedOrder());
    onClose();
  };

  const onSubmit = async (data: UpdateOrderFormData) => {
    try {
      await dispatch(
        updateOrderAdminService({
          orderId,
          orderData: {
            orderStatus: data.orderStatus || undefined,
            paymentStatus: data.paymentStatus || undefined,
            paymentMethod: data.paymentMethod || undefined,
            businessNote: data.businessNote || undefined,
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
      <DialogContent className="max-w-md">
        <FormHeader
          title="Update Order"
          description={
            orderData ? `Order #${orderData.orderNumber}` : "Loading order..."
          }
          isCreate={false}
        />

        {isFetchingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              <div className="space-y-4">
                <SelectField
                  control={control}
                  name="orderStatus"
                  label="Order Status"
                  placeholder="Select order status"
                  options={ORDER_STATUS_OPTIONS}
                  required
                  disabled={operations.isUpdating}
                  error={errors.orderStatus}
                />

                <SelectField
                  control={control}
                  name="paymentMethod"
                  label="Payment Method"
                  placeholder="Select payment method"
                  options={PAYMENT_METHOD_OPTIONS}
                  required
                  disabled={operations.isUpdating}
                  error={errors.paymentMethod}
                />

                <SelectField
                  control={control}
                  name="paymentStatus"
                  label="Payment Status"
                  placeholder="Select payment status"
                  options={PAYMENT_STATUS_OPTIONS}
                  required
                  disabled={operations.isUpdating}
                  error={errors.paymentStatus}
                />

                <TextareaField
                  control={control}
                  name="businessNote"
                  label="Business Note"
                  placeholder="Add any notes about this order..."
                  disabled={operations.isUpdating}
                  error={errors.businessNote}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={operations.isUpdating}
              isDirty={isDirty}
              isCreate={false}
              updateMessage="Updating order..."
            >
              <CancelButton onClick={handleClose} disabled={operations.isUpdating} />
              <SubmitButton
                isSubmitting={operations.isUpdating}
                label="Update"
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

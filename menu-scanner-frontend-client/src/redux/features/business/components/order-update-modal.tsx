"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectSelectedOrder,
  selectOrderAdminIsFetchingDetail,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { showToast } from "@/components/shared/common/show-toast";

interface OrderUpdateModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export function OrderUpdateModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderUpdateModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const orderData = useAppSelector(selectSelectedOrder);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNote: "",
    businessNote: "",
    paymentStatus: "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (orderData && isEditMode) {
      setFormData({
        customerName: orderData.customerName || "",
        customerPhone: orderData.customerPhone || "",
        customerEmail: orderData.customerEmail || "",
        customerNote: orderData.customerNote || "",
        businessNote: orderData.businessNote || "",
        paymentStatus: orderData.payment?.paymentStatus || "",
        paymentMethod: orderData.payment?.paymentMethod || "",
      });
    }
  }, [isEditMode, orderData]);

  const handleClose = () => {
    setIsEditMode(false);
    dispatch(clearSelectedOrder());
    onClose();
  };

  const handleSave = async () => {
    if (!orderId) return;
    setIsSaving(true);
    try {
      const updatePayload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerNote: formData.customerNote,
        businessNote: formData.businessNote,
        payment: {
          paymentStatus: formData.paymentStatus,
          paymentMethod: formData.paymentMethod,
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
        setIsEditMode(false);
        // Refresh the order data
        dispatch(fetchOrderByIdAdminService(orderId));
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } else {
        showToast.error("❌ Failed to update order");
      }
    } catch (error) {
      showToast.error("❌ Error updating order");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No order data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Order Details - {orderData.orderNumber}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Order Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {orderData.orderNumber}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!isEditMode ? (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  ✏️ Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? "Saving..." : "💾 Save"}
                  </Button>
                  <Button
                    onClick={() => setIsEditMode(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Customer Name
                        </label>
                        <Input
                          value={formData.customerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerName: e.target.value,
                            })
                          }
                          placeholder="Enter customer name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Phone Number
                        </label>
                        <Input
                          value={formData.customerPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerPhone: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Email
                        </label>
                        <Input
                          value={formData.customerEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerEmail: e.target.value,
                            })
                          }
                          placeholder="Enter email"
                          type="email"
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <DisplayField
                        label="Order Number"
                        value={orderData.orderNumber}
                      />
                      <DisplayField
                        label="Customer Name"
                        value={orderData.customerName || "---"}
                      />
                      <DisplayField
                        label="Phone Number"
                        value={orderData.customerPhone || "---"}
                      />
                      <DisplayField
                        label="Email"
                        value={orderData.customerEmail || "---"}
                      />
                      <DisplayField
                        label="Order Status"
                        value={getOrderStatusLabel(orderData.orderStatus)}
                      />
                      <DisplayField
                        label="Created At"
                        value={dateTimeFormat(orderData.createdAt)}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>💰 Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Subtotal"
                    value={formatCurrency(
                      orderData.pricing?.before?.subtotal || 0
                    )}
                  />
                  <DisplayField
                    label="Discount"
                    value={formatCurrency(
                      orderData.pricing?.before?.discountAmount || 0
                    )}
                  />
                  <DisplayField
                    label="Delivery Fee"
                    value={formatCurrency(
                      orderData.pricing?.before?.deliveryFee || 0
                    )}
                  />
                  <DisplayField
                    label="Tax"
                    value={formatCurrency(
                      orderData.pricing?.before?.taxAmount || 0
                    )}
                  />
                  <DisplayField
                    label="Final Total"
                    value={
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(
                          orderData.pricing?.before?.finalTotal || 0
                        )}
                      </span>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🛒 Order Items ({orderData.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-3"
                    >
                      <div className="flex gap-3">
                        {item.product?.imageUrl && (
                          <div className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            #{idx + 1} - {item.product?.name || "Unknown"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {item.before?.quantity || 0} × $
                            {(item.before?.finalPrice || 0).toFixed(2)} = $
                            {(item.before?.totalPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Delivery Information */}
            {orderData.deliveryAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>📍 Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Address"
                      value={
                        [
                          orderData.deliveryAddress.houseNumber,
                          orderData.deliveryAddress.streetNumber,
                          orderData.deliveryAddress.village,
                          orderData.deliveryAddress.commune,
                          orderData.deliveryAddress.district,
                          orderData.deliveryAddress.province,
                        ]
                          .filter(Boolean)
                          .join(", ") || "---"
                      }
                    />
                    <DisplayField
                      label="Delivery Method"
                      value={orderData.deliveryOption?.name || "---"}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>💳 Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Payment Method
                        </label>
                        <Input
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value,
                            })
                          }
                          placeholder="e.g., CASH"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Payment Status
                        </label>
                        <Input
                          value={formData.paymentStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentStatus: e.target.value,
                            })
                          }
                          placeholder="e.g., PAID"
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <DisplayField
                        label="Payment Method"
                        value={orderData.payment?.paymentMethod || "---"}
                      />
                      <DisplayField
                        label="Payment Status"
                        value={
                          <span
                            className={
                              orderData.payment?.paymentStatus === "PAID"
                                ? "text-green-600 font-medium"
                                : "text-orange-600 font-medium"
                            }
                          >
                            {orderData.payment?.paymentStatus || "---"}
                          </span>
                        }
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">
                        Customer Note
                      </label>
                      <textarea
                        value={formData.customerNote}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerNote: e.target.value,
                          })
                        }
                        placeholder="Customer note"
                        className="w-full mt-1 p-2 border border-input rounded-md text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">
                        Business Note
                      </label>
                      <textarea
                        value={formData.businessNote}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessNote: e.target.value,
                          })
                        }
                        placeholder="Business note"
                        className="w-full mt-1 p-2 border border-input rounded-md text-sm"
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <DisplayField
                      label="Customer Note"
                      value={orderData.customerNote || "---"}
                    />
                    <DisplayField
                      label="Business Note"
                      value={orderData.businessNote || "---"}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Order ID"
                    value={
                      <span className="text-xs font-mono break-all">
                        {orderData.id}
                      </span>
                    }
                  />
                  <DisplayField
                    label="Business"
                    value={orderData.businessName || "---"}
                  />
                  <DisplayField
                    label="Created At"
                    value={dateTimeFormat(orderData.createdAt)}
                  />
                  <DisplayField
                    label="Updated At"
                    value={dateTimeFormat(orderData.updatedAt)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

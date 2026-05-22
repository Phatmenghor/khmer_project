"use client";

import { memo } from "react";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { formatCurrency } from "@/utils/common/currency-format";

interface OrderHeaderProps {
  orderData: OrderResponse;
}

function OrderHeaderComponent({ orderData }: OrderHeaderProps) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-bold text-foreground">
          📋 Order & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Order Details */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
            Order Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DisplayField
              label="Order Number"
              value={orderData.orderNumber}
            />
            <DisplayField
              label="Order Type"
              value={
                orderData.source === "PUBLIC"
                  ? "Customer (Public)"
                  : "Business (POS)"
              }
            />
            <DisplayField
              label="Order Status"
              value={getOrderStatusLabel(orderData.orderStatus)}
            />
            <DisplayField
              label="Created At"
              value={dateTimeFormat(orderData.createdAt)}
            />
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
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-orange-600 dark:text-orange-400 font-medium"
                  }
                >
                  {orderData.payment?.paymentStatus || "---"}
                </span>
              }
            />
            <DisplayField
              label="Customer Name"
              value={
                <span className="font-semibold text-foreground">
                  {orderData.customerName || "Walk-in Customer"}
                </span>
              }
            />
            <DisplayField
              label="Phone Number"
              value={
                <a
                  href={`tel:${orderData.customerPhone}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  {orderData.customerPhone || "---"}
                </a>
              }
            />
            {orderData.customerNote && (
              <DisplayField
                label="Customer Note"
                value={orderData.customerNote}
              />
            )}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-3">
            Pricing Breakdown
          </h4>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-950/30 border border-amber-100 dark:border-amber-900 rounded p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <DisplayField
                  label="Items"
                  value={String(orderData.items?.length || 0)}
                />
                <DisplayField
                  label="Subtotal"
                  value={
                    <span className="font-semibold">
                      {formatCurrency(orderData.pricing?.subtotal || 0)}
                    </span>
                  }
                />
                {(orderData.pricing?.customizationTotal ?? 0) > 0 && (
                  <DisplayField
                    label="Customizations/Add-ons"
                    value={
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        +{formatCurrency(orderData.pricing!.customizationTotal)}
                      </span>
                    }
                  />
                )}
                <DisplayField
                  label="Delivery Fee"
                  value={formatCurrency(orderData.pricing?.deliveryFee || 0)}
                />
                {(orderData.pricing?.taxPercentage ?? 0) > 0 && (
                  <DisplayField
                    label={`Tax (${orderData.pricing?.taxPercentage}%)`}
                    value={
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        +{formatCurrency(orderData.pricing?.taxAmount || 0)}
                      </span>
                    }
                  />
                )}
                {(orderData.pricing?.discountAmount ?? 0) > 0 && (
                  <>
                    <DisplayField
                      label="Discount"
                      value={
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          -{formatCurrency(orderData.pricing!.discountAmount)}
                        </span>
                      }
                    />
                    {orderData.pricing?.discountType && (
                      <DisplayField
                        label="Discount Type"
                        value={
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {orderData.pricing.discountType === "PERCENTAGE"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </span>
                        }
                      />
                    )}
                    {orderData.pricing?.discountReason && (
                      <div className="md:col-span-2">
                        <DisplayField
                          label="Discount Reason"
                          value={orderData.pricing.discountReason}
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="md:col-span-2 border-t border-amber-100 dark:border-amber-900 pt-3 mt-2">
                  <DisplayField
                    label="Final Total"
                    value={
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(orderData.pricing?.finalTotal || 0)}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const OrderHeader = memo(OrderHeaderComponent);

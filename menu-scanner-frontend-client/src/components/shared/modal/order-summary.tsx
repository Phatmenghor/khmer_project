"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { OrderResponse } from "@/features/main/store/models/response/order-response";

interface OrderSummaryProps {
  orderData: OrderResponse;
}

function OrderSummaryComponent({ orderData }: OrderSummaryProps) {
  return (
    <>
      {/* Delivery Information */}
      {orderData.deliveryAddress && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg font-bold text-foreground">
              📍 Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">
                📫 Address & Delivery
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Full Address"
                  value={
                    <span className="text-sm">
                      {(() => {
                        const parts = [
                          orderData.deliveryAddress.houseNumber,
                          orderData.deliveryAddress.streetNumber,
                          orderData.deliveryAddress.village,
                          orderData.deliveryAddress.commune,
                          orderData.deliveryAddress.district,
                          orderData.deliveryAddress.province,
                        ].filter(Boolean);
                        return parts.length > 0 ? parts.join(", ") : "---";
                      })()}
                    </span>
                  }
                />
                {orderData.deliveryOption && (
                  <>
                    <DisplayField
                      label="Delivery Method"
                      value={orderData.deliveryOption.name || "---"}
                    />
                    <DisplayField
                      label="Delivery Fee"
                      value={formatCurrency(orderData.deliveryOption.price || 0)}
                    />
                  </>
                )}
                {orderData.deliveryAddress.note && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                      Delivery Note
                    </label>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-foreground flex-1">
                        {orderData.deliveryAddress.note}
                      </p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            const fullAddress = [
                              orderData.deliveryAddress.houseNumber,
                              orderData.deliveryAddress.streetNumber,
                              orderData.deliveryAddress.village,
                              orderData.deliveryAddress.commune,
                              orderData.deliveryAddress.district,
                              orderData.deliveryAddress.province,
                            ]
                              .filter(Boolean)
                              .join(", ");
                            navigator.clipboard.writeText(
                              `${fullAddress}\n\nDelivery Note: ${orderData.deliveryAddress.note}`
                            );
                            showToast.success(
                              Messages.clipboard.addressCopied
                            );
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/30 p-2 rounded transition-colors font-semibold"
                          title="Copy address and note"
                        >
                          📋 Copy
                        </button>
                        {orderData.deliveryAddress.latitude &&
                          orderData.deliveryAddress.longitude && (
                            <button
                              onClick={() => {
                                const mapsUrl = `https://www.google.com/maps?q=${orderData.deliveryAddress.latitude},${orderData.deliveryAddress.longitude}`;
                                window.open(mapsUrl, "_blank");
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/30 p-2 rounded transition-colors font-semibold"
                              title="View on Google Maps"
                            >
                              🗺️ Map
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      {orderData.statusHistory && orderData.statusHistory.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              📈 Status History ({orderData.statusHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderData.statusHistory.map((history, idx) => (
              <div
                key={history.id}
                className="text-sm border border-border rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Step {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {history.statusName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dateTimeFormat(history.changedAt)}
                  </span>
                </div>
                {history.note && (
                  <p className="text-xs text-muted-foreground mb-2 ml-1">
                    {history.note}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export const OrderSummary = memo(OrderSummaryComponent);

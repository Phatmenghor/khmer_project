"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";

interface OrderItemsProps {
  orderData: OrderResponse;
}

function OrderItemsComponent({ orderData }: OrderItemsProps) {
  if (!orderData.items || orderData.items.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-bold text-foreground">
          🛒 Order Items ({orderData.items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
          <h4 className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-4">
            Items List
          </h4>
          <div className="space-y-4">
            {orderData.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950/30"
              >
                {/* Item Header */}
                <div className="mb-3">
                  <div className="flex items-start gap-3">
                    {/* Image */}
                    {item.product?.imageUrl && (
                      <div className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover"
                        />
                      </div>
                    )}
                    {/* Name & Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          #{idx + 1} - {item.product?.name || "Unknown"}
                        </h4>
                      </div>
                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {item.product?.sizeName && (
                          <span>
                            Size:{" "}
                            <span className="font-medium">
                              {item.product.sizeName}
                            </span>
                          </span>
                        )}
                        {item.product?.sku && (
                          <span>
                            SKU:{" "}
                            <span className="font-mono font-medium text-foreground">
                              {item.product.sku}
                            </span>
                          </span>
                        )}
                        {item.product?.barcode && (
                          <span>
                            Barcode:{" "}
                            <span className="font-mono font-medium text-foreground">
                              {item.product.barcode}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Pricing */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  {/* Quantity */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">
                      Qty:
                    </span>
                    <p className="font-bold text-lg">{item.quantity}</p>
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">
                      Unit Price:
                    </span>
                    <p className="font-bold text-sm">
                      {formatCurrency(item.finalPrice)}
                    </p>
                  </div>

                  {/* Item Total */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">
                      Item Total:
                    </span>
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>

                  {/* Add-ons */}
                  {(item.customizationTotal ?? 0) > 0 && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-medium">
                        Add-ons:
                      </span>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        +{formatCurrency(item.customizationTotal ?? 0)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Customizations */}
                {item.customizations && item.customizations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 mt-3">
                    <h5 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-2">
                      ✨ Add-ons / Customizations
                    </h5>
                    <div className="space-y-1">
                      {item.customizations.map((custom, cidx) => (
                        <div key={cidx} className="flex justify-between text-xs">
                          <span className="text-foreground">{custom.name}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            +{formatCurrency(custom.priceAdjustment)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const OrderItems = memo(OrderItemsComponent);

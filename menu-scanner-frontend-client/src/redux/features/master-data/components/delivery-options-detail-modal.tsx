"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { DeliveryOptionsResponseModel } from "../store/models/response/delivery-options-response";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DetailModalProps {
  deliveryOptions: DeliveryOptionsResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryOptionsDetailModal({
  deliveryOptions,
  isOpen,
  onClose,
}: DetailModalProps) {
  const handleClose = () => {
    onClose();
  };

  if (!deliveryOptions) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <VisuallyHidden asChild>
          <DialogTitle>Delivery Options Details</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No delivery options data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <VisuallyHidden asChild>
        <DialogTitle>Delivery Options Details - {deliveryOptions.name}</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Delivery Options Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              {deliveryOptions.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Delivery Options Image */}
            {deliveryOptions.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={deliveryOptions.imageUrl}
                  alt={deliveryOptions.name}
                  className="max-w-sm max-h-96 rounded-lg border border-border object-cover"
                />
              </div>
            )}

            {/* Delivery Options Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Options Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Name"
                    value={deliveryOptions.name || "---"}
                  />
                  <DisplayField
                    label="Price"
                    value={deliveryOptions.price ? `$${deliveryOptions.price.toFixed(2)}` : "---"}
                  />
                  <DisplayField
                    label="Status"
                    value={formatEnumValue(deliveryOptions.status) || "---"}
                  />
                  <DisplayField
                    label="Business Name"
                    value={deliveryOptions.businessName || "---"}
                  />
                </div>

                {deliveryOptions.description && (
                  <div className="border-t pt-4">
                    <DisplayField
                      label="Description"
                      value={deliveryOptions.description}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Delivery Options ID" value={deliveryOptions.id} />
                  <DisplayField label="Business ID" value={deliveryOptions.businessId || "---"} />
                  <DisplayField
                    label="Created At"
                    value={dateTimeFormat(deliveryOptions.createdAt ?? "")}
                  />
                  <DisplayField label="Created By" value={deliveryOptions.createdBy || "---"} />
                  <DisplayField
                    label="Last Updated"
                    value={dateTimeFormat(deliveryOptions.updatedAt ?? "")}
                  />
                  <DisplayField label="Updated By" value={deliveryOptions.updatedBy || "---"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

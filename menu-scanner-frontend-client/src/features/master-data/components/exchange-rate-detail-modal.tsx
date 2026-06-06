"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import {
  formatKhrRate,
  formatExchangeRateStatus,
} from "@/utils/format/exchange-rate-formatter";
import { ExchangeRateResponseModel } from "../store/models/response/exchange-rate-response";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DetailModalProps {
  exchangeRate: ExchangeRateResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeRateDetailModal({
  exchangeRate,
  isOpen,
  onClose,
}: DetailModalProps) {
  const handleClose = () => {
    onClose();
  };

  if (!exchangeRate) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <VisuallyHidden asChild>
          <DialogTitle>Exchange Rate Details</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No exchange rate data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <VisuallyHidden asChild>
        <DialogTitle>Exchange Rate Details - {formatKhrRate(exchangeRate.usdToKhrRate)}</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-foreground">
              Exchange Rate Details
            </h2>
            <p className="text-xs text-foreground mt-1">
              {formatKhrRate(exchangeRate.usdToKhrRate)}
            </p>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Exchange Rate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="USD To KHR Rate"
                    value={formatKhrRate(exchangeRate.usdToKhrRate) || "---"}
                  />
                  <DisplayField
                    label="Status"
                    value={formatExchangeRateStatus(exchangeRate.status) || "---"}
                  />
                  <DisplayField label="Notes" value={exchangeRate.notes || "---"} />
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField label="Exchange Rate ID" value={exchangeRate.id} />
                  <DisplayField label="Business Name" value={exchangeRate.businessName || "---"} />
                  <DisplayField
                    label="Created At"
                    value={dateTimeFormat(exchangeRate.createdAt ?? "")}
                  />
                  <DisplayField label="Created By" value={exchangeRate.createdBy || "---"} />
                  <DisplayField
                    label="Last Updated"
                    value={dateTimeFormat(exchangeRate.updatedAt ?? "")}
                  />
                  <DisplayField label="Updated By" value={exchangeRate.updatedBy || "---"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

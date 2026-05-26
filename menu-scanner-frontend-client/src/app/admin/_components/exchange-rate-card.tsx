"use client";

import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExchangeRateResponseModel } from "@/features/master-data/store/models/response/exchange-rate-response";

interface ExchangeRateCardProps {
  activeRate: ExchangeRateResponseModel | undefined;
}

export function ExchangeRateCard({ activeRate }: ExchangeRateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Exchange Rates</CardTitle>
      </CardHeader>
      <CardContent>
        {!activeRate ? (
          <div className="flex flex-col items-center justify-center py-4 text-muted-foreground gap-1.5">
            <DollarSign className="h-7 w-7 opacity-30" />
            <p className="text-sm">No active rate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "USD → KHR", value: activeRate.usdToKhrRate, unit: "KHR" },
              { label: "USD → CNY", value: activeRate.usdToCnyRate, unit: "CNY" },
              { label: "USD → VND", value: activeRate.usdToVndRate, unit: "VND" },
            ].map((rate) => (
              <div key={rate.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{rate.label}</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {rate.value?.toLocaleString()} {rate.unit}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Badge variant="default" className="text-xs bg-emerald-500 text-white border-0">
                Active
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

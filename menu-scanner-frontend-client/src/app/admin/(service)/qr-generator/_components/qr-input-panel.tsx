"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QR_TYPE_OPTIONS, type QRConfig, type QRType } from "./use-qr-generator";

interface QRInputPanelProps {
  config: QRConfig;
  onUpdate: (updates: Partial<QRConfig>) => void;
}

export function QRInputPanel({ config, onUpdate }: QRInputPanelProps) {
  const needsShopId = config.type !== "custom";
  const needsTableNumber = config.type === "table";
  const needsProductId = config.type === "product";
  const isCustom = config.type === "custom";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">QR Type</Label>
          <Select
            value={config.type}
            onValueChange={(val) => onUpdate({ type: val as QRType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select QR type" />
            </SelectTrigger>
            <SelectContent>
              {QR_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          {needsShopId && (
            <div className="space-y-2">
              <Label htmlFor="shopId" className="text-xs font-medium text-foreground">
                Shop ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shopId"
                placeholder="Enter shop ID"
                value={config.shopId}
                onChange={(e) => onUpdate({ shopId: e.target.value })}
              />
            </div>
          )}

          {needsTableNumber && (
            <div className="space-y-2">
              <Label htmlFor="tableNumber" className="text-xs font-medium text-foreground">
                Table Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tableNumber"
                placeholder="e.g. 1, 2, A1"
                value={config.tableNumber}
                onChange={(e) => onUpdate({ tableNumber: e.target.value })}
              />
            </div>
          )}

          {needsProductId && (
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-xs font-medium text-foreground">
                Product ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productId"
                placeholder="Enter product ID"
                value={config.productId}
                onChange={(e) => onUpdate({ productId: e.target.value })}
              />
            </div>
          )}

          {isCustom && (
            <div className="space-y-2">
              <Label htmlFor="customUrl" className="text-xs font-medium text-foreground">
                Custom URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customUrl"
                type="url"
                placeholder="https://example.com/your-page"
                value={config.customUrl}
                onChange={(e) => onUpdate({ customUrl: e.target.value })}
              />
            </div>
          )}

          {!isCustom && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-xs font-medium text-foreground">
                  Domain
                </Label>
                <Input
                  id="domain"
                  placeholder="https://your-domain.com"
                  value={config.domain}
                  onChange={(e) => onUpdate({ domain: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Base domain used to build the QR URL
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

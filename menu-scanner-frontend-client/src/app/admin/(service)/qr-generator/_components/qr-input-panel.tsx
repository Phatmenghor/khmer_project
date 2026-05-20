"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QR_TYPE_OPTIONS, type QRConfig, type QRType } from "./use-qr-generator";

interface QRInputPanelProps {
  config: QRConfig;
  onUpdate: (updates: Partial<QRConfig>) => void;
}

function FieldRow({
  id,
  label,
  required,
  children,
  hint,
}: {
  id?: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function QRInputPanel({ config, onUpdate }: QRInputPanelProps) {
  const selectedLabel =
    QR_TYPE_OPTIONS.find((o) => o.value === config.type)?.label ?? "Select QR type";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Configuration</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── QR Type ── */}
        <FieldRow label="QR Type" required>
          <Select
            value={config.type}
            onValueChange={(val) => onUpdate({ type: val as QRType })}
          >
            <SelectTrigger className="w-full">
              <span className="text-sm truncate">{selectedLabel}</span>
            </SelectTrigger>
            <SelectContent>
              {QR_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm whitespace-nowrap">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      · {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <Separator />

        {/* ── URL Fields ── */}
        <div className="space-y-4">
          <FieldRow id="shopId" label="Shop ID" required>
            <Input
              id="shopId"
              placeholder="Enter shop ID"
              value={config.shopId}
              onChange={(e) => onUpdate({ shopId: e.target.value })}
            />
          </FieldRow>

          {config.type === "table" && (
            <FieldRow id="tableNumber" label="Table Number" required>
              <Input
                id="tableNumber"
                placeholder="e.g. 1, 2, A1"
                value={config.tableNumber}
                onChange={(e) => onUpdate({ tableNumber: e.target.value })}
              />
            </FieldRow>
          )}

          <Separator />

          <FieldRow
            id="domain"
            label="Domain"
            hint="Base domain used to build the QR URL"
          >
            <Input
              id="domain"
              placeholder="https://your-domain.com"
              value={config.domain}
              onChange={(e) => onUpdate({ domain: e.target.value })}
            />
          </FieldRow>
        </div>

        <Separator />

        {/* ── Card Display ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-foreground">Card Display</p>

          <FieldRow
            id="cardTitle"
            label="Shop / Business Name"
            required
            hint="Shown at the top of the QR card"
          >
            <Input
              id="cardTitle"
              placeholder="e.g. Mega Store, My Restaurant"
              value={config.cardTitle}
              onChange={(e) => onUpdate({ cardTitle: e.target.value })}
            />
          </FieldRow>

          <FieldRow
            id="cardSubtitle"
            label="Scan Instruction"
            hint="Text shown below the business name"
          >
            <Input
              id="cardSubtitle"
              placeholder="e.g. Scan to view our menu"
              value={config.cardSubtitle}
              onChange={(e) => onUpdate({ cardSubtitle: e.target.value })}
            />
          </FieldRow>
        </div>
      </CardContent>
    </Card>
  );
}

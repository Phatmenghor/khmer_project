"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { QrCode, UtensilsCrossed, Type, Sparkles, Tag, Layers, RefreshCw } from "lucide-react";
import { QR_TYPE_OPTIONS, type QRConfig, type QRType } from "./use-qr-generator";

interface QRInputPanelProps {
  config: QRConfig;
  onUpdate: (updates: Partial<QRConfig>) => void;
  businessNameFromSettings?: string;
}

export function QRInputPanel({ config, onUpdate, businessNameFromSettings }: QRInputPanelProps) {
  const typeOptions = QR_TYPE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: `${opt.label} (${opt.description})`,
  }));

  return (
    <Card className="border border-border shadow-2xs bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold text-foreground">QR Configuration</CardTitle>
              <p className="text-[11px] text-muted-foreground">Select type &amp; setup labels</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* ── QR Type ── */}
        <CustomSelect
          label="QR Type"
          required
          options={typeOptions}
          value={config.type}
          onValueChange={(val) => onUpdate({ type: val as QRType })}
          size="sm"
        />

        {/* ── Table Number Input (Shown when type is Table QR) ── */}
        {config.type === "table" && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/40 border border-border">
            <CustomInput
              label="Table Number"
              required
              placeholder="e.g. 1, 2, A1"
              value={config.tableNumber}
              onChange={(e) => onUpdate({ tableNumber: e.target.value })}
              leftIcon={<UtensilsCrossed className="w-3.5 h-3.5 text-primary" />}
              size="sm"
            />
          </div>
        )}

        <Separator />

        {/* ── Card Display Labels ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-foreground">Card Labels</p>
            </div>
            {businessNameFromSettings && config.cardTitle !== businessNameFromSettings && (
              <button
                type="button"
                onClick={() => onUpdate({ cardTitle: businessNameFromSettings })}
                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
                title="Reset to Business Name from Settings"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Use Business Setting Name
              </button>
            )}
          </div>

          <CustomInput
            label="Shop / Business Name"
            required
            placeholder={businessNameFromSettings || "e.g. Angkor Coffee"}
            value={config.cardTitle}
            onChange={(e) => onUpdate({ cardTitle: e.target.value })}
            leftIcon={<Tag className="w-3.5 h-3.5 text-muted-foreground" />}
            size="sm"
          />

          <CustomInput
            label="Subtitle"
            placeholder="e.g. Scan to view our menu"
            value={config.cardSubtitle}
            onChange={(e) => onUpdate({ cardSubtitle: e.target.value })}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
            size="sm"
          />

          <CustomInput
            label="Scan Button Text"
            placeholder="e.g. SCAN QR CODE"
            value={config.scanText}
            onChange={(e) => onUpdate({ scanText: e.target.value })}
            leftIcon={<Layers className="w-3.5 h-3.5 text-muted-foreground" />}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

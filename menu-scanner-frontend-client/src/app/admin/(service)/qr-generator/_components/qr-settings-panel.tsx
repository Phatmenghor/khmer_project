"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, X, Check } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { CARD_TEMPLATES, getTemplateConfig } from "./card-templates";
import type { QRStyle } from "./use-qr-generator";

interface QRSettingsPanelProps {
  style: QRStyle;
  onUpdate: (updates: Partial<QRStyle>) => void;
}

function ColorRow({
  id, label, value, onChange,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs font-medium text-foreground flex-1">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono uppercase tabular-nums">
          {value}
        </span>
        <div className="relative w-8 h-8 rounded border border-border shadow-sm overflow-hidden cursor-pointer" style={{ backgroundColor: value }}>
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export function QRSettingsPanel({ style, onUpdate }: QRSettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast.error("Upload a valid image file"); return; }
    if (file.size > 2 * 1024 * 1024)     { showToast.error("Image must be under 2MB");   return; }

    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ logoDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectTemplate = (id: typeof style.template) => {
    const tpl = getTemplateConfig(id);
    onUpdate({
      template: id,
      cardGradientFrom: tpl.gradientFrom,
      cardGradientTo:   tpl.gradientTo,
      primaryColor:     tpl.qrPrimaryColor,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ── Card Templates ──────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">Card Template</p>
          <div className="grid grid-cols-3 gap-2">
            {CARD_TEMPLATES.map((tpl) => {
              const isSelected = style.template === tpl.id;
              const isPrint    = tpl.id === "print-ready";
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                    isSelected ? "border-primary shadow-md scale-[1.03]" : "border-border hover:border-primary/40"
                  }`}
                  title={tpl.name}
                >
                  <div
                    className="h-10 w-full"
                    style={
                      isPrint
                        ? { background: "#fff", border: "2px solid #000" }
                        : { background: `linear-gradient(135deg, ${tpl.gradientFrom}, ${tpl.gradientTo})` }
                    }
                  >
                    {isPrint && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-black text-[10px] font-bold tracking-wider">B&amp;W</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted/80 px-1 py-0.5 text-center">
                    <span className="text-[10px] text-foreground leading-tight block truncate">
                      {tpl.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ── Colors ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">QR Colors</p>
          <ColorRow
            id="primaryColor"
            label="QR Dot Color"
            value={style.primaryColor}
            onChange={(v) => onUpdate({ primaryColor: v })}
          />
          <ColorRow
            id="backgroundColor"
            label="QR Background"
            value={style.backgroundColor}
            onChange={(v) => onUpdate({ backgroundColor: v })}
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">Card Header Colors</p>
          <ColorRow
            id="cardGradientFrom"
            label="Top Color"
            value={style.cardGradientFrom}
            onChange={(v) => onUpdate({ cardGradientFrom: v })}
          />
          <ColorRow
            id="cardGradientTo"
            label="Bottom Color"
            value={style.cardGradientTo}
            onChange={(v) => onUpdate({ cardGradientTo: v })}
          />
        </div>

        <Separator />

        {/* ── Logo (required) ─────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">
            Logo <span className="text-destructive">*</span>
          </p>

          {style.logoDataUrl ? (
            <div className="flex items-center gap-3 p-2 rounded-md border border-border bg-muted/40">
              {/* Circular preview */}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0 bg-white">
                <img
                  src={style.logoDataUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">Logo uploaded</p>
                <p className="text-xs text-muted-foreground">Shown in QR card</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 hover:text-destructive"
                onClick={() => onUpdate({ logoDataUrl: null })}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-destructive/40 py-5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs font-medium">Upload logo <span className="text-destructive">*</span></span>
              <span className="text-[11px] opacity-60">PNG, JPG up to 2MB</span>
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}

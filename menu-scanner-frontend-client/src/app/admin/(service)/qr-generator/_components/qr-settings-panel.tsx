"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, X, Check, Palette } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { CARD_TEMPLATES, getTemplateConfig } from "./card-templates";
import type { QRStyle } from "./use-qr-generator";

interface QRSettingsPanelProps {
  style: QRStyle;
  onUpdate: (updates: Partial<QRStyle>) => void;
}

/** Lighten a hex color by adding `amount` to each RGB channel. */
function lighten(hex: string, amount = 28): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, n));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ColorRow({
  id, label, value, onChange,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={id} className="text-xs font-medium text-foreground flex-1">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground font-mono uppercase tabular-nums">
          {value}
        </span>
        <div
          className="relative w-5 h-5 rounded border border-border shadow-sm overflow-hidden cursor-pointer"
          style={{ backgroundColor: value }}
        >
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
  const fileInputRef        = useRef<HTMLInputElement>(null);
  const customColorInputRef = useRef<HTMLInputElement>(null);

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
      template:         id,
      cardGradientFrom: tpl.gradientFrom,
      cardGradientTo:   tpl.gradientTo,
      primaryColor:     tpl.qrPrimaryColor,
    });
  };

  /** When user picks a custom color, derive a two-stop gradient from it. */
  const handleCustomColor = (color: string) => {
    onUpdate({
      template:         "custom",
      cardGradientFrom: color,
      cardGradientTo:   lighten(color, 28),
      primaryColor:     color,
    });
  };

  const isCustom = style.template === "custom";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold">QR Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3.5">

        {/* ── Card Template ────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Card Template</p>

          <div className="grid grid-cols-3 gap-1.5">
            {/* 4 preset templates */}
            {CARD_TEMPLATES.map((tpl) => {
              const isSelected = style.template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`relative rounded overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-primary shadow-md scale-[1.03]"
                      : "border-border hover:border-primary/40"
                  }`}
                  title={tpl.name}
                >
                  <div
                    className="h-7 w-full"
                    style={{ background: `linear-gradient(135deg, ${tpl.gradientFrom}, ${tpl.gradientTo})` }}
                  />
                  <div className="bg-muted/80 px-1 py-0.5 text-center">
                    <span className="text-[10px] text-foreground leading-tight block truncate">
                      {tpl.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-1.5.5 h-1.5.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Custom color picker swatch */}
            <div className="relative">
              <button
                type="button"
                onClick={() => customColorInputRef.current?.click()}
                className={`relative w-full rounded overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                  isCustom
                    ? "border-primary shadow-md scale-[1.03]"
                    : "border-border hover:border-primary/40"
                }`}
                title="Pick any color"
              >
                <div
                  className="h-7 w-full flex items-center justify-center"
                  style={
                    isCustom
                      ? { background: `linear-gradient(135deg, ${style.cardGradientFrom}, ${style.cardGradientTo})` }
                      : { background: "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)" }
                  }
                >
                  {!isCustom && <Palette className="w-3 h-3 text-white drop-shadow" />}
                </div>
                <div className="bg-muted/80 px-1 py-0.5 text-center">
                  <span className="text-[10px] text-foreground leading-tight block truncate">
                    Custom
                  </span>
                </div>
                {isCustom && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-1.5.5 h-1.5.5 text-white" />
                  </div>
                )}
              </button>
              {/* Hidden native color picker */}
              <input
                ref={customColorInputRef}
                type="color"
                value={isCustom ? style.cardGradientFrom : "#e11d48"}
                onChange={(e) => handleCustomColor(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Fine-tune colors for any template */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] text-muted-foreground font-medium">Customize colors</p>
            <ColorRow
              id="cardGradientFrom"
              label="Header Top"
              value={style.cardGradientFrom}
              onChange={(v) => onUpdate({ cardGradientFrom: v })}
            />
            <ColorRow
              id="cardGradientTo"
              label="Header Bottom"
              value={style.cardGradientTo}
              onChange={(v) => onUpdate({ cardGradientTo: v })}
            />
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
        </div>

        <Separator />

        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">
            Logo <span className="text-destructive">*</span>
          </p>

          {style.logoDataUrl ? (
            <>
              <div className="flex items-center gap-2 p-1.5 rounded border border-border bg-muted/40">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-border flex-shrink-0 bg-white">
                  <img
                    src={style.logoDataUrl}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">Logo uploaded</p>
                  <p className="text-xs text-muted-foreground">Shown in QR card &amp; center of QR</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0 hover:text-destructive"
                  onClick={() => onUpdate({ logoDataUrl: null })}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">Logo Size in QR</p>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Math.round(style.logoSize * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={style.logoSize}
                  onChange={(e) => onUpdate({ logoSize: parseFloat(e.target.value) })}
                  className="w-full h-1.5 cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-destructive/40 py-3.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
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

"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Separator } from "@/components/ui/separator";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { Check, Palette, SlidersHorizontal, Paintbrush } from "lucide-react";
import { CARD_TEMPLATES, getTemplateConfig } from "./card-templates";
import type { QRStyle } from "./use-qr-generator";

interface QRSettingsPanelProps {
  style: QRStyle;
  onUpdate: (updates: Partial<QRStyle>) => void;
}

/** Lighten a hex color by adding `amount` to each RGB channel. */
function lighten(hex: string, amount = 28): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, n));
  const r = clamp(parseInt(hex.slice(1, 3) || "00", 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5) || "00", 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7) || "00", 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ColorPickerRow({
  id, label, value, onChange,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <Label htmlFor={id} className="text-xs font-semibold text-foreground flex-1">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground font-mono uppercase tabular-nums">
          {value}
        </span>
        <div
          className="relative w-6 h-6 rounded-md border border-border shadow-xs overflow-hidden cursor-pointer transition-transform hover:scale-105"
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
  const customColorInputRef = useRef<HTMLInputElement>(null);

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
    <Card className="border border-border shadow-2xs bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-foreground">Style &amp; Branding</CardTitle>
            <p className="text-[11px] text-muted-foreground">Theme templates &amp; logo</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">

        {/* ── Card Template ────────────────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Paintbrush className="w-3.5 h-3.5 text-primary" /> Theme Template
            </p>
            <span className="text-[10px] font-semibold text-primary capitalize bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {style.template}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Preset templates */}
            {CARD_TEMPLATES.map((tpl) => {
              const isSelected = style.template === tpl.id;
              return (
                <CustomButton variant="unstyled" size="unstyled"
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`relative rounded-md overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-primary shadow-md scale-[1.02]"
                      : "border-border hover:border-primary/40"
                  }`}
                  title={tpl.name}
                >
                  <div
                    className="h-8 w-full"
                    style={{ background: `linear-gradient(135deg, ${tpl.gradientFrom}, ${tpl.gradientTo})` }}
                  />
                  <div className="bg-muted/80 px-1 py-0.5 text-center">
                    <span className="text-[10px] font-medium text-foreground leading-tight block truncate">
                      {tpl.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </CustomButton>
              );
            })}

            {/* Custom color picker swatch */}
            <div className="relative">
              <CustomButton variant="unstyled" size="unstyled"
                type="button"
                onClick={() => customColorInputRef.current?.click()}
                className={`relative w-full rounded-md overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                  isCustom
                    ? "border-primary shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/40"
                }`}
                title="Pick custom theme color"
              >
                <div
                  className="h-8 w-full flex items-center justify-center"
                  style={
                    isCustom
                      ? { background: `linear-gradient(135deg, ${style.cardGradientFrom}, ${style.cardGradientTo})` }
                      : { background: "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)" }
                  }
                >
                  {!isCustom && <Palette className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                </div>
                <div className="bg-muted/80 px-1 py-0.5 text-center">
                  <span className="text-[10px] font-medium text-foreground leading-tight block truncate">
                    Custom
                  </span>
                </div>
                {isCustom && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </CustomButton>
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

          {/* Fine-tune colors */}
          <div className="space-y-1 pt-2 p-2.5 rounded-lg bg-muted/40 border border-border">
            <p className="text-[11px] text-muted-foreground font-semibold mb-1">Fine-tune Theme Colors</p>
            <ColorPickerRow
              id="cardGradientFrom"
              label="Header Top"
              value={style.cardGradientFrom}
              onChange={(v) => onUpdate({ cardGradientFrom: v })}
            />
            <ColorPickerRow
              id="cardGradientTo"
              label="Header Bottom"
              value={style.cardGradientTo}
              onChange={(v) => onUpdate({ cardGradientTo: v })}
            />
            <ColorPickerRow
              id="primaryColor"
              label="QR Pattern Color"
              value={style.primaryColor}
              onChange={(v) => onUpdate({ primaryColor: v })}
            />
            <ColorPickerRow
              id="backgroundColor"
              label="QR Background"
              value={style.backgroundColor}
              onChange={(v) => onUpdate({ backgroundColor: v })}
            />
          </div>
        </div>

        <Separator />

        {/* ── Logo Branding using ClickableImageUpload (1x1 Display) ── */}
        <div className="space-y-3">
          <ClickableImageUpload
            label="Center Logo Branding (1x1)"
            value={style.logoDataUrl || ""}
            onChange={(base64) => onUpdate({ logoDataUrl: base64 || null })}
            aspectRatio="square"
            height="h-32"
            width="w-32"
            placeholder="Upload 1x1 Logo"
            helperText="PNG, JPG (1:1 Ratio)"
            showPreviewText={false}
          />

          {style.logoDataUrl && (
            <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Logo Size Scale</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {Math.round(style.logoSize * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={style.logoSize}
                onChange={(e) => onUpdate({ logoSize: parseFloat(e.target.value) })}
                className="w-full h-1.5 cursor-pointer accent-primary bg-background border border-border rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Subtle (10%)</span>
                <span>Prominent (40%)</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

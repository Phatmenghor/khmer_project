"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, X } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import type { QRStyle } from "./use-qr-generator";

interface QRSettingsPanelProps {
  style: QRStyle;
  onUpdate: (updates: Partial<QRStyle>) => void;
}

interface ColorPickerRowProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPickerRow({ id, label, value, onChange }: ColorPickerRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs font-medium text-foreground flex-1">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono uppercase">
          {value}
        </span>
        <div className="relative">
          <div
            className="w-8 h-8 rounded border border-border cursor-pointer overflow-hidden shadow-sm"
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
    </div>
  );
}

export function QRSettingsPanel({ style, onUpdate }: QRSettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({ logoDataUrl: dataUrl, logoEnabled: true });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    onUpdate({ logoDataUrl: null, logoEnabled: false });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">
              Size
            </Label>
            <span className="text-xs text-muted-foreground font-mono">
              {style.size}px
            </span>
          </div>
          <input
            type="range"
            min={200}
            max={600}
            step={10}
            value={style.size}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-secondary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>200px</span>
            <span>600px</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">Colors</p>
          <ColorPickerRow
            id="primaryColor"
            label="QR Color"
            value={style.primaryColor}
            onChange={(val) => onUpdate({ primaryColor: val })}
          />
          <ColorPickerRow
            id="backgroundColor"
            label="Background"
            value={style.backgroundColor}
            onChange={(val) => onUpdate({ backgroundColor: val })}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Logo</p>
            {style.logoDataUrl && (
              <Switch
                checked={style.logoEnabled}
                onCheckedChange={(checked) => onUpdate({ logoEnabled: checked })}
              />
            )}
          </div>

          {style.logoDataUrl ? (
            <div className="flex items-center gap-3 p-2 rounded-md border border-border bg-muted/40">
              <div className="w-10 h-10 rounded overflow-hidden border border-border flex-shrink-0 bg-white">
                <img
                  src={style.logoDataUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  Logo uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                  {style.logoEnabled ? "Visible in QR" : "Hidden"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 hover:text-destructive"
                onClick={handleRemoveLogo}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs font-medium">Upload logo</span>
              <span className="text-xs opacity-70">PNG, JPG up to 2MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}

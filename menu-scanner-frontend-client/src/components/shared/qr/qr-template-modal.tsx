"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { useEffect, useState } from "react";
import { X, QrCode } from "lucide-react";
import { QRGenerator } from "./qr-generator";

export interface QRTemplateModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  businessName: string;
  subtitle?: string;
  logoUrl?: string | null;
}

function parsePrimary(raw: string): { color: string; from: string; to: string } {
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 3) {
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    return {
      color: `hsl(${h}, ${s}%, ${l}%)`,
      from: `hsl(${h}, ${s}%, ${l}%)`,
      to: `hsl(${h}, ${s}%, ${Math.max(0, l - 12)}%)`,
    };
  }
  return { color: "#57823D", from: "#57823D", to: "#3C5A2A" };
}

export function QRTemplateModal({
  open,
  onClose,
  url,
  businessName,
  subtitle = "Scan to view our menu",
  logoUrl,
}: QRTemplateModalProps) {
  const [colors, setColors] = useState(() => parsePrimary("97 36% 37%"));

  useEffect(() => {
    if (!open) return;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    setColors(parsePrimary(raw));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg bg-background rounded shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <div className="flex items-center gap-1">
            <QrCode className="w-3 h-3 text-primary" />
            <span className="font-semibold text-xs text-foreground">QR Code</span>
          </div>
          <CustomButton variant="unstyled" size="unstyled"
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </CustomButton>
        </div>

        <div className="p-3">
          <QRGenerator
            link={url}
            businessName={businessName}
            subtitle={subtitle}
            logoUrl={logoUrl}
            gradFrom={colors.from}
            gradTo={colors.to}
            primaryColor={colors.color}
            maxWidth={440}
            showDownload={true}
            showCopy={true}
            showShare={true}
          />
        </div>
      </div>
    </div>
  );
}

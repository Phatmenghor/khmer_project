"use client";

import { useEffect, useState } from "react";
import { QrCode, Copy, Check, Share2, Download } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QRGenerator, QRGeneratorActionsProps } from "./qr-generator";

export interface QRTemplateModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  businessName: string;
  subtitle?: string;
  logoUrl?: string | null;
}

interface ThemeColors {
  color: string;
  from: string;
  to: string;
}

function parsePrimary(raw: string): ThemeColors {
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 3) {
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    const mainColor = `hsl(${h}, ${s}%, ${l}%)`;
    const darkColor = `hsl(${h}, ${s}%, ${Math.max(0, l - 12)}%)`;
    return {
      color: mainColor,
      from: mainColor,
      to: darkColor,
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
  const [colors, setColors] = useState<ThemeColors>(() => parsePrimary("97 36% 37%"));
  const [actionProps, setActionProps] = useState<QRGeneratorActionsProps | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary");
      if (raw) {
        setColors(parsePrimary(raw));
      }
    } catch {
      setColors({ color: "#57823D", from: "#57823D", to: "#3C5A2A" });
    }
  }, [open]);

  return (
    <CustomModal isOpen={open} onClose={onClose} size="md">
      {/* ── Fixed Header ── */}
      <div className="flex items-center justify-between p-4 px-5 border-b border-border/80 bg-background shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Digital Storefront QR Code</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scan, print, or download your custom menu QR card
            </p>
          </div>
        </div>
      </div>

      {/* ── Fully Visible QR Image Body ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center justify-center bg-card/40 backdrop-blur-xs">
        <QRGenerator
          link={url}
          businessName={businessName}
          subtitle={subtitle}
          logoUrl={logoUrl}
          gradFrom={colors.from}
          gradTo={colors.to}
          primaryColor={colors.color}
          maxWidth={280}
          showDownload={true}
          showCopy={true}
          showShare={true}
          onActionsReady={setActionProps}
        />
      </div>

      {/* ── Custom Styled Footer Bar ── */}
      {actionProps && (
        <div className="p-4 px-5 border-t border-border/80 bg-background/95 backdrop-blur-md flex items-center justify-end gap-2 shrink-0">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={actionProps.onCopyUrl}
            disabled={!actionProps.link}
            className="gap-1.5 font-bold"
          >
            {actionProps.copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {actionProps.copied ? "Copied!" : "Copy URL"}
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={actionProps.onShare}
            disabled={!actionProps.link}
            className="gap-1.5 font-bold"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            size="sm"
            onClick={actionProps.onDownload}
            disabled={actionProps.downloading || !actionProps.link}
            isLoading={actionProps.downloading}
            className="gap-1.5 font-bold min-w-[130px]"
          >
            <Download className="w-3.5 h-3.5" />
            {actionProps.downloading ? "Saving..." : "Download Card"}
          </CustomButton>
        </div>
      )}
    </CustomModal>
  );
}

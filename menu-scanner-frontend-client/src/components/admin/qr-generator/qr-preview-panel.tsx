"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";
import { QRGenerator } from "@/components/shared/qr/qr-generator";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";
import { useState } from "react";
import { showToast } from "@/components/shared/common/show-toast";
import { CustomButton } from "@/components/shared/button/custom-button";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const qrUrl = generateQRUrl(config);

  const headerFrom = style.cardGradientFrom;
  const headerTo = style.cardGradientTo;
  const bgColor = style.backgroundColor || "#ffffff";

  const getDisplayTitle = () => {
    if (config.type === "table") {
      return `${config.cardTitle || "Business"} - Table ${config.tableNumber || 1}`;
    }
    return config.cardTitle || "Your Business Name";
  };

  const displaySubtitle = config.cardSubtitle || "Scan to view our menu";
  const displayScanText = config.scanText || "SCAN QR CODE";

  const handleCopyUrl = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      showToast.success("QR URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy URL");
    }
  };

  return (
    <Card className="flex flex-col border border-border shadow-2xs bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold text-foreground">Live QR Preview</CardTitle>
              <p className="text-[11px] text-muted-foreground">Real-time print &amp; scan view</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 flex-1 pt-4">
        {/* Unified QR generator */}
        <div className="w-full flex justify-center py-1">
          <QRGenerator
            link={qrUrl}
            businessName={getDisplayTitle()}
            subtitle={displaySubtitle}
            logoUrl={style.logoDataUrl}
            logoSize={style.logoSize}
            scanText={displayScanText}
            gradFrom={headerFrom}
            gradTo={headerTo}
            primaryColor={style.primaryColor}
            bgColor={bgColor}
            maxWidth={320}
            showDownload={true}
            showCopy={true}
            showShare={false}
          />
        </div>

        {/* Target URL card */}
        <div className="w-full rounded-lg border border-border bg-muted/40 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target URL
            </span>
            <CustomButton
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] font-medium gap-1 text-primary hover:bg-primary/10"
              onClick={handleCopyUrl}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy Link"}
            </CustomButton>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground bg-background p-2 rounded border border-border/80 break-all select-all">
            <ExternalLink className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{qrUrl}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

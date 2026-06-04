"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { QRGenerator } from "@/components/shared/qr/qr-generator";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const qrUrl = generateQRUrl(config);
  const effectiveUrl = qrUrl || "https://your-domain.com/preview";

  const headerFrom = style.cardGradientFrom;
  const headerTo = style.cardGradientTo;
  const bgColor = style.backgroundColor || "#ffffff";

  const displayTitle = config.cardTitle || "Your Business Name";
  const displaySubtitle = config.cardSubtitle || "Scan to view our menu";
  const displayScanText = config.scanText || "SCAN QR CODE";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <QrCode className="w-3 h-3 text-primary" />
          <CardTitle className="text-xs font-semibold">QR Preview</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-3 flex-1">
        {/* Unified QR generator — same component as modal */}
        <QRGenerator
          link={effectiveUrl}
          businessName={displayTitle}
          subtitle={displaySubtitle}
          logoUrl={style.logoDataUrl}
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

        {/* URL display info */}
        {qrUrl ? (
          <div className="w-full rounded border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground break-all leading-relaxed">
            {qrUrl}
          </div>
        ) : (
          <div className="w-full rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700 text-center">
            Complete required fields to generate a valid URL
          </div>
        )}
      </CardContent>
    </Card>
  );
}

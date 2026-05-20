"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Download, QrCode } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<InstanceType<any> | null>(null);
  const [copied, setCopied] = useState(false);

  const qrUrl = generateQRUrl(config);
  const effectiveUrl = qrUrl || "https://your-domain.com/preview";

  const buildQROptions = useCallback(
    () => ({
      width: style.size,
      height: style.size,
      data: effectiveUrl,
      image:
        style.logoEnabled && style.logoDataUrl ? style.logoDataUrl : undefined,
      qrOptions: { errorCorrectionLevel: "H" as const },
      dotsOptions: { color: style.primaryColor, type: "square" as const },
      backgroundOptions: { color: style.backgroundColor },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 6,
        imageSize: 0.3,
        hideBackgroundDots: true,
      },
    }),
    [effectiveUrl, style]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let cancelled = false;

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return;

      const opts = buildQROptions();

      if (qrInstanceRef.current) {
        qrInstanceRef.current.update(opts);
      } else {
        qrInstanceRef.current = new QRCodeStyling(opts);
        qrInstanceRef.current.append(containerRef.current);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [buildQROptions]);

  const handleDownload = (extension: "png" | "svg") => {
    if (!qrInstanceRef.current || !qrUrl) {
      showToast.error("Generate a valid QR code first");
      return;
    }
    qrInstanceRef.current.download({
      name: `qr-${config.type}`,
      extension,
    });
  };

  const handleCopyUrl = async () => {
    if (!qrUrl) {
      showToast.error("No URL to copy — fill in all required fields");
      return;
    }
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      showToast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy URL");
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Preview</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 flex-1">
        <div className="relative flex items-center justify-center w-full rounded-lg border border-border bg-white p-6 min-h-[340px]">
          <div
            ref={containerRef}
            className={qrUrl ? "block" : "opacity-20 pointer-events-none"}
          />
          {!qrUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <QrCode className="w-14 h-14 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Fill in the required fields
                <br />
                to generate a QR code
              </p>
            </div>
          )}
        </div>

        {qrUrl ? (
          <div className="w-full rounded-md border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground break-all">
            {qrUrl}
          </div>
        ) : (
          <div className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 text-center">
            Complete all required fields to get a valid URL
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy URL"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("png")}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            PNG
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("svg")}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

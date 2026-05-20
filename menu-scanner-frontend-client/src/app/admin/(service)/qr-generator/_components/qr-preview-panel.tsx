"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Download, QrCode, Scan, Layers } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";
import { downloadQRCard } from "./card-templates";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

const PREVIEW_QR_SIZE = 240;

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const [copied, setCopied]       = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  const qrUrl       = generateQRUrl(config);
  const effectiveUrl = qrUrl || "https://your-domain.com/preview";

  const isPrint = style.template === "print-ready";
  const headerFrom = style.cardGradientFrom;
  const headerTo   = style.cardGradientTo;

  // Build QR options for the preview (fixed display size)
  const buildQROptions = useCallback(
    () => ({
      width:  PREVIEW_QR_SIZE,
      height: PREVIEW_QR_SIZE,
      data:   effectiveUrl,
      image:  style.logoEnabled && style.logoDataUrl ? style.logoDataUrl : undefined,
      qrOptions: { errorCorrectionLevel: "H" as const },
      dotsOptions: {
        color: style.primaryColor,
        type: "rounded" as const,
      },
      cornersSquareOptions: {
        type: "extra-rounded" as const,
        color: style.primaryColor,
      },
      cornersDotOptions: { color: style.primaryColor },
      backgroundOptions: { color: style.backgroundColor },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
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

    return () => { cancelled = true; };
  }, [buildQROptions]);

  // Download only the QR graphic (no card frame)
  const handleDownloadQR = async (extension: "png" | "svg") => {
    if (!qrUrl) {
      showToast.error("Fill in all required fields first");
      return;
    }
    try {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      const tempQR = new QRCodeStyling({ ...buildQROptions(), width: style.size, height: style.size });
      await tempQR.download({ name: `qr-${config.type}`, extension });
    } catch {
      showToast.error("Failed to download QR");
    }
  };

  // Download the full card (canvas-rendered)
  const handleDownloadCard = async () => {
    if (!qrUrl) {
      showToast.error("Fill in all required fields first");
      return;
    }
    setCardLoading(true);
    try {
      await downloadQRCard(qrInstanceRef.current, config, style);
      showToast.success("Card downloaded!");
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || "Failed to download card");
    } finally {
      setCardLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!qrUrl) {
      showToast.error("Fill in all required fields first");
      return;
    }
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      showToast.success("URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy URL");
    }
  };

  const displayTitle    = config.cardTitle    || "Your Business Name";
  const displaySubtitle = config.cardSubtitle || "Scan to view our menu";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Preview</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-5 flex-1">

        {/* ── QR Card Preview ────────────────────────────────── */}
        <div className="w-full flex justify-center">
          <div
            className="w-full max-w-[340px] overflow-hidden shadow-2xl"
            style={{ borderRadius: "24px" }}
          >
            {isPrint ? (
              /* ── Print-ready template ──────────────────────── */
              <div className="bg-white border-[3px] border-black rounded-[22px] overflow-hidden">
                {/* Top stripe */}
                <div className="h-2 bg-black" />

                <div className="px-6 py-5 flex flex-col items-center gap-4">
                  {/* Logo */}
                  {style.logoEnabled && style.logoDataUrl ? (
                    <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-white flex-shrink-0">
                      <img src={style.logoDataUrl} alt="logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center">
                      <QrCode className="w-7 h-7 text-black" />
                    </div>
                  )}

                  {/* Title */}
                  <div className="text-center">
                    <p className="font-bold text-base text-black leading-tight">{displayTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{displaySubtitle}</p>
                  </div>

                  {/* Dashed separator */}
                  <div className="w-full border-t-2 border-dashed border-black/40" />

                  {/* QR */}
                  <div
                    className="relative border-2 border-black rounded-xl overflow-hidden p-2 bg-white"
                  >
                    <div
                      ref={containerRef}
                      className={qrUrl ? "block" : "opacity-25 pointer-events-none"}
                    />
                    {!qrUrl && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                      >
                        <QrCode className="w-8 h-8 text-gray-300" />
                        <p className="text-xs text-gray-400 text-center px-2">Enter fields to generate</p>
                      </div>
                    )}
                  </div>

                  {/* Scan text */}
                  <p className="text-xs font-bold text-black tracking-widest uppercase">
                    Scan QR Code
                  </p>
                </div>

                {/* Bottom stripe */}
                <div className="h-1.5 bg-black" />
              </div>
            ) : (
              /* ── Gradient template ────────────────────────── */
              <div>
                {/* Header */}
                <div
                  className="relative px-5 pt-5 pb-10 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})`,
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 160, height: 160,
                      right: -40, top: -40,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 80, height: 80,
                      right: 10, top: 60,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />

                  {/* Top row */}
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    {style.logoEnabled && style.logoDataUrl ? (
                      <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 overflow-hidden p-1 flex-shrink-0">
                        <img src={style.logoDataUrl} alt="logo" className="w-full h-full object-contain rounded-lg" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                        <QrCode className="w-5 h-5 text-white/80" />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
                      <span className="text-white/90 text-[11px] font-semibold tracking-wide">QR</span>
                    </div>
                  </div>

                  {/* Title block */}
                  <div className="relative z-10">
                    <h2 className="text-white font-bold text-base leading-tight tracking-wide line-clamp-2">
                      {displayTitle}
                    </h2>
                    <p className="text-white/65 text-xs mt-0.5 font-light line-clamp-1">
                      {displaySubtitle}
                    </p>
                  </div>
                </div>

                {/* Wave connector */}
                <div
                  className="h-6 -mt-5 z-10 relative"
                  style={{
                    background: style.backgroundColor || "#ffffff",
                    borderRadius: "2rem 2rem 0 0",
                    boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
                  }}
                />

                {/* QR area */}
                <div
                  className="px-5 pb-5 flex flex-col items-center gap-3 -mt-1"
                  style={{ background: style.backgroundColor || "#ffffff" }}
                >
                  {/* QR box */}
                  <div
                    className="rounded-2xl overflow-hidden shadow-md p-3 bg-white"
                  >
                    <div
                      ref={containerRef}
                      className={qrUrl ? "block" : "opacity-20 pointer-events-none"}
                    />
                    {!qrUrl && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none"
                        style={{ width: PREVIEW_QR_SIZE + 24, height: PREVIEW_QR_SIZE + 24, position: "relative" }}
                      >
                        <QrCode className="w-10 h-10 text-gray-300" />
                        <p className="text-xs text-gray-400 text-center px-4">Enter fields to generate</p>
                      </div>
                    )}
                  </div>

                  {/* Scan row */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <Scan className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Scan QR Code</span>
                    <Scan className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-2.5 flex items-center justify-between"
                  style={{ background: `${headerFrom}14` }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                      <QrCode className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">eMenu</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    {[0.25, 0.55, 0.85].map((op, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: headerFrom, opacity: op }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── URL display ────────────────────────────────────── */}
        {qrUrl ? (
          <div className="w-full rounded-lg border bg-muted px-3 py-2.5 font-mono text-xs text-muted-foreground break-all leading-relaxed">
            {qrUrl}
          </div>
        ) : (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 text-center">
            Complete required fields to generate a valid URL
          </div>
        )}

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadQR("png")}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            QR PNG
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadQR("svg")}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            QR SVG
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadCard}
            disabled={!qrUrl || cardLoading}
            className="flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            {cardLoading ? "Generating…" : "Download Card"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

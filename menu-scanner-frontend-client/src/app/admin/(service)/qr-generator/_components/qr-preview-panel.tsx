"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Download, QrCode, Scan } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";
import { downloadQRCard } from "./card-templates";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

const PREVIEW_QR_SIZE = 220;

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const [copied, setCopied]           = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  const qrUrl        = generateQRUrl(config);
  const effectiveUrl = qrUrl || "https://your-domain.com/preview";

  const isPrint    = style.template === "print-ready";
  const headerFrom = style.cardGradientFrom;
  const headerTo   = style.cardGradientTo;
  const bgColor    = style.backgroundColor || "#ffffff";

  const buildQROptions = useCallback(
    () => ({
      width:  PREVIEW_QR_SIZE,
      height: PREVIEW_QR_SIZE,
      data:   effectiveUrl,
      image:  style.logoEnabled && style.logoDataUrl ? style.logoDataUrl : undefined,
      qrOptions:           { errorCorrectionLevel: "H" as const },
      dotsOptions:         { color: style.primaryColor, type: "rounded" as const },
      cornersSquareOptions: { type: "extra-rounded" as const, color: style.primaryColor },
      cornersDotOptions:   { color: style.primaryColor },
      backgroundOptions:   { color: style.backgroundColor },
      imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: 0.3, hideBackgroundDots: true },
    }),
    [effectiveUrl, style],
  );

  // Keep QR instance synced; containerRef div is ALWAYS rendered at the same
  // tree position so the canvas element is never detached on template switch.
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

  const handleDownloadCard = async () => {
    if (!qrUrl) { showToast.error("Fill in all required fields first"); return; }
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
    if (!qrUrl) { showToast.error("Fill in all required fields first"); return; }
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

        {/* ── QR Card Preview ──────────────────────────────────────────────── */}
        <div className="w-full flex justify-center">
          <div
            className="w-full overflow-hidden shadow-2xl"
            style={{
              maxWidth: 320,
              borderRadius: isPrint ? 22 : 24,
              border: isPrint ? "3px solid #000" : "none",
            }}
          >
            {/* TOP STRIPE — print only */}
            {isPrint && <div style={{ height: 8, background: "#000" }} />}

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            {isPrint ? (
              <div style={{
                background: "#fff",
                padding: "16px 20px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                {style.logoEnabled && style.logoDataUrl ? (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #000", overflow: "hidden", background: "#fff", flexShrink: 0 }}>
                    <img src={style.logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode style={{ width: 26, height: 26, color: "#000" }} />
                  </div>
                )}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#000", lineHeight: 1.3, margin: 0 }}>{displayTitle}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{displaySubtitle}</p>
                </div>
              </div>
            ) : (
              <div style={{
                background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})`,
                padding: "16px 16px 32px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", width: 140, height: 140, right: -30, top: -30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 70, height: 70, right: 10, top: 50, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

                {/* Top row: logo + QR badge */}
                <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  {style.logoEnabled && style.logoDataUrl ? (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", overflow: "hidden", padding: 3, flexShrink: 0 }}>
                      <img src={style.logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <QrCode style={{ width: 18, height: 18, color: "rgba(255,255,255,0.8)" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>QR</span>
                  </div>
                </div>

                {/* Title block */}
                <div style={{ position: "relative", zIndex: 10 }}>
                  <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.3, margin: 0 }}>{displayTitle}</h2>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2, fontWeight: 300, margin: "2px 0 0" }}>{displaySubtitle}</p>
                </div>
              </div>
            )}

            {/* ── SEPARATOR ──────────────────────────────────────────────── */}
            {isPrint ? (
              <div style={{ margin: "0 20px", borderTop: "2px dashed rgba(0,0,0,0.3)" }} />
            ) : (
              <div style={{
                height: 20,
                marginTop: -16,
                background: bgColor,
                borderRadius: "1.5rem 1.5rem 0 0",
                boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
              }} />
            )}

            {/* ── QR AREA — containerRef is ALWAYS at this fixed tree position ── */}
            <div style={{
              background: isPrint ? "#fff" : bgColor,
              padding: isPrint ? "10px 16px 16px" : "0 16px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              marginTop: isPrint ? 0 : -4,
            }}>
              <div style={{
                position: "relative",
                borderRadius: isPrint ? 10 : 14,
                border: isPrint ? "2px solid #000" : "none",
                boxShadow: isPrint ? "none" : "0 4px 16px rgba(0,0,0,0.1)",
                padding: isPrint ? 6 : 10,
                background: "#fff",
              }}>
                {/* ↓ This div NEVER moves in the React tree — QR canvas appends here once */}
                <div
                  ref={containerRef}
                  className={qrUrl ? "block" : "opacity-20 pointer-events-none"}
                />
                {!qrUrl && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 4,
                    pointerEvents: "none",
                  }}>
                    <QrCode style={{ width: 36, height: 36, color: "#d1d5db" }} />
                    <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>Enter fields to generate</p>
                  </div>
                )}
              </div>

              {/* Scan text */}
              {isPrint ? (
                <p style={{ fontSize: 10, fontWeight: 700, color: "#000", letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>Scan QR Code</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af" }}>
                  <Scan style={{ width: 12, height: 12 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase" }}>Scan QR Code</span>
                  <Scan style={{ width: 12, height: 12 }} />
                </div>
              )}
            </div>

            {/* ── FOOTER — gradient templates only ───────────────────────── */}
            {!isPrint && (
              <div style={{
                padding: "8px 16px",
                background: `${headerFrom}20`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode style={{ width: 9, height: 9 }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>eMenu</span>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[0.25, 0.55, 0.85].map((op, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: headerFrom, opacity: op, display: "inline-block" }} />
                  ))}
                </div>
              </div>
            )}

            {/* BOTTOM STRIPE — print only */}
            {isPrint && <div style={{ height: 6, background: "#000" }} />}
          </div>
        </div>

        {/* ── URL display ─────────────────────────────────────────────────── */}
        {qrUrl ? (
          <div className="w-full rounded-lg border bg-muted px-3 py-2.5 font-mono text-xs text-muted-foreground break-all leading-relaxed">
            {qrUrl}
          </div>
        ) : (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 text-center">
            Complete required fields to generate a valid URL
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────────── */}
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
            variant="default"
            size="sm"
            onClick={handleDownloadCard}
            disabled={!qrUrl || cardLoading}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {cardLoading ? "Generating…" : "Download Card"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

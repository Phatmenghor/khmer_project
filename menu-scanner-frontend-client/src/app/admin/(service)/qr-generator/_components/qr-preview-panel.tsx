"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Download, QrCode, Scan } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { generateQRUrl, type QRConfig, type QRStyle } from "./use-qr-generator";

interface QRPreviewPanelProps {
  config: QRConfig;
  style: QRStyle;
}

const PREVIEW_QR_SIZE = 220;

export function QRPreviewPanel({ config, style }: QRPreviewPanelProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const cardRef       = useRef<HTMLDivElement>(null);   // ← element we screenshot
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
      image:  style.logoDataUrl ?? undefined,
      qrOptions:            { errorCorrectionLevel: "H" as const },
      dotsOptions:          { color: style.primaryColor, type: "rounded" as const },
      cornersSquareOptions: { type: "extra-rounded" as const, color: style.primaryColor },
      cornersDotOptions:    { color: style.primaryColor },
      backgroundOptions:    { color: style.backgroundColor },
      imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: style.logoSize, hideBackgroundDots: true },
    }),
    [effectiveUrl, style],
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

  // Screenshot the preview card element — html2canvas captures exactly what is shown.
  // The QR code is a <canvas> drawn by qr-code-styling; html2canvas cannot re-process
  // third-party canvases, so we extract it as a PNG data URL in `onclone` and replace
  // it with an <img> before the screenshot pass runs.
  const handleDownloadCard = async () => {
    if (!qrUrl)           { showToast.error("Fill in all required fields first"); return; }
    if (!cardRef.current) { showToast.error("Preview not ready"); return; }
    setCardLoading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      const snapshot = await html2canvas(cardRef.current!, {
        scale: 3,               // 3× → ~960px wide, print-quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (_doc, el) => {
          // Convert every <canvas> inside the cloned card to an <img> so
          // html2canvas doesn't try to re-process qr-code-styling's canvas.
          el.querySelectorAll("canvas").forEach((c) => {
            try {
              const dataUrl = (c as HTMLCanvasElement).toDataURL("image/png");
              const img = document.createElement("img");
              img.src           = dataUrl;
              img.style.width   = c.clientWidth  + "px";
              img.style.height  = c.clientHeight + "px";
              img.style.display = "block";
              c.parentNode?.replaceChild(img, c);
            } catch { /* tainted canvas — html2canvas handles it */ }
          });

          const S = 3; // match html2canvas scale

          // ── QR badge (pill with green dot + "QR") ───────────────────────
          const badge = el.querySelector("[data-dl='qr-badge']") as HTMLElement | null;
          if (badge) {
            const W = 44, H = 20;
            const bc = document.createElement("canvas");
            bc.width = W * S; bc.height = H * S;
            const bx = bc.getContext("2d")!;
            bx.scale(S, S);
            bx.beginPath();
            bx.roundRect(0.5, 0.5, W - 1, H - 1, 10);
            bx.fillStyle = "rgba(255,255,255,0.15)";
            bx.fill();
            bx.strokeStyle = "rgba(255,255,255,0.2)";
            bx.lineWidth = 1;
            bx.stroke();
            bx.beginPath();
            bx.arc(11, H / 2, 2.5, 0, Math.PI * 2);
            bx.fillStyle = "#34d399";
            bx.fill();
            bx.fillStyle = "rgba(255,255,255,0.9)";
            bx.font = "600 9px system-ui,-apple-system,sans-serif";
            bx.textBaseline = "middle";
            bx.fillText("QR", 18, H / 2);
            const bimg = document.createElement("img");
            bimg.src = bc.toDataURL();
            bimg.style.cssText = `width:${W}px;height:${H}px;display:block;flex-shrink:0;`;
            badge.replaceWith(bimg);
          }

          // ── eMenu (icon square + label) ──────────────────────────────────
          const emenu = el.querySelector("[data-dl='emenu']") as HTMLElement | null;
          if (emenu) {
            const label = "eMenu";
            const tmpC = document.createElement("canvas");
            const tmpX = tmpC.getContext("2d")!;
            tmpX.font = "500 10px system-ui,-apple-system,sans-serif";
            const tw = tmpX.measureText(label).width;
            const W = Math.ceil(14 + 5 + tw) + 2, H = 14;
            const ec = document.createElement("canvas");
            ec.width = W * S; ec.height = H * S;
            const ex = ec.getContext("2d")!;
            ex.scale(S, S);
            ex.beginPath();
            ex.roundRect(0, 0, 14, 14, 3);
            ex.fillStyle = "rgba(0,0,0,0.18)";
            ex.fill();
            ex.fillStyle = "#64748b";
            ex.font = "500 10px system-ui,-apple-system,sans-serif";
            ex.textBaseline = "middle";
            ex.fillText(label, 19, H / 2);
            const eimg = document.createElement("img");
            eimg.src = ec.toDataURL();
            eimg.style.cssText = `width:${W}px;height:${H}px;display:block;`;
            emenu.replaceWith(eimg);
          }

          // ── SCAN row (corner-bracket icons + centered text) ──────────────
          const scanRow = el.querySelector("[data-dl='scan-row']") as HTMLElement | null;
          if (scanRow) {
            const scanText = (scanRow.getAttribute("data-scan-text") || "SCAN QR CODE").toUpperCase();
            const iconSz = 12, gap = 6, H = 18;

            // Measure text width with same font + letter-spacing as CSS
            const tmpC = document.createElement("canvas");
            const tmpX = tmpC.getContext("2d")!;
            tmpX.font = "600 10px system-ui,-apple-system,sans-serif";
            (tmpX as any).letterSpacing = "3px";
            const textW = tmpX.measureText(scanText).width;
            const W = Math.ceil(iconSz + gap + textW + gap + iconSz) + 4;

            const sc = document.createElement("canvas");
            sc.width = W * S; sc.height = H * S;
            const sx = sc.getContext("2d")!;
            sx.scale(S, S);

            const cy = H / 2;
            const iconColor = "#9ca3af";
            const cornerLen = iconSz * 0.33;
            const lw = 1.5;

            const drawCorners = (ox: number) => {
              const oy = cy - iconSz / 2;
              sx.strokeStyle = iconColor;
              sx.lineWidth = lw;
              sx.lineCap = "round";
              sx.lineJoin = "round";
              // TL
              sx.beginPath(); sx.moveTo(ox + cornerLen, oy); sx.lineTo(ox, oy); sx.lineTo(ox, oy + cornerLen); sx.stroke();
              // TR
              sx.beginPath(); sx.moveTo(ox + iconSz - cornerLen, oy); sx.lineTo(ox + iconSz, oy); sx.lineTo(ox + iconSz, oy + cornerLen); sx.stroke();
              // BL
              sx.beginPath(); sx.moveTo(ox, oy + iconSz - cornerLen); sx.lineTo(ox, oy + iconSz); sx.lineTo(ox + cornerLen, oy + iconSz); sx.stroke();
              // BR
              sx.beginPath(); sx.moveTo(ox + iconSz, oy + iconSz - cornerLen); sx.lineTo(ox + iconSz, oy + iconSz); sx.lineTo(ox + iconSz - cornerLen, oy + iconSz); sx.stroke();
            };

            const leftX = 2;
            const textX = leftX + iconSz + gap;
            const rightX = textX + Math.ceil(textW) + gap;

            drawCorners(leftX);

            sx.fillStyle = "#6b7280";
            sx.font = "600 10px system-ui,-apple-system,sans-serif";
            (sx as any).letterSpacing = "3px";
            sx.textBaseline = "middle";
            sx.fillText(scanText, textX, cy);

            drawCorners(rightX);

            const simg = document.createElement("img");
            simg.src = sc.toDataURL();
            simg.style.cssText = `width:${W}px;height:${H}px;display:inline-block;vertical-align:top;`;
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "width:100%;text-align:center;line-height:0;font-size:0;";
            wrapper.appendChild(simg);
            scanRow.replaceWith(wrapper);
          }
        },
      });

      await new Promise<void>((resolve, reject) => {
        snapshot.toBlob((blob) => {
          if (!blob) { reject(new Error("No blob produced")); return; }
          const url = URL.createObjectURL(blob);
          const a   = document.createElement("a");
          a.href     = url;
          a.download = `qr-card-${config.cardTitle || config.type}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast.success("Card downloaded!");
          resolve();
        }, "image/png");
      });
    } catch (err) {
      console.error("[QR download]", err);
      showToast.error("Failed to download card — please try again");
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
  const displayScanText = config.scanText     || "SCAN QR CODE";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">QR Preview</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-5 flex-1">

        {/* ── QR Card — ref for screenshot ─────────────────────────────── */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-full overflow-hidden shadow-2xl"
            style={{
              maxWidth: 320,
              borderRadius: 0,
              border: isPrint ? "3px solid #000" : "none",
            }}
          >
            {/* TOP STRIPE — print only */}
            {isPrint && <div style={{ height: 8, background: "#000" }} />}

            {/* ── HEADER ─────────────────────────────────────────────── */}
            {isPrint ? (
              /* Print: logo circle + title + subtitle centered */
              <div style={{
                background: "#fff",
                padding: "20px 20px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                {style.logoDataUrl ? (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", boxShadow: "0 0 0 2px #000", overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: "100%", height: "100%", backgroundImage: `url(${style.logoDataUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#fff" }} />
                  </div>
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode style={{ width: 28, height: 28, color: "#000" }} />
                  </div>
                )}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#000", lineHeight: 1.3, margin: 0 }}>{displayTitle}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: "3px 0 0", textAlign: "center" }}>{displaySubtitle}</p>
                </div>
              </div>
            ) : (
              /* Gradient: wave cap lives INSIDE header as absolute element */
              <div style={{
                background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})`,
                padding: "12px 14px 30px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", width: 160, height: 160, right: -40, top: -40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 80,  height: 80,  right: 10,  top: 60,  borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

                {/* Top row: Logo LEFT — QR badge RIGHT */}
                <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  {style.logoDataUrl ? (
                    <div style={{ width: 44, height: 44, borderRadius: "50%", boxShadow: "0 0 0 2px rgba(255,255,255,0.6)", overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ width: "100%", height: "100%", backgroundImage: `url(${style.logoDataUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#fff" }} />
                    </div>
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <QrCode style={{ width: 20, height: 20, color: "rgba(255,255,255,0.8)", display: "block" }} />
                    </div>
                  )}
                  {/* QR badge — flex for preview; onclone rewrites with position:absolute for download */}
                  <div data-dl="qr-badge" style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.5px", color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>QR</span>
                  </div>
                </div>

                {/* Title + subtitle below logo row */}
                <div style={{ position: "relative", zIndex: 10 }}>
                  <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3, margin: 0 }}>{displayTitle}</h2>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 3, fontWeight: 300 }}>{displaySubtitle}</p>
                </div>

                {/* White rounded cap — absolute at bottom of header */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 20,
                  background: bgColor,
                  borderRadius: "1.25rem 1.25rem 0 0",
                }} />
              </div>
            )}

            {/* Print dashed separator */}
            {isPrint && (
              <div style={{ margin: "0 20px", borderTop: "2px dashed rgba(0,0,0,0.2)" }} />
            )}

            {/* ── QR AREA — containerRef never moves in the tree ─────── */}
            <div style={{
              background: isPrint ? "#fff" : bgColor,
              padding: isPrint ? "10px 16px 16px" : "0 12px 12px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                position: "relative",
                borderRadius: isPrint ? 10 : 14,
                border: isPrint ? "2px solid #000" : "none",
                boxShadow: isPrint ? "none" : "0 4px 20px rgba(0,0,0,0.1)",
                padding: isPrint ? 6 : 6,
                background: "#fff",
              }}>
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
                    <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>
                      Enter fields to generate
                    </p>
                  </div>
                )}
              </div>

              {/* Scan text */}
              {isPrint ? (
                <p style={{ width: "100%", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#000", letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
                  {displayScanText}
                </p>
              ) : (
                <div data-dl="scan-row" data-scan-text={displayScanText} style={{ width: "100%", textAlign: "center", lineHeight: 1 }}>
                  <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: 0, marginRight: 6 }}>
                    <Scan style={{ width: 12, height: 12, display: "block", color: "#9ca3af" }} />
                  </span>
                  <span style={{ display: "inline-block", verticalAlign: "middle", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", lineHeight: 1 }}>
                    {displayScanText}
                  </span>
                  <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: 0, marginLeft: 6 }}>
                    <Scan style={{ width: 12, height: 12, display: "block", color: "#9ca3af" }} />
                  </span>
                </div>
              )}
            </div>

            {/* ── FOOTER — gradient only ──────────────────────────────── */}
            {!isPrint && (
              <div style={{
                padding: "8px 16px",
                background: `${headerFrom}20`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {/* eMenu — flex for preview; onclone rewrites for download */}
                <div data-dl="emenu" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(0,0,0,0.18)", flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500, lineHeight: 1 }}>eMenu</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {[0.25, 0.55, 0.85].map((op, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: headerFrom, opacity: op, display: "block", flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            )}

            {/* BOTTOM STRIPE — print only */}
            {isPrint && <div style={{ height: 6, background: "#000" }} />}
          </div>
        </div>

        {/* ── URL display ──────────────────────────────────────────────── */}
        {qrUrl ? (
          <div className="w-full rounded-lg border bg-muted px-3 py-2.5 font-mono text-xs text-muted-foreground break-all leading-relaxed">
            {qrUrl}
          </div>
        ) : (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 text-center">
            Complete required fields to generate a valid URL
          </div>
        )}

        {/* ── Buttons ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <Button
            variant="outline" size="sm"
            onClick={handleCopyUrl}
            disabled={!qrUrl}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL"}
          </Button>

          <Button
            variant="default" size="sm"
            onClick={handleDownloadCard}
            disabled={!qrUrl || cardLoading}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {cardLoading ? "Capturing…" : "Download Card"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

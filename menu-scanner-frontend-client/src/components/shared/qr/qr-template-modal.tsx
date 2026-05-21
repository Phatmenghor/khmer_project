"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, Share2, QrCode, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QRTemplateModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  businessName: string;
  subtitle?: string;
}

const QR_SIZE = 200;

function parsePrimary(raw: string): { color: string; from: string; to: string } {
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 3) {
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    return {
      color: `hsl(${h}, ${s}%, ${l}%)`,
      from:  `hsl(${h}, ${s}%, ${l}%)`,
      to:    `hsl(${h}, ${s}%, ${Math.max(0, l - 12)}%)`,
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
}: QRTemplateModalProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const cardRef       = useRef<HTMLDivElement>(null);
  const qrRef         = useRef<any>(null);
  const [colors, setColors]       = useState(() => parsePrimary("97 36% 37%"));
  const [downloading, setDownloading] = useState(false);

  // Read --primary once when modal opens
  useEffect(() => {
    if (!open) return;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    setColors(parsePrimary(raw));
  }, [open]);

  const buildOptions = useCallback(
    () => ({
      width:  QR_SIZE,
      height: QR_SIZE,
      data:   url || "https://emenu.kh",
      qrOptions:            { errorCorrectionLevel: "H" as const },
      dotsOptions:          { color: colors.color, type: "rounded" as const },
      cornersSquareOptions: { color: colors.color, type: "extra-rounded" as const },
      cornersDotOptions:    { color: colors.color },
      backgroundOptions:    { color: "#ffffff" },
      imageOptions:         { crossOrigin: "anonymous", margin: 4 },
    }),
    [url, colors.color],
  );

  useEffect(() => {
    if (!open || !containerRef.current) return;
    let cancelled = false;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return;
      const opts = buildOptions();
      if (qrRef.current) {
        qrRef.current.update(opts);
      } else {
        qrRef.current = new QRCodeStyling(opts);
        qrRef.current.append(containerRef.current);
      }
    });
    return () => { cancelled = true; };
  }, [open, buildOptions]);

  // Clean up QR instance when modal unmounts
  useEffect(() => {
    if (!open) {
      qrRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    }
  }, [open]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const snapshot = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (_doc, el) => {
          // Convert qr-code-styling <canvas> → <img> so html2canvas captures it
          el.querySelectorAll("canvas").forEach((c) => {
            try {
              const dataUrl = (c as HTMLCanvasElement).toDataURL("image/png");
              const img = document.createElement("img");
              img.src           = dataUrl;
              img.style.width   = c.clientWidth  + "px";
              img.style.height  = c.clientHeight + "px";
              img.style.display = "block";
              c.parentNode?.replaceChild(img, c);
            } catch { /* tainted canvas — leave as-is */ }
          });
        },
      });
      await new Promise<void>((resolve) => {
        snapshot.toBlob((blob) => {
          if (!blob) { resolve(); return; }
          const dlUrl = URL.createObjectURL(blob);
          const a     = document.createElement("a");
          a.href      = dlUrl;
          a.download  = `qr-card-${businessName.replace(/\s+/g, "-").toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(dlUrl);
          resolve();
        }, "image/png");
      });
    } catch (err) {
      console.error("[QRTemplateModal download]", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: businessName, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  if (!open) return null;

  const { from, to } = colors;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-sm bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">QR Code</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">

          {/* ── Card template (captured by html2canvas for download) ── */}
          <div
            ref={cardRef}
            className="w-full overflow-hidden shadow-xl"
            style={{ maxWidth: 300, borderRadius: 16 }}
          >
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${from}, ${to})`,
              padding: "14px 16px 32px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", width: 160, height: 160, right: -40, top: -40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", width: 80,  height: 80,  right: 10,  top: 60,  borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

              {/* Logo icon + QR badge */}
              <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <QrCode style={{ width: 18, height: 18, color: "rgba(255,255,255,0.8)", display: "block" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>QR</span>
                </div>
              </div>

              {/* Business name + subtitle */}
              <div style={{ position: "relative", zIndex: 10 }}>
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3, margin: 0 }}>{businessName}</h2>
                <p  style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 3, fontWeight: 300, margin: "3px 0 0" }}>{subtitle}</p>
              </div>

              {/* Rounded white cap into QR area */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: "#ffffff", borderRadius: "1.25rem 1.25rem 0 0" }} />
            </div>

            {/* QR area */}
            <div style={{ background: "#ffffff", padding: "4px 16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 8, background: "#fff" }}>
                <div ref={containerRef} />
              </div>

              {/* Scan row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Scan style={{ width: 11, height: 11, color: "#9ca3af", display: "block" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase" }}>
                  SCAN QR CODE
                </span>
                <Scan style={{ width: 11, height: 11, color: "#9ca3af", display: "block" }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "8px 16px",
              background: `${from}22`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(0,0,0,0.15)", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500, lineHeight: 1 }}>eMenu</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[0.25, 0.55, 0.85].map((op, i) => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: from, opacity: op, display: "block", flexShrink: 0 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Saving…" : "Download"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={handleShare}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

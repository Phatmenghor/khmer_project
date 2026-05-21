"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCardTemplate } from "./qr-card-template";

export interface QRTemplateModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  businessName: string;
  subtitle?: string;
  logoUrl?: string | null;
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
  logoUrl,
}: QRTemplateModalProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const cardRef        = useRef<HTMLDivElement>(null);
  const qrRef          = useRef<any>(null);
  const [colors, setColors]           = useState(() => parsePrimary("97 36% 37%"));
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
    if (!open || !qrContainerRef.current) return;
    let cancelled = false;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !qrContainerRef.current) return;
      const opts = buildOptions();
      if (qrRef.current) {
        qrRef.current.update(opts);
      } else {
        qrRef.current = new QRCodeStyling(opts);
        qrRef.current.append(qrContainerRef.current);
      }
    });
    return () => { cancelled = true; };
  }, [open, buildOptions]);

  // Reset QR instance when modal closes
  useEffect(() => {
    if (!open) {
      qrRef.current = null;
      if (qrContainerRef.current) qrContainerRef.current.innerHTML = "";
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
          // Convert qr-code-styling <canvas> → <img> so html2canvas captures it correctly
          el.querySelectorAll("canvas").forEach((c) => {
            try {
              const dataUrl = (c as HTMLCanvasElement).toDataURL("image/png");
              const img     = document.createElement("img");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
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
          {/* Shared card template */}
          <QRCardTemplate
            cardRef={cardRef}
            qrContainerRef={qrContainerRef}
            gradFrom={colors.from}
            gradTo={colors.to}
            title={businessName}
            subtitle={subtitle}
            logoUrl={logoUrl}
            hasContent={!!url}
            maxWidth={380}
          />

          {/* Actions */}
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

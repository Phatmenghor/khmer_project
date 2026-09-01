"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QRCardTemplate } from "./qr-card-template";
import { showToast } from "@/components/shared/common/show-toast";

export interface QRCardWithDownloadProps {
  /** The URL to encode in the QR code */
  link: string;
  /** Business name for the card title */
  businessName: string;
  /** Subtitle text, defaults to "Scan to view our menu" */
  subtitle?: string;
  /** Logo URL shown in the top-left circle */
  logoUrl?: string | null;
  /** Text shown in the scan row, defaults to "SCAN QR CODE" */
  scanText?: string;
  /** Gradient start color for the header */
  gradFrom: string;
  /** Gradient end color for the header */
  gradTo: string;
  /** Primary color for QR dots */
  primaryColor: string;
  /** Background color for the card */
  bgColor?: string;
  /** Max width of the card */
  maxWidth?: number;
  /** Show download + copy buttons */
  showActions?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** When false, shows an empty-state overlay on the QR area */
  hasContent?: boolean;
}

export function QRCardWithDownload({
  link,
  businessName,
  subtitle = "Scan to view our menu",
  logoUrl,
  scanText = "SCAN QR CODE",
  gradFrom,
  gradTo,
  primaryColor,
  bgColor = "#ffffff",
  maxWidth = 320,
  showActions = true,
  showShare = true,
  hasContent = true,
}: QRCardWithDownloadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const QR_SIZE = 220;

  const buildQROptions = useCallback(
    () => ({
      width: QR_SIZE,
      height: QR_SIZE,
      data: link || "https://emenu.kh",
      qrOptions: { errorCorrectionLevel: "H" as const },
      dotsOptions: { color: primaryColor, type: "rounded" as const },
      cornersSquareOptions: { color: primaryColor, type: "extra-rounded" as const },
      cornersDotOptions: { color: primaryColor },
      backgroundOptions: { color: bgColor },
      imageOptions: { crossOrigin: "anonymous", margin: 4 },
    }),
    [link, primaryColor, bgColor],
  );

  useEffect(() => {
    if (!containerRef.current) return;
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

  const handleDownload = async () => {
    if (!link) {
      showToast.error("Fill in all required fields first");
      return;
    }
    if (!cardRef.current) {
      showToast.error("Card not ready");
      return;
    }

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
          // Convert every <canvas> inside the cloned card to an <img>
          el.querySelectorAll("canvas").forEach((c) => {
            try {
              const dataUrl = (c as HTMLCanvasElement).toDataURL("image/png");
              const img = document.createElement("img");
              img.src = dataUrl;
              img.style.width = c.clientWidth + "px";
              img.style.height = c.clientHeight + "px";
              img.style.display = "block";
              c.parentNode?.replaceChild(img, c);
            } catch {
              /* tainted canvas — html2canvas handles it */
            }
          });

          const S = 3; // match html2canvas scale

          // ── QR badge (pill with green dot + "QR") ───────────────────────
          const badge = el.querySelector("[data-dl='qr-badge']") as HTMLElement | null;
          if (badge) {
            const W = 44,
              H = 20;
            const bc = document.createElement("canvas");
            bc.width = W * S;
            bc.height = H * S;
            const bx = bc.getContext("2d")!;
            bx.scale(S, S);
            bx.beginPath();
            (bx as any).roundRect(0.5, 0.5, W - 1, H - 1, 10);
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
            const W = Math.ceil(14 + 5 + tw) + 2,
              H = 14;
            const ec = document.createElement("canvas");
            ec.width = W * S;
            ec.height = H * S;
            const ex = ec.getContext("2d")!;
            ex.scale(S, S);
            ex.beginPath();
            (ex as any).roundRect(0, 0, 14, 14, 3);
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
            const scanTextUppercase = (scanRow.getAttribute("data-scan-text") || "SCAN QR CODE").toUpperCase();
            const iconSz = 12,
              gap = 6,
              H = 18;

            // Measure text width with same font + letter-spacing as CSS
            const tmpC = document.createElement("canvas");
            const tmpX = tmpC.getContext("2d")!;
            tmpX.font = "600 10px system-ui,-apple-system,sans-serif";
            (tmpX as any).letterSpacing = "3px";
            const textW = tmpX.measureText(scanTextUppercase).width;
            const W = Math.ceil(iconSz + gap + textW + gap + iconSz) + 4;

            const sc = document.createElement("canvas");
            sc.width = W * S;
            sc.height = H * S;
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
              sx.beginPath();
              sx.moveTo(ox + cornerLen, oy);
              sx.lineTo(ox, oy);
              sx.lineTo(ox, oy + cornerLen);
              sx.stroke();
              // TR
              sx.beginPath();
              sx.moveTo(ox + iconSz - cornerLen, oy);
              sx.lineTo(ox + iconSz, oy);
              sx.lineTo(ox + iconSz, oy + cornerLen);
              sx.stroke();
              // BL
              sx.beginPath();
              sx.moveTo(ox, oy + iconSz - cornerLen);
              sx.lineTo(ox, oy + iconSz);
              sx.lineTo(ox + cornerLen, oy + iconSz);
              sx.stroke();
              // BR
              sx.beginPath();
              sx.moveTo(ox + iconSz, oy + iconSz - cornerLen);
              sx.lineTo(ox + iconSz, oy + iconSz);
              sx.lineTo(ox + iconSz - cornerLen, oy + iconSz);
              sx.stroke();
            };

            const leftX = 2;
            const textX = leftX + iconSz + gap;
            const rightX = textX + Math.ceil(textW) + gap;

            drawCorners(leftX);

            sx.fillStyle = "#6b7280";
            sx.font = "600 10px system-ui,-apple-system,sans-serif";
            (sx as any).letterSpacing = "3px";
            sx.textBaseline = "middle";
            sx.fillText(scanTextUppercase, textX, cy);

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

      await new Promise<void>((resolve) => {
        snapshot.toBlob((blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const dlUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = dlUrl;
          a.download = `qr-card-${businessName.replace(/\s+/g, "-").toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(dlUrl);
          showToast.success("Card downloaded!");
          resolve();
        }, "image/png");
      });
    } catch (err) {
      console.error("[QR download]", err);
      showToast.error("Failed to download card");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!link) {
      showToast.error("Fill in all required fields first");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast.success("URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy URL");
    }
  };

  const handleShare = async () => {
    if (!link) {
      showToast.error("Fill in all required fields first");
      return;
    }
    if (navigator.share) {
      navigator.share({ title: businessName, url: link }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(link).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Card Template */}
      <div className="w-full flex justify-center">
        <QRCardTemplate
          cardRef={cardRef}
          qrContainerRef={containerRef}
          gradFrom={gradFrom}
          gradTo={gradTo}
          bgColor={bgColor}
          title={businessName}
          subtitle={subtitle}
          logoUrl={logoUrl}
          scanText={scanText}
          hasContent={hasContent && !!link}
          maxWidth={maxWidth}
        />
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-1 w-full flex-wrap justify-center">
          <CustomButton
            size="sm"
            className="gap-1"
            onClick={handleDownload}
            disabled={downloading || !link}
            isLoading={downloading}
            icon={!downloading ? <Download className="w-2.5 h-2.5" /> : undefined}
          >
            {downloading ? "Saving…" : "Download"}
          </CustomButton>
          <CustomButton
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleCopyUrl}
            disabled={!link}
            icon={copied ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
          >
            {copied ? "Copied!" : "Copy URL"}
          </CustomButton>
          {showShare && (
            <CustomButton
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleShare}
              disabled={!link}
              icon={<Share2 className="w-2.5 h-2.5" />}
            >
              Share
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
}

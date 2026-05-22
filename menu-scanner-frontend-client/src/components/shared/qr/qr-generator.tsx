"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { showToast } from "@/components/shared/common/show-toast";
import { QRDisplay } from "./qr-display";
import { QRDownloadButton } from "./qr-download-button";

export interface QRGeneratorProps {
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
  /** Show download button */
  showDownload?: boolean;
  /** Show copy URL button */
  showCopy?: boolean;
  /** Show share button */
  showShare?: boolean;
}

const QR_SIZE = 220;
const S = 3; // html2canvas scale factor

export function QRGenerator({
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
  showDownload = true,
  showCopy = true,
  showShare = true,
}: QRGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Footer background - subtle tint that works on any theme
  const footerBg = "rgba(0, 0, 0, 0.06)";

  // Build QR options with consistent settings
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

  // Generate QR code
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

  // Download with 100% matching preview
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
        scale: S,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor,
        logging: false,
        onclone: (_doc, el) => {
          // Ensure footer background is visible
          const footer = el.querySelector("[data-qr-footer]") as HTMLElement | null;
          if (footer) {
            footer.style.background = footerBg;
          }

          // Convert all canvas elements to images
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
              /* tainted canvas */
            }
          });

          // Render QR badge with canvas
          const badge = el.querySelector("[data-qr-badge]") as HTMLElement | null;
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

          // Render eMenu label with canvas
          const emenu = el.querySelector("[data-qr-emenu]") as HTMLElement | null;
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

          // Render SCAN row with canvas
          const scanRow = el.querySelector("[data-qr-scan]") as HTMLElement | null;
          if (scanRow) {
            const scanTextUpper = (scanRow.getAttribute("data-scan-text") || "SCAN QR CODE").toUpperCase();
            const iconSz = 12,
              gap = 6,
              H = 18;

            const tmpC = document.createElement("canvas");
            const tmpX = tmpC.getContext("2d")!;
            tmpX.font = "600 10px system-ui,-apple-system,sans-serif";
            const textW = tmpX.measureText(scanTextUpper).width;
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
              sx.beginPath();
              sx.moveTo(ox + cornerLen, oy);
              sx.lineTo(ox, oy);
              sx.lineTo(ox, oy + cornerLen);
              sx.stroke();
              sx.beginPath();
              sx.moveTo(ox + iconSz - cornerLen, oy);
              sx.lineTo(ox + iconSz, oy);
              sx.lineTo(ox + iconSz, oy + cornerLen);
              sx.stroke();
              sx.beginPath();
              sx.moveTo(ox, oy + iconSz - cornerLen);
              sx.lineTo(ox, oy + iconSz);
              sx.lineTo(ox + cornerLen, oy + iconSz);
              sx.stroke();
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
            sx.textBaseline = "middle";
            sx.fillText(scanTextUpper, textX, cy);
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
        }, `image/png`);
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
    <div className="flex flex-col items-center gap-4 w-full">
      <QRDisplay
        containerRef={containerRef}
        cardRef={cardRef}
        gradFrom={gradFrom}
        gradTo={gradTo}
        bgColor={bgColor}
        businessName={businessName}
        subtitle={subtitle}
        logoUrl={logoUrl}
        scanText={scanText}
        link={link}
        maxWidth={maxWidth}
        footerBg={footerBg}
      />

      <QRDownloadButton
        downloading={downloading}
        copied={copied}
        link={link}
        showDownload={showDownload}
        showCopy={showCopy}
        showShare={showShare}
        onDownload={handleDownload}
        onCopyUrl={handleCopyUrl}
        onShare={handleShare}
      />
    </div>
  );
}

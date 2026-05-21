"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Share2, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/shared/common/show-toast";

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

const CARD_SHADOW = "0 20px 60px rgba(0,0,0,0.18)";
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
      {/* QR Card — Unified Template */}
      <div className="w-full flex justify-center">
        <div
          ref={cardRef}
          style={{
            width: "100%",
            maxWidth,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: CARD_SHADOW,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
              padding: "14px 16px 32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                right: -40,
                top: -40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                right: 10,
                top: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />

            {/* Logo + QR badge */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {logoUrl ? (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <QrCode
                    style={{
                      width: 20,
                      height: 20,
                      color: "rgba(255,255,255,0.8)",
                      display: "block",
                    }}
                  />
                </div>
              )}

              <div
                data-qr-badge
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#34d399",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1,
                  }}
                >
                  QR
                </span>
              </div>
            </div>

            {/* Title + subtitle */}
            <div style={{ position: "relative", zIndex: 10 }}>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {businessName}
              </h2>
              {subtitle && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                    fontWeight: 300,
                    margin: "3px 0 0",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Rounded cap */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 20,
                background: bgColor,
                borderRadius: "1.25rem 1.25rem 0 0",
              }}
            />
          </div>

          {/* QR AREA */}
          <div
            style={{
              background: bgColor,
              padding: "4px 16px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: 14,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                padding: 8,
                background: "#fff",
              }}
            >
              <div ref={containerRef} style={{ display: link ? "block" : "block", opacity: link ? 1 : 0.2 }} />
            </div>

            {/* SCAN row */}
            <div data-qr-scan data-scan-text={scanText} style={{ width: "100%", textAlign: "center", lineHeight: 1 }}>
              <span
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  lineHeight: 0,
                  marginRight: 6,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
              </span>
              <span
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6b7280",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                {scanText}
              </span>
              <span
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  lineHeight: 0,
                  marginLeft: 6,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              padding: "8px 16px",
              background: `${gradFrom}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              data-qr-emenu
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.18)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                eMenu
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {[0.25, 0.55, 0.85].map((op, i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: gradFrom,
                    opacity: op,
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full flex-wrap justify-center">
        {showDownload && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleDownload}
            disabled={downloading || !link}
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Saving…" : "Download"}
          </Button>
        )}
        {showCopy && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleCopyUrl}
            disabled={!link}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL"}
          </Button>
        )}
        {showShare && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleShare}
            disabled={!link}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}

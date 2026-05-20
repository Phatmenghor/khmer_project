import type { CardTemplate, QRConfig, QRStyle } from "./use-qr-generator";
import { generateQRUrl } from "./use-qr-generator";

// ── Template definitions ──────────────────────────────────────────────────────

export interface TemplateConfig {
  id: CardTemplate;
  name: string;
  gradientFrom: string;
  gradientTo: string;
  qrPrimaryColor: string;
  isDark: boolean;
}

export const CARD_TEMPLATES: TemplateConfig[] = [
  { id: "bank-classic", name: "Bank Classic", gradientFrom: "#1a237e", gradientTo: "#283593", qrPrimaryColor: "#1a237e", isDark: true  },
  { id: "aba-red",      name: "ABA Red",      gradientFrom: "#b71c1c", gradientTo: "#d32f2f", qrPrimaryColor: "#b71c1c", isDark: true  },
  { id: "royal-purple", name: "Royal Purple", gradientFrom: "#4a148c", gradientTo: "#7b1fa2", qrPrimaryColor: "#4a148c", isDark: true  },
  { id: "fresh-green",  name: "Fresh Green",  gradientFrom: "#1b5e20", gradientTo: "#2e7d32", qrPrimaryColor: "#1b5e20", isDark: true  },
  { id: "dark-mode",    name: "Dark Mode",    gradientFrom: "#0f172a", gradientTo: "#1e293b", qrPrimaryColor: "#38bdf8", isDark: true  },
  { id: "print-ready",  name: "Print Ready",  gradientFrom: "#ffffff", gradientTo: "#f1f5f9", qrPrimaryColor: "#000000", isDark: false },
];

export function getTemplateConfig(id: CardTemplate): TemplateConfig {
  return CARD_TEMPLATES.find((t) => t.id === id) ?? CARD_TEMPLATES[0];
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, maxWidth: number, lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

// ── Layout constants (900px wide canvas, mirroring the 320px HTML card × 2.8) ─

const CARD_W   = 900;
// Header heights chosen to match the HTML preview proportions at 2.8× scale
const GRAD_HEADER_H = 310;   // gradient header (no logo — just badge + title + subtitle)
const PRINT_HEADER_H = 200;  // print header (title + subtitle)
const FOOTER_H = 90;

// ── Gradient card ─────────────────────────────────────────────────────────────

async function drawGradientCard(
  ctx: CanvasRenderingContext2D,
  totalH: number,
  qrImg: HTMLImageElement,
  config: QRConfig,
  style: QRStyle,
  tpl: TemplateConfig,
) {
  const from    = style.cardGradientFrom || tpl.gradientFrom;
  const to      = style.cardGradientTo   || tpl.gradientTo;
  const bgColor = style.backgroundColor  || "#ffffff";

  // ── White card background ──────────────────────────────────────────
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CARD_W, totalH);

  // ── Gradient header ────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, CARD_W, GRAD_HEADER_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, GRAD_HEADER_H);

  // Decorative circles (top-right, matching HTML preview)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(CARD_W + 50, -50, 280, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(CARD_W - 60, 110, 130, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── QR badge (top-right) — same pill shape as HTML preview ────────
  const BADGE_W = 130, BADGE_H = 50, BADGE_R = 25;
  const BADGE_X = CARD_W - 80 - BADGE_W, BADGE_Y = 56;
  ctx.save();
  roundedRect(ctx, BADGE_X, BADGE_Y, BADGE_W, BADGE_H, BADGE_R);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();
  // Green dot
  ctx.beginPath();
  ctx.arc(BADGE_X + 24, BADGE_Y + BADGE_H / 2, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#34d399";
  ctx.fill();
  // "QR" text
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("QR", BADGE_X + 42, BADGE_Y + BADGE_H / 2 + 11);
  ctx.restore();

  // ── Title ──────────────────────────────────────────────────────────
  const titleX = 80;
  const titleY = 140;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 60px Arial, sans-serif";
  const lastTitleY = wrapText(ctx, config.cardTitle || "Your Business Name", titleX, titleY, CARD_W - 200, 74);

  // ── Subtitle ───────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "36px Arial, sans-serif";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", titleX, lastTitleY + 56, CARD_W - 200);

  // ── Wave transition (mirrors the CSS border-radius wave in HTML) ───
  const WAVE_Y = GRAD_HEADER_H - 45;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, WAVE_Y + 10);
  ctx.quadraticCurveTo(CARD_W * 0.25, WAVE_Y + 55, CARD_W * 0.5, WAVE_Y + 5);
  ctx.quadraticCurveTo(CARD_W * 0.75, WAVE_Y - 45, CARD_W, WAVE_Y + 15);
  ctx.lineTo(CARD_W, totalH);
  ctx.lineTo(0, totalH);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.restore();

  // ── QR code ────────────────────────────────────────────────────────
  const QR   = qrImg.width;
  const QR_X = (CARD_W - QR) / 2;
  const QR_Y = GRAD_HEADER_H + 20;

  // Shadow box (matches HTML: padding 10px, borderRadius 14px scaled)
  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.10)";
  ctx.shadowBlur    = 40;
  ctx.shadowOffsetY = 12;
  roundedRect(ctx, QR_X - 28, QR_Y - 28, QR + 56, QR + 56, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, QR_X, QR_Y, QR, QR);

  // ── Scan text (matches HTML: Scan icon · text · Scan icon) ─────────
  const scanText = (config.scanText || "SCAN QR CODE").toUpperCase();
  const TEXT_Y   = QR_Y + QR + 76;
  ctx.fillStyle = "#6b7280";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scanText, CARD_W / 2, TEXT_Y);

  // ── Footer (matches HTML footer) ───────────────────────────────────
  const FOOT_Y = totalH - FOOTER_H;
  ctx.fillStyle = `${from}22`;
  ctx.fillRect(0, FOOT_Y, CARD_W, FOOTER_H);

  // eMenu label
  ctx.fillStyle = "#64748b";
  ctx.font = "28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("eMenu", 80, FOOT_Y + FOOTER_H / 2 + 11);

  // Dot row (three dots, decreasing opacity, right side)
  const dotBaseX = CARD_W - 80;
  const dotY     = FOOT_Y + FOOTER_H / 2;
  [0.85, 0.55, 0.25].forEach((op, i) => {
    ctx.save();
    ctx.globalAlpha = op;
    ctx.beginPath();
    ctx.arc(dotBaseX - i * 24, dotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = from;
    ctx.fill();
    ctx.restore();
  });
}

// ── Print card ────────────────────────────────────────────────────────────────

async function drawPrintCard(
  ctx: CanvasRenderingContext2D,
  totalH: number,
  qrImg: HTMLImageElement,
  config: QRConfig,
) {
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, totalH);

  // Outer border
  ctx.save();
  roundedRect(ctx, 20, 20, CARD_W - 40, totalH - 40, 22);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  // Top stripe (matches HTML h-2 top stripe)
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, 20, CARD_W - 40, 18);

  // ── Title + subtitle (centered, no logo) ──────────────────────────
  ctx.textAlign = "center";

  ctx.fillStyle = "#000000";
  ctx.font = "bold 60px Arial, sans-serif";
  const lastTitleY = wrapText(
    ctx, config.cardTitle || "Your Business Name",
    CARD_W / 2, 100, CARD_W - 140, 74,
  );

  ctx.fillStyle = "#6b7280";
  ctx.font = "34px Arial, sans-serif";
  ctx.fillText(
    config.cardSubtitle || "Scan to view our menu",
    CARD_W / 2, lastTitleY + 52, CARD_W - 140,
  );

  // Dashed divider (matches HTML border-dashed)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(120, lastTitleY + 82);
  ctx.lineTo(CARD_W - 120, lastTitleY + 82);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();

  // ── QR code ────────────────────────────────────────────────────────
  const QR  = qrImg.width;
  const QRX = (CARD_W - QR) / 2;
  const QRY = lastTitleY + 108;

  // QR border box (matches HTML border-2 border-black rounded-xl)
  ctx.save();
  roundedRect(ctx, QRX - 18, QRY - 18, QR + 36, QR + 36, 16);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  ctx.drawImage(qrImg, QRX, QRY, QR, QR);

  // Scan text (matches HTML style: bold uppercase tracking-widest)
  const scanText = (config.scanText || "SCAN QR CODE").toUpperCase();
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scanText, CARD_W / 2, QRY + QR + 68);

  // Bottom stripe (matches HTML h-1.5)
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, totalH - 32, CARD_W - 40, 12);
}

// ── Public download function ──────────────────────────────────────────────────

export async function downloadQRCard(
  qrInstance: any,
  config: QRConfig,
  style: QRStyle,
): Promise<void> {
  const url = generateQRUrl(config);
  if (!url) throw new Error("No valid QR URL — fill in all required fields");

  const tpl = getTemplateConfig(style.template);
  const isPrint = style.template === "print-ready";

  // High-res QR — 480px matches the fixed download size
  const { default: QRCodeStyling } = await import("qr-code-styling");

  const qrForDownload = new QRCodeStyling({
    width:  480,
    height: 480,
    data:   url,
    qrOptions:            { errorCorrectionLevel: "H" },
    dotsOptions:          { color: style.primaryColor || tpl.qrPrimaryColor, type: "rounded" },
    cornersSquareOptions: { type: "extra-rounded", color: style.primaryColor || tpl.qrPrimaryColor },
    cornersDotOptions:    { color: style.primaryColor || tpl.qrPrimaryColor },
    backgroundOptions:    { color: style.backgroundColor || "#ffffff" },
    image: style.logoDataUrl ?? undefined,
    imageOptions: { crossOrigin: "anonymous", margin: 8, imageSize: 0.3, hideBackgroundDots: true },
  });

  const qrBlob = await qrForDownload.getRawData("png");
  if (!qrBlob) throw new Error("Failed to generate QR image");

  const qrObjectUrl = URL.createObjectURL(qrBlob as Blob);
  const qrImg = await loadImage(qrObjectUrl);
  URL.revokeObjectURL(qrObjectUrl);

  // Canvas height — header + QR + scan text + footer + breathing room
  const HEADER_H = isPrint ? PRINT_HEADER_H : GRAD_HEADER_H;
  const TOTAL_H  = HEADER_H + qrImg.height + 220 + FOOTER_H;

  const canvas  = document.createElement("canvas");
  canvas.width  = CARD_W;
  canvas.height = TOTAL_H;
  const ctx     = canvas.getContext("2d")!;

  if (isPrint) {
    await drawPrintCard(ctx, TOTAL_H, qrImg, config);
  } else {
    await drawGradientCard(ctx, TOTAL_H, qrImg, config, style, tpl);
  }

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const dlUrl = URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href      = dlUrl;
      a.download  = `qr-card-${config.cardTitle || config.type}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
    },
    "image/png",
  );
}

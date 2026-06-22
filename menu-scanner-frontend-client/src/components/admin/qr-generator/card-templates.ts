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
  { id: "bank-classic", name: "Midnight",  gradientFrom: "#1a237e", gradientTo: "#283593", qrPrimaryColor: "#1a237e", isDark: true },
  { id: "aba-red",      name: "Ruby",      gradientFrom: "#b71c1c", gradientTo: "#d32f2f", qrPrimaryColor: "#b71c1c", isDark: true },
  { id: "royal-purple", name: "Violet",    gradientFrom: "#4a148c", gradientTo: "#7b1fa2", qrPrimaryColor: "#4a148c", isDark: true },
  { id: "fresh-green",  name: "Forest",    gradientFrom: "#1b5e20", gradientTo: "#2e7d32", qrPrimaryColor: "#1b5e20", isDark: true },
  // "custom" is not in this list — its colors come from user's color picker
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
// Scale = CARD_W / 320px preview width = 2.8125
// Header heights derived from preview measurements × 2.8:
//   gradient header content (~100px × 2.8 = 280px), print header (~74px × 2.8 = 207px)
const GRAD_HEADER_H  = 280;
const PRINT_HEADER_H = 210;
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

  // ── Background ────────────────────────────────────────────────────
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CARD_W, totalH);

  // ── Gradient header (135deg diagonal, matches CSS linear-gradient(135deg)) ──
  const grad = ctx.createLinearGradient(0, 0, CARD_W, GRAD_HEADER_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, GRAD_HEADER_H);

  // Decorative circles top-right (matches HTML: 160×160 right:-40 top:-40 opacity:0.08)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(CARD_W - 112, -112, 448, 0, Math.PI * 2); ctx.fill(); // 160×2.8 = 448, right:-40×2.8=-112, top:-40×2.8=-112
  ctx.globalAlpha = 0.06;
  ctx.beginPath(); ctx.arc(CARD_W - 28, 168, 224, 0, Math.PI * 2); ctx.fill();   // 80×2.8=224, right:10×2.8=28, top:60×2.8=168
  ctx.restore();

  // ── Layout: PAD = 16px × 2.8 = 45px, CONTENT_Y baseline of first text ─────
  const PAD       = 45;
  // Badge: "4px 12px" padding → height≈(10+8)×2.8=50px, width≈68×2.8=190px
  const BADGE_H   = 50;
  const BADGE_W   = 190;
  const BADGE_R   = 25;
  const BADGE_X   = CARD_W - PAD - BADGE_W;
  // Top padding 16px × 2.8 = 45px; add ascent of 45px font (~36px) → first baseline at 81px
  const CONTENT_Y = 81;

  // Title — left of badge, font 16px × 2.8 = 45px bold
  const maxTitleW = BADGE_X - PAD - 16;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 45px Arial, sans-serif";
  const lastTitleY = wrapText(ctx, config.cardTitle || "Your Business Name", PAD, CONTENT_Y, maxTitleW, 52);

  // Subtitle — 11px × 2.8 = 31px, 4px × 2.8 = 11px margin-top → baseline 11+26=37px below lastTitleY
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "31px Arial, sans-serif";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", PAD, lastTitleY + 37, maxTitleW);

  // QR badge — top-right, same top as title row (flex alignItems: flex-start)
  const BADGE_Y = CONTENT_Y - 36; // align badge top with text visual top
  ctx.save();
  roundedRect(ctx, BADGE_X, BADGE_Y, BADGE_W, BADGE_H, BADGE_R);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();
  // Border (1px solid rgba(255,255,255,0.2))
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Green dot (w-6 h-6 = 6px → 17px on canvas)
  ctx.beginPath();
  ctx.arc(BADGE_X + 28, BADGE_Y + BADGE_H / 2, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#34d399";
  ctx.fill();
  // "QR" text (10px × 2.8 = 28px, font-weight 600, letter-spacing 1)
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("QR", BADGE_X + 50, BADGE_Y + BADGE_H / 2 + 10);
  ctx.restore();

  // ── Wave separator — simple rounded-top cap matching CSS "borderRadius: 1.5rem 1.5rem 0 0" ──
  // HTML: height:20px marginTop:-16px → wave top = GRAD_HEADER_H - (16×2.8) = GRAD_HEADER_H - 45
  // borderRadius 1.5rem = 24px × 2.8 = 67px
  const WAVE_TOP = GRAD_HEADER_H - 45;
  const WAVE_R   = 67;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(WAVE_R, WAVE_TOP);
  ctx.lineTo(CARD_W - WAVE_R, WAVE_TOP);
  ctx.quadraticCurveTo(CARD_W, WAVE_TOP, CARD_W, WAVE_TOP + WAVE_R);
  ctx.lineTo(CARD_W, totalH);
  ctx.lineTo(0, totalH);
  ctx.lineTo(0, WAVE_TOP + WAVE_R);
  ctx.quadraticCurveTo(0, WAVE_TOP, WAVE_R, WAVE_TOP);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.restore();

  // ── QR code (starts just below the wave top, matching HTML marginTop:-4) ───
  const QR   = qrImg.width;
  const QR_X = (CARD_W - QR) / 2;
  const QR_Y = WAVE_TOP + 30; // small gap inside white area

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
  ctx.fillText("ScanMeKH", 80, FOOT_Y + FOOTER_H / 2 + 11);

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
  ctx.font = "bold 45px Arial, sans-serif";
  const lastTitleY = wrapText(
    ctx, config.cardTitle || "Your Business Name",
    CARD_W / 2, 100, CARD_W - 140, 56,
  );

  ctx.fillStyle = "#6b7280";
  ctx.font = "31px Arial, sans-serif";
  ctx.fillText(
    config.cardSubtitle || "Scan to view our menu",
    CARD_W / 2, lastTitleY + 44, CARD_W - 140,
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
  const TOTAL_H = GRAD_HEADER_H + qrImg.height + 220 + FOOTER_H;

  const canvas  = document.createElement("canvas");
  canvas.width  = CARD_W;
  canvas.height = TOTAL_H;
  const ctx     = canvas.getContext("2d")!;

  await drawGradientCard(ctx, TOTAL_H, qrImg, config, style, tpl);

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

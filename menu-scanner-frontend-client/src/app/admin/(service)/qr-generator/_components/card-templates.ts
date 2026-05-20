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
  { id: "bank-classic",  name: "Bank Classic",  gradientFrom: "#1a237e", gradientTo: "#283593", qrPrimaryColor: "#1a237e", isDark: true  },
  { id: "aba-red",       name: "ABA Red",        gradientFrom: "#b71c1c", gradientTo: "#d32f2f", qrPrimaryColor: "#b71c1c", isDark: true  },
  { id: "royal-purple",  name: "Royal Purple",   gradientFrom: "#4a148c", gradientTo: "#7b1fa2", qrPrimaryColor: "#4a148c", isDark: true  },
  { id: "fresh-green",   name: "Fresh Green",    gradientFrom: "#1b5e20", gradientTo: "#2e7d32", qrPrimaryColor: "#1b5e20", isDark: true  },
  { id: "dark-mode",     name: "Dark Mode",      gradientFrom: "#0f172a", gradientTo: "#1e293b", qrPrimaryColor: "#38bdf8", isDark: true  },
  { id: "print-ready",   name: "Print Ready",    gradientFrom: "#ffffff", gradientTo: "#f1f5f9", qrPrimaryColor: "#000000", isDark: false },
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
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draw an image into a circle using cover (fills without letterboxing)
function drawCircleCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number, cy: number, radius: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  const d     = radius * 2;
  const scale = Math.max(d / img.naturalWidth, d / img.naturalHeight);
  const w     = img.naturalWidth  * scale;
  const h     = img.naturalHeight * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, maxWidth: number, lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY;
}

// ── Canvas dimensions ─────────────────────────────────────────────────────────

const CARD_W   = 900;
const HEADER_H = 400;   // gradient header height
const FOOTER_H = 80;

// ── Draw: gradient card ───────────────────────────────────────────────────────

async function drawGradientCard(
  ctx: CanvasRenderingContext2D,
  h: number,
  qrImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  config: QRConfig,
  style: QRStyle,
  tpl: TemplateConfig,
) {
  const from   = style.cardGradientFrom || tpl.gradientFrom;
  const to     = style.cardGradientTo   || tpl.gradientTo;
  const bgColor = style.backgroundColor || "#ffffff";

  // Card background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CARD_W, h);

  // Gradient header
  const grad = ctx.createLinearGradient(0, 0, CARD_W, HEADER_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, HEADER_H);

  // Decorative circles (top-right corner)
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(CARD_W + 50, -50, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CARD_W - 80, 110, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Logo (top-left, circle, cover fill) ───────────────────────────
  const LOGO_R  = 70;   // radius
  const LOGO_CX = 100;
  const LOGO_CY = 100;

  if (logoImg) {
    // Outer ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_R + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    drawCircleCover(ctx, logoImg, LOGO_CX, LOGO_CY, LOGO_R);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // ── QR badge (top-right) ───────────────────────────────────────────
  ctx.save();
  roundedRect(ctx, CARD_W - 155, 48, 120, 52, 26);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
  // Green dot
  ctx.beginPath();
  ctx.arc(CARD_W - 127, 74, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#34d399";
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("QR", CARD_W - 113, 83);
  ctx.restore();

  // ── Title + subtitle ───────────────────────────────────────────────
  const titleY = LOGO_CY + LOGO_R + 60;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 56px Arial, sans-serif";
  const lastY = wrapText(ctx, config.cardTitle || "Your Business Name", 80, titleY, CARD_W - 160, 68);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "36px Arial, sans-serif";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", 80, lastY + 60, CARD_W - 160);

  // ── Wave transition (matches HTML preview wave) ────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, HEADER_H - 50);
  ctx.quadraticCurveTo(CARD_W * 0.25, HEADER_H + 40, CARD_W * 0.5, HEADER_H - 20);
  ctx.quadraticCurveTo(CARD_W * 0.75, HEADER_H - 80, CARD_W, HEADER_H - 10);
  ctx.lineTo(CARD_W, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.restore();

  // ── QR code ────────────────────────────────────────────────────────
  const QR   = qrImg.width;
  const QR_X = (CARD_W - QR) / 2;
  const QR_Y = HEADER_H + 10;

  // Shadow box
  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.10)";
  ctx.shadowBlur    = 40;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, QR_X - 24, QR_Y - 24, QR + 48, QR + 48, 22);
  ctx.fillStyle = style.backgroundColor || "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrImg, QR_X, QR_Y, QR, QR);

  // ── Scan text (customizable) ───────────────────────────────────────
  const scanText = config.scanText || "SCAN QR CODE";
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 32px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scanText.toUpperCase(), CARD_W / 2, QR_Y + QR + 70);

  // ── Footer ─────────────────────────────────────────────────────────
  const footerY = h - FOOTER_H;

  // Footer tint strip
  ctx.save();
  ctx.fillStyle = `${from}22`;
  ctx.fillRect(0, footerY, CARD_W, FOOTER_H);
  ctx.restore();

  // eMenu label
  ctx.fillStyle = "#64748b";
  ctx.font = "26px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("eMenu", 80, footerY + FOOTER_H / 2 + 10);

  // Dot row (matches HTML preview)
  const dotX = CARD_W - 80;
  const dotY = footerY + FOOTER_H / 2;
  [0.25, 0.55, 0.85].forEach((op, i) => {
    ctx.save();
    ctx.globalAlpha = op;
    ctx.beginPath();
    ctx.arc(dotX - i * 22, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = from;
    ctx.fill();
    ctx.restore();
  });
}

// ── Draw: print / B&W card ────────────────────────────────────────────────────

async function drawPrintCard(
  ctx: CanvasRenderingContext2D,
  h: number,
  qrImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  config: QRConfig,
) {
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, h);

  // Outer border
  ctx.save();
  roundedRect(ctx, 20, 20, CARD_W - 40, h - 40, 22);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  // Top stripe
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, 20, CARD_W - 40, 16);

  // ── Logo (centered circle, cover fill) ────────────────────────────
  const LOGO_R  = 70;
  const LOGO_CX = CARD_W / 2;
  let logoBottom = 80;

  if (logoImg) {
    const LOGO_CY = 80 + LOGO_R;
    // Border ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_R + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    drawCircleCover(ctx, logoImg, LOGO_CX, LOGO_CY, LOGO_R);
    logoBottom = LOGO_CY + LOGO_R + 30;
  }

  // Title
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.font = "bold 56px Arial, sans-serif";
  const lastY = wrapText(ctx, config.cardTitle || "Your Business Name", CARD_W / 2, logoBottom + 60, CARD_W - 120, 68);

  // Subtitle
  ctx.font = "32px Arial, sans-serif";
  ctx.fillStyle = "#374151";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", CARD_W / 2, lastY + 52, CARD_W - 120);

  // Dashed divider
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(120, lastY + 80);
  ctx.lineTo(CARD_W - 120, lastY + 80);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();

  // QR code
  const QR  = qrImg.width;
  const QRX = (CARD_W - QR) / 2;
  const QRY = lastY + 100;

  // QR border box
  ctx.save();
  roundedRect(ctx, QRX - 16, QRY - 16, QR + 32, QR + 32, 14);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  ctx.drawImage(qrImg, QRX, QRY, QR, QR);

  // Scan text (customizable)
  const scanText = config.scanText || "SCAN QR CODE";
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scanText.toUpperCase(), CARD_W / 2, QRY + QR + 65);

  // Bottom brand line
  ctx.fillStyle = "#9ca3af";
  ctx.font = "24px Arial, sans-serif";
  ctx.fillText("Powered by eMenu", CARD_W / 2, h - 50);

  // Bottom stripe
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, h - 34, CARD_W - 40, 14);
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

  // Build high-res QR image (480px, matches fixed preview QR)
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

  // Load logo
  let logoImg: HTMLImageElement | null = null;
  if (style.logoDataUrl) {
    logoImg = await loadImage(style.logoDataUrl);
  }

  // Canvas size
  const CARD_H = HEADER_H + qrImg.height + 260 + FOOTER_H;

  const canvas  = document.createElement("canvas");
  canvas.width  = CARD_W;
  canvas.height = CARD_H;
  const ctx     = canvas.getContext("2d")!;

  if (style.template === "print-ready") {
    await drawPrintCard(ctx, CARD_H, qrImg, logoImg, config);
  } else {
    await drawGradientCard(ctx, CARD_H, qrImg, logoImg, config, style, tpl);
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

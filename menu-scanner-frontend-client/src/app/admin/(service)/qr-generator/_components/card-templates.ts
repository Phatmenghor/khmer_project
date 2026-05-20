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
  {
    id: "bank-classic",
    name: "Bank Classic",
    gradientFrom: "#1a237e",
    gradientTo: "#283593",
    qrPrimaryColor: "#1a237e",
    isDark: true,
  },
  {
    id: "aba-red",
    name: "ABA Red",
    gradientFrom: "#b71c1c",
    gradientTo: "#d32f2f",
    qrPrimaryColor: "#b71c1c",
    isDark: true,
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    gradientFrom: "#4a148c",
    gradientTo: "#7b1fa2",
    qrPrimaryColor: "#4a148c",
    isDark: true,
  },
  {
    id: "fresh-green",
    name: "Fresh Green",
    gradientFrom: "#1b5e20",
    gradientTo: "#2e7d32",
    qrPrimaryColor: "#1b5e20",
    isDark: true,
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    gradientFrom: "#0f172a",
    gradientTo: "#1e293b",
    qrPrimaryColor: "#38bdf8",
    isDark: true,
  },
  {
    id: "print-ready",
    name: "Print Ready",
    gradientFrom: "#ffffff",
    gradientTo: "#f1f5f9",
    qrPrimaryColor: "#000000",
    isDark: false,
  },
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
  x: number, y: number,
  w: number, h: number,
  r: number,
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
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

// ── Draw functions ────────────────────────────────────────────────────────────

const CARD_W = 900;
const HEADER_H = 420;
const FOOTER_H = 80;

async function drawGradientCard(
  ctx: CanvasRenderingContext2D,
  h: number,
  qrImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  config: QRConfig,
  style: QRStyle,
  tpl: TemplateConfig,
) {
  const from = style.cardGradientFrom || tpl.gradientFrom;
  const to   = style.cardGradientTo   || tpl.gradientTo;
  const isDark = tpl.isDark;

  // ── White card background ──────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, h);

  // ── Header gradient ────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, CARD_W, HEADER_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, HEADER_H);

  // Decorative circles (top-right corner)
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(CARD_W + 30, -30, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 80, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Logo ───────────────────────────────────────────────────────────
  const LOGO_SIZE = 110;
  const LOGO_CX   = 90 + LOGO_SIZE / 2;
  const LOGO_CY   = 55 + LOGO_SIZE / 2;

  if (logoImg && style.logoEnabled) {
    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_SIZE / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.drawImage(logoImg, LOGO_CX - LOGO_SIZE / 2, LOGO_CY - LOGO_SIZE / 2, LOGO_SIZE, LOGO_SIZE);
    ctx.restore();
  } else {
    // Placeholder icon ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(LOGO_CX, LOGO_CY, LOGO_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // ── QR badge (top-right) ───────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundedRect(ctx, CARD_W - 120, 40, 90, 36, 18);
  ctx.fill();
  ctx.fillStyle = isDark ? "#ffffff" : "#1e293b";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("QR", CARD_W - 75, 64);
  ctx.restore();

  // ── Title ──────────────────────────────────────────────────────────
  const titleY = logoImg && style.logoEnabled ? LOGO_CY + LOGO_SIZE / 2 + 50 : 200;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign  = "left";
  ctx.font       = "bold 52px Arial, sans-serif";
  const title    = config.cardTitle || "Your Business Name";
  wrapText(ctx, title, 80, titleY, CARD_W - 160, 64);

  ctx.fillStyle  = "rgba(255,255,255,0.70)";
  ctx.font       = "34px Arial, sans-serif";
  const subtitle = config.cardSubtitle || "Scan to view our menu";
  ctx.fillText(subtitle, 80, titleY + 72, CARD_W - 160);

  // ── Wave transition ────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(0, HEADER_H - 40);
  ctx.quadraticCurveTo(CARD_W * 0.35, HEADER_H + 50, CARD_W * 0.65, HEADER_H - 30);
  ctx.quadraticCurveTo(CARD_W * 0.82, HEADER_H - 70, CARD_W, HEADER_H - 20);
  ctx.lineTo(CARD_W, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // ── QR code ────────────────────────────────────────────────────────
  const QR = qrImg.width;
  const QR_X = (CARD_W - QR) / 2;
  const QR_Y = HEADER_H + 20;

  // QR shadow box
  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.10)";
  ctx.shadowBlur    = 30;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, QR_X - 18, QR_Y - 18, QR + 36, QR + 36, 18);
  ctx.fillStyle = style.backgroundColor || "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrImg, QR_X, QR_Y, QR, QR);

  // ── Scan text ──────────────────────────────────────────────────────
  ctx.fillStyle  = "#64748b";
  ctx.font       = "bold 30px Arial, sans-serif";
  ctx.textAlign  = "center";
  ctx.fillText("📷  SCAN QR CODE", CARD_W / 2, QR_Y + QR + 65);

  // Divider line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(80, QR_Y + QR + 95);
  ctx.lineTo(CARD_W - 80, QR_Y + QR + 95);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();

  // ── Footer ─────────────────────────────────────────────────────────
  ctx.fillStyle  = "#f8fafc";
  ctx.fillRect(0, h - FOOTER_H, CARD_W, FOOTER_H);

  ctx.fillStyle  = "#94a3b8";
  ctx.font       = "24px Arial, sans-serif";
  ctx.textAlign  = "center";
  ctx.fillText("Powered by eMenu", CARD_W / 2, h - FOOTER_H / 2 + 10);
}

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
  ctx.strokeStyle = "#000000";
  ctx.lineWidth   = 8;
  roundedRect(ctx, 20, 20, CARD_W - 40, h - 40, 20);
  ctx.stroke();

  // Top bar (thin stripe)
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, 20, CARD_W - 40, 12);
  roundedRect(ctx, 20, 20, CARD_W - 40, 12, 6);
  ctx.fill();

  // Logo
  let logoBottom = 80;
  if (logoImg) {
    const LS = 90;
    const LX = (CARD_W - LS) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(LX + LS / 2, 60 + LS / 2, LS / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(LX + LS / 2, 60 + LS / 2, LS / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, LX, 60, LS, LS);
    ctx.restore();
    logoBottom = 60 + LS + 30;
  }

  // Title
  ctx.fillStyle  = "#000000";
  ctx.textAlign  = "center";
  ctx.font       = "bold 54px Arial, sans-serif";
  wrapText(ctx, config.cardTitle || "Your Business Name", CARD_W / 2, logoBottom + 50, CARD_W - 120, 64);

  // Subtitle
  ctx.font      = "30px Arial, sans-serif";
  ctx.fillStyle = "#374151";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", CARD_W / 2, logoBottom + 130, CARD_W - 120);

  // Divider
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(120, logoBottom + 155);
  ctx.lineTo(CARD_W - 120, logoBottom + 155);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth   = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.restore();

  // QR
  const QR  = qrImg.width;
  const QRX = (CARD_W - QR) / 2;
  const QRY = logoBottom + 175;

  // QR border box
  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth   = 4;
  roundedRect(ctx, QRX - 12, QRY - 12, QR + 24, QR + 24, 12);
  ctx.stroke();
  ctx.restore();

  ctx.drawImage(qrImg, QRX, QRY, QR, QR);

  // Scan text
  ctx.fillStyle  = "#000000";
  ctx.font       = "bold 30px Arial, sans-serif";
  ctx.textAlign  = "center";
  ctx.fillText("SCAN QR CODE", CARD_W / 2, QRY + QR + 60);

  // Bottom brand
  ctx.fillStyle = "#6b7280";
  ctx.font      = "22px Arial, sans-serif";
  ctx.fillText("Powered by eMenu", CARD_W / 2, h - 40);
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

  // Build a high-res QR image
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const downloadSize = Math.max(style.size, 400);

  const qrForDownload = new QRCodeStyling({
    width: downloadSize,
    height: downloadSize,
    data: url,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: {
      color: style.primaryColor || tpl.qrPrimaryColor,
      type: "rounded",
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: style.primaryColor || tpl.qrPrimaryColor,
    },
    cornersDotOptions: {
      color: style.primaryColor || tpl.qrPrimaryColor,
    },
    backgroundOptions: { color: style.backgroundColor || "#ffffff" },
    image: style.logoEnabled && style.logoDataUrl ? style.logoDataUrl : undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
      imageSize: 0.3,
      hideBackgroundDots: true,
    },
  });

  const qrBlob = await qrForDownload.getRawData("png");
  if (!qrBlob) throw new Error("Failed to generate QR image");

  const qrObjectUrl = URL.createObjectURL(qrBlob as Blob);
  const qrImg = await loadImage(qrObjectUrl);
  URL.revokeObjectURL(qrObjectUrl);

  // Load logo if needed
  let logoImg: HTMLImageElement | null = null;
  if (style.logoEnabled && style.logoDataUrl) {
    logoImg = await loadImage(style.logoDataUrl);
  }

  // Canvas dimensions
  const EXTRA = 100; // bottom breathing room
  const CARD_H = HEADER_H + qrImg.height + 220 + FOOTER_H + EXTRA;

  const canvas     = document.createElement("canvas");
  canvas.width     = CARD_W;
  canvas.height    = CARD_H;
  const ctx        = canvas.getContext("2d")!;

  if (style.template === "print-ready") {
    await drawPrintCard(ctx, CARD_H, qrImg, logoImg, config);
  } else {
    await drawGradientCard(ctx, CARD_H, qrImg, logoImg, config, style, tpl);
  }

  // Trigger download
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

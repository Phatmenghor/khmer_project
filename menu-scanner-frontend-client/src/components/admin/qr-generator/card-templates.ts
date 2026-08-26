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

export const DEFAULT_PRIMARY_COLOR = {
  color: "#966e30",
  from: "#966e30",
  to: "#684d21",
};

export function getSystemPrimaryColor(): { color: string; from: string; to: string } {
  if (typeof window !== "undefined") {
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      if (raw) {
        const parts = raw.split(/\s+/);
        if (parts.length >= 3) {
          const h = parseFloat(parts[0]);
          const s = parseFloat(parts[1]);
          const l = parseFloat(parts[2]);

          const hslToHex = (hVal: number, sVal: number, lVal: number) => {
            const lNorm = lVal / 100;
            const a = (sVal * Math.min(lNorm, 1 - lNorm)) / 100;
            const f = (n: number) => {
              const k = (n + hVal / 30) % 12;
              const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
              return Math.round(255 * color).toString(16).padStart(2, "0");
            };
            return `#${f(0)}${f(8)}${f(4)}`;
          };

          const mainHex = hslToHex(h, s, l);
          const darkHex = hslToHex(h, s, Math.max(0, l - 12));
          return { color: mainHex, from: mainHex, to: darkHex };
        }
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_PRIMARY_COLOR;
}

export const CARD_TEMPLATES: TemplateConfig[] = [
  { id: "primary-theme", name: "Primary",   gradientFrom: "#966e30", gradientTo: "#684d21", qrPrimaryColor: "#966e30", isDark: true },
  { id: "bank-classic",  name: "Midnight",  gradientFrom: "#1a237e", gradientTo: "#283593", qrPrimaryColor: "#1a237e", isDark: true },
  { id: "aba-red",       name: "Ruby",      gradientFrom: "#b71c1c", gradientTo: "#d32f2f", qrPrimaryColor: "#b71c1c", isDark: true },
  { id: "royal-purple",  name: "Violet",    gradientFrom: "#4a148c", gradientTo: "#7b1fa2", qrPrimaryColor: "#4a148c", isDark: true },
  { id: "fresh-green",   name: "Forest",    gradientFrom: "#1b5e20", gradientTo: "#2e7d32", qrPrimaryColor: "#1b5e20", isDark: true },
];

export function getTemplateConfig(id: CardTemplate): TemplateConfig {
  if (id === "primary-theme") {
    const sys = getSystemPrimaryColor();
    return {
      id: "primary-theme",
      name: "Primary",
      gradientFrom: sys.from,
      gradientTo: sys.to,
      qrPrimaryColor: sys.color,
      isDark: true,
    };
  }
  const found = CARD_TEMPLATES.find((t) => t.id === id);
  if (found) return found;

  const sys = getSystemPrimaryColor();
  return {
    id: "primary-theme",
    name: "Primary",
    gradientFrom: sys.from,
    gradientTo: sys.to,
    qrPrimaryColor: sys.color,
    isDark: true,
  };
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
const GRAD_HEADER_H  = 280;
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

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CARD_W, totalH);

  const grad = ctx.createLinearGradient(0, 0, CARD_W, GRAD_HEADER_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, GRAD_HEADER_H);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(CARD_W - 112, -112, 448, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.06;
  ctx.beginPath(); ctx.arc(CARD_W - 28, 168, 224, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const PAD       = 45;
  const BADGE_H   = 50;
  const BADGE_W   = 190;
  const BADGE_R   = 25;
  const BADGE_X   = CARD_W - PAD - BADGE_W;
  const CONTENT_Y = 81;

  const maxTitleW = BADGE_X - PAD - 16;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 45px Arial, sans-serif";
  const lastTitleY = wrapText(ctx, config.cardTitle || "Your Business Name", PAD, CONTENT_Y, maxTitleW, 52);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "31px Arial, sans-serif";
  ctx.fillText(config.cardSubtitle || "Scan to view our menu", PAD, lastTitleY + 37, maxTitleW);

  const BADGE_Y = CONTENT_Y - 36;
  ctx.save();
  roundedRect(ctx, BADGE_X, BADGE_Y, BADGE_W, BADGE_H, BADGE_R);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(BADGE_X + 28, BADGE_Y + BADGE_H / 2, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#34d399";
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("QR", BADGE_X + 50, BADGE_Y + BADGE_H / 2 + 10);
  ctx.restore();

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

  const QR   = qrImg.width;
  const QR_X = (CARD_W - QR) / 2;
  const QR_Y = WAVE_TOP + 30;

  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.10)";
  ctx.shadowBlur    = 40;
  ctx.shadowOffsetY = 12;
  roundedRect(ctx, QR_X - 28, QR_Y - 28, QR + 56, QR + 56, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, QR_X, QR_Y, QR, QR);

  const scanText = (config.scanText || "SCAN QR CODE").toUpperCase();
  const TEXT_Y   = QR_Y + QR + 76;
  ctx.fillStyle = "#6b7280";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scanText, CARD_W / 2, TEXT_Y);

  const FOOT_Y = totalH - FOOTER_H;
  ctx.fillStyle = `${from}22`;
  ctx.fillRect(0, FOOT_Y, CARD_W, FOOTER_H);

  ctx.fillStyle = "#64748b";
  ctx.font = "28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ScanMeKH", 80, FOOT_Y + FOOTER_H / 2 + 11);

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

// ── Public download function ──────────────────────────────────────────────────

export async function downloadQRCard(
  qrInstance: any,
  config: QRConfig,
  style: QRStyle,
): Promise<void> {
  const url = generateQRUrl(config);
  if (!url) throw new Error("No valid QR URL — fill in all required fields");

  const tpl = getTemplateConfig(style.template);

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

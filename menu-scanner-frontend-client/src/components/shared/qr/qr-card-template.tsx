"use client";

import { QrCode, Scan } from "lucide-react";

export interface QRCardTemplateProps {
  /** Ref forwarded to the outer card div — used by html2canvas for download */
  cardRef?: React.Ref<HTMLDivElement>;
  /** Ref forwarded to the inner container where qr-code-styling appends its canvas */
  qrContainerRef: React.RefObject<HTMLDivElement>;
  gradFrom: string;
  gradTo: string;
  bgColor?: string;
  title: string;
  subtitle?: string;
  /** Optional logo URL shown in the top-left circle */
  logoUrl?: string | null;
  /** Text shown in the scan row, defaults to "SCAN QR CODE" */
  scanText?: string;
  /** When false, shows an empty-state overlay on the QR area */
  hasContent?: boolean;
  maxWidth?: number;
  borderRadius?: number | string;
  shadow?: string;
}

export function QRCardTemplate({
  cardRef,
  qrContainerRef,
  gradFrom,
  gradTo,
  bgColor = "#ffffff",
  title,
  subtitle = "Scan to view our menu",
  logoUrl,
  scanText = "SCAN QR CODE",
  hasContent = true,
  maxWidth = 300,
  borderRadius = 16,
  shadow = "0 20px 60px rgba(0,0,0,0.18)",
}: QRCardTemplateProps) {
  return (
    <div
      ref={cardRef}
      style={{ width: "100%", maxWidth, borderRadius, overflow: "hidden", boxShadow: shadow }}
    >
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
        padding: "14px 16px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", width: 160, height: 160, right: -40, top: -40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 80,  height: 80,  right: 10,  top: 60,  borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        {/* Logo / icon — left; QR badge — right */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          {logoUrl ? (
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <QrCode style={{ width: 20, height: 20, color: "rgba(255,255,255,0.8)", display: "block" }} />
            </div>
          )}

          {/* QR badge — data-dl attr lets admin's onclone replace it with a crisp canvas */}
          <div data-dl="qr-badge" style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.5px", color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>QR</span>
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3, margin: 0 }}>{title}</h2>
          {subtitle && (
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 3, fontWeight: 300, margin: "3px 0 0" }}>{subtitle}</p>
          )}
        </div>

        {/* Rounded cap that bleeds into the QR area */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: bgColor, borderRadius: "1.25rem 1.25rem 0 0" }} />
      </div>

      {/* ── QR AREA ───────────────────────────────────────────────────── */}
      <div style={{ background: bgColor, padding: "4px 16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 8, background: "#fff" }}>
          <div ref={qrContainerRef} className={hasContent ? "block" : "opacity-20 pointer-events-none"} />
          {!hasContent && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, pointerEvents: "none" }}>
              <QrCode style={{ width: 36, height: 36, color: "#d1d5db" }} />
              <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>Enter fields to generate</p>
            </div>
          )}
        </div>

        {/* Scan row — data-dl lets admin's onclone replace icons with canvas */}
        <div data-dl="scan-row" data-scan-text={scanText} style={{ width: "100%", textAlign: "center", lineHeight: 1 }}>
          <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: 0, marginRight: 6 }}>
            <Scan style={{ width: 11, height: 11, color: "#9ca3af", display: "block" }} />
          </span>
          <span style={{ display: "inline-block", verticalAlign: "middle", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", lineHeight: 1 }}>
            {scanText}
          </span>
          <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: 0, marginLeft: 6 }}>
            <Scan style={{ width: 11, height: 11, color: "#9ca3af", display: "block" }} />
          </span>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <div style={{ padding: "8px 16px", background: `${gradFrom}22`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div data-dl="emenu" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(0,0,0,0.18)", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500, lineHeight: 1 }}>ScanMeKH</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[0.25, 0.55, 0.85].map((op, i) => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: gradFrom, opacity: op, display: "block", flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

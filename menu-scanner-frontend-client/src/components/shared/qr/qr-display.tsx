"use client";

import { memo } from "react";
import { QrCode } from "lucide-react";

interface QRDisplayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cardRef: React.RefObject<HTMLDivElement>;
  gradFrom: string;
  gradTo: string;
  bgColor: string;
  businessName: string;
  subtitle?: string;
  logoUrl?: string | null;
  scanText: string;
  link: string;
  maxWidth: number;
  footerBg: string;
}

const CARD_SHADOW = "0 20px 60px rgba(0,0,0,0.18)";

function QRDisplayComponent({
  containerRef,
  cardRef,
  gradFrom,
  gradTo,
  bgColor,
  businessName,
  subtitle,
  logoUrl,
  scanText,
  link,
  maxWidth,
  footerBg,
}: QRDisplayProps) {
  return (
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
            <div
              ref={containerRef}
              style={{ display: link ? "block" : "block", opacity: link ? 1 : 0.2 }}
            />
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
          data-qr-footer
          style={{
            padding: "8px 16px",
            background: footerBg,
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
              ScanMeKH
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
  );
}

export const QRDisplay = memo(QRDisplayComponent);

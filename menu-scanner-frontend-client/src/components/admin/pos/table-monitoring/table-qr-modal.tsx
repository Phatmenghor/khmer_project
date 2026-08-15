"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TableMonitoringItem } from "@/features/business/store/models/type/table-monitoring-type";
import { showToast } from "@/components/shared/common/show-toast";
import {
  getCustomTableQr,
  saveCustomTableQr,
  removeCustomTableQr,
} from "@/utils/table/table-qr-storage";
import {
  QrCode,
  Copy,
  Download,
  Printer,
  Check,
  Sparkles,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableMonitoringItem | null;
}

export function TableQrModal({ isOpen, onClose, table }: TableQrModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [customQrImage, setCustomQrImage] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      const saved = getCustomTableQr(table.number) || getCustomTableQr(table.id);
      setCustomQrImage(saved);
    }
  }, [table, isOpen]);

  if (!table) return null;

  const cleanNum = table.number.toString().replace(/^table-?/i, "").replace(/^#/i, "").trim();
  const tableOrderUrl = `${origin}/?table=${cleanNum}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableOrderUrl);
    setCopied(true);
    showToast.success(`Copied ordering link for Table #${table.number}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("Please select a valid image file (PNG, JPG, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        saveCustomTableQr(table.number, result);
        setCustomQrImage(result);
        showToast.success(`Uploaded & saved custom QR image for Table #${table.number}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomQr = () => {
    removeCustomTableQr(table.number);
    removeCustomTableQr(table.id);
    setCustomQrImage(null);
    showToast.info(`Cleared QR image for Table #${table.number}.`);
  };

  const handleDownloadQr = async () => {
    if (!customQrImage) return;
    try {
      const a = document.createElement("a");
      a.href = customQrImage;
      a.download = `table-${table.number}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast.success(`Downloaded QR Code for Table #${table.number}`);
    } catch {
      showToast.error("Failed to download QR image.");
    }
  };

  const handlePrintTag = () => {
    if (!customQrImage) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table Stand Tag - Table #${table.number}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
              color: #111;
            }
            .card {
              border: 3px solid #111;
              border-radius: 24px;
              padding: 32px 28px;
              text-align: center;
              width: 280px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            .badge {
              display: inline-block;
              background: #000;
              color: #fff;
              font-weight: 800;
              font-size: 11px;
              letter-spacing: 1px;
              text-transform: uppercase;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 28px;
              font-weight: 900;
              margin: 4px 0 2px 0;
            }
            p.sub {
              font-size: 12px;
              color: #666;
              margin: 0 0 20px 0;
              font-weight: 600;
            }
            .qr-wrapper {
              background: #f8f9fa;
              padding: 16px;
              border-radius: 16px;
              border: 1px solid #e9ecef;
              display: inline-block;
              margin-bottom: 16px;
            }
            .qr-wrapper img {
              width: 210px;
              height: 210px;
              display: block;
              object-fit: contain;
            }
            p.scan-instructions {
              font-size: 13px;
              font-weight: 700;
              margin: 0;
              color: #222;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">E-Menu Scan to Order</div>
            <h1>TABLE #${table.number}</h1>
            <p class="sub">${table.zone} • Capacity: ${table.capacity} Guests</p>
            <div class="qr-wrapper">
              <img src="${customQrImage}" alt="Table QR Code" />
            </div>
            <p class="scan-instructions">📱 Point camera to browse menu & order</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="sm">
      <FormHeader
        title={`Table ${table.number} - QR & Link`}
        description={`Zone: ${table.zone} • Capacity: ${table.capacity} Guests`}
        avatarIcon={<QrCode className="w-5 h-5 text-primary" />}
        showAvatar
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* QR Code Display Card or Empty State */}
        {customQrImage ? (
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/30 border border-border/80 text-center space-y-3 shadow-2xs relative">
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-emerald-500" />
              Generated QR Image
            </span>

            <div className="p-3 bg-white rounded-2xl border border-border/60 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customQrImage}
                alt={`QR Code for Table ${table.number}`}
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>

            <div className="space-y-0.5">
              <h4 className="font-semibold text-sm text-foreground">
                Table {table.number} QR Card
              </h4>
              <p className="text-xs text-muted-foreground font-normal">
                Saved design from QR Generator / Upload
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveCustomQr}
              className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Remove Saved QR Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-dashed border-border/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground">
                No Saved QR Image for Table {table.number}
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-normal">
                Generate a branded QR card in QR Studio or upload a custom QR image to save for Table {table.number}.
              </p>
            </div>
          </div>
        )}

        {/* Ordering Link Copy Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Direct Table Link</label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={tableOrderUrl}
              className="h-9 text-xs font-mono rounded-xl bg-muted/40 border-border/80 flex-1 truncate"
            />
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 text-xs font-bold rounded-xl shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </CustomButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border/60 space-y-2">
          {customQrImage ? (
            <div className="grid grid-cols-2 gap-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleDownloadQr}
                className="h-9 text-xs font-bold rounded-xl gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Download PNG
              </CustomButton>

              <CustomButton
                type="button"
                variant="primary"
                onClick={handlePrintTag}
                className="h-9 text-xs font-bold rounded-xl gap-1.5 bg-primary text-primary-foreground shadow-xs hover:shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Stand Tag
              </CustomButton>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 text-xs font-bold rounded-xl gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              Upload QR Image
            </CustomButton>

            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => {
                onClose();
                router.push(`/admin/qr-generator?tableNumber=${encodeURIComponent(table.number)}`);
              }}
              className="h-9 text-xs font-bold rounded-xl gap-1.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Generate in QR Studio
            </CustomButton>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}

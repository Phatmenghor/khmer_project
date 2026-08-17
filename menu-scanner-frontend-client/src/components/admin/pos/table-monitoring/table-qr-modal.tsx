"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect, SelectOption } from "@/components/shared/common/custom-select";
import {
  TableMonitoringItem,
  TableMonitoringStatus,
} from "@/features/business/store/models/type/table-monitoring-type";
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";
import {
  getCustomTableQr,
  saveCustomTableQr,
  removeCustomTableQr,
} from "@/utils/table/table-qr-storage";
import {
  QrCode,
  Copy,
  Check,
  Upload,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MANUALLY_SELECTABLE_TABLE_STATUS_OPTIONS,
  getTableStatusBadgeClass,
} from "@/constants/status/status";

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableMonitoringItem | null;
  onSaveTableDetails?: (
    tableId: string,
    payload: { number?: string; zone?: string; capacity?: number; status?: TableMonitoringStatus }
  ) => Promise<void>;
  onResetTableOrder?: (tableId: string) => void;
  onTriggerReservation?: (table: TableMonitoringItem) => void;
  onOpenSessionDetails?: (table: TableMonitoringItem) => void;
}

export function TableQrModal({
  isOpen,
  onClose,
  table,
  onSaveTableDetails,
  onResetTableOrder,
  onTriggerReservation,
  onOpenSessionDetails,
}: TableQrModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [customQrImage, setCustomQrImage] = useState<string | null>(null);

  // Form states for table editing
  const [tableNum, setTableNum] = useState<string>("");
  const [tableZone, setTableZone] = useState<string>("Main Hall");
  const [tableCapacity, setTableCapacity] = useState<number>(4);
  const [tableStatus, setTableStatus] = useState<TableMonitoringStatus>("AVAILABLE");
  const [isSaving, setIsSaving] = useState(false);
  const [showActiveOrderResetAlert, setShowActiveOrderResetAlert] = useState(false);

  useEffect(() => {
    if (table) {
      const saved = getCustomTableQr(table.number) || getCustomTableQr(table.id);
      setCustomQrImage(saved);

      const clean = table.number.toString().replace(/^table-?/i, "").replace(/^#/i, "").trim();
      setTableNum(clean);
      setTableZone(table.zone || "Main Hall");
      setTableCapacity(table.capacity || 4);
      setTableStatus(table.status || "AVAILABLE");
      setShowActiveOrderResetAlert(false);
    }
  }, [table, isOpen]);

  const statusSelectOptions: SelectOption[] = useMemo(() => {
    const opts = [...MANUALLY_SELECTABLE_TABLE_STATUS_OPTIONS];
    if (table?.status === "OCCUPIED" || table?.activeOrder) {
      opts.unshift({ value: "OCCUPIED", label: "🔴 Occupied (Active Order)" });
    }
    return opts;
  }, [table]);

  if (!table) return null;

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const tableOrderUrl = `${originUrl}/?table=${tableNum || table.number}`;

  const handleStatusSelect = (val: string) => {
    const targetStatus = val as TableMonitoringStatus;
    if (targetStatus === tableStatus) return;

    const hasOrder = Boolean(table.activeOrder);

    if (hasOrder && (targetStatus === "AVAILABLE" || targetStatus === "RESERVED" || targetStatus === "MAINTENANCE")) {
      onClose();
      if (onOpenSessionDetails && table) {
        onOpenSessionDetails(table);
      } else {
        setShowActiveOrderResetAlert(true);
      }
      return;
    }

    if (targetStatus === "RESERVED") {
      showToast.info(`Opening reservation booking setup for Table #${tableNum}...`);
      setTableStatus("RESERVED");
      if (onTriggerReservation && table) {
        onTriggerReservation(table);
      }
    } else if (targetStatus === "MAINTENANCE") {
      showToast.success(`Table #${tableNum} status updated to Maintenance 🟡`);
      setTableStatus("MAINTENANCE");
    } else {
      setTableStatus(targetStatus);
    }
  };

  const handleConfirmResetFromModal = () => {
    if (onResetTableOrder) {
      onResetTableOrder(table.id);
    }
    setTableStatus("AVAILABLE");
    setShowActiveOrderResetAlert(false);
    showToast.success(`Reset Table #${tableNum} and set status to Available 🟢`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableOrderUrl);
    setCopied(true);
    showToast.success(`Copied ordering link for Table #${tableNum}!`);
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
        saveCustomTableQr(tableNum, result);
        setCustomQrImage(result);
        showToast.success(`Uploaded & saved custom QR image for Table #${tableNum}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomQr = () => {
    removeCustomTableQr(table.number);
    removeCustomTableQr(tableNum);
    removeCustomTableQr(table.id);
    setCustomQrImage(null);
    showToast.info(`Cleared QR image for Table #${tableNum}.`);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (onSaveTableDetails) {
        await onSaveTableDetails(table.id, {
          number: tableNum,
          zone: tableZone,
          capacity: Number(tableCapacity),
          status: tableStatus,
        });
      }
      showToast.success(`Updated table details for Table #${tableNum}!`);
      onClose();
    } catch {
      showToast.error("Failed to update table details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <CustomModal isOpen={isOpen} onClose={onClose} size="xl">
        {/* ── Form Header (System Edit Style) ── */}
        <FormHeader
          title={`Edit Table #${tableNum}`}
          subtitle="Update table details, status, ordering link, and custom QR image"
          avatarIcon={<QrCode className="w-5 h-5 text-primary" />}
          showAvatar
        />

        <div className="p-3.5 sm:p-4 space-y-3 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* ── All Table Fields Form Section ── */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                Edit Table Details
              </h4>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border transition-all",
                  getTableStatusBadgeClass(tableStatus)
                )}
              >
                {tableStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Table Code / Number</Label>
                <Input
                  value={tableNum}
                  onChange={(e) => setTableNum(e.target.value)}
                  placeholder="e.g. 01, T-12"
                  className="h-9 text-xs font-mono font-medium rounded-xl bg-muted/40 border-border/80 text-foreground shadow-2xs focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Shop Zone / Section</Label>
                <Input
                  value={tableZone}
                  onChange={(e) => setTableZone(e.target.value)}
                  placeholder="e.g. Main Hall, Terrace, VIP"
                  className="h-9 text-xs font-mono font-medium rounded-xl bg-muted/40 border-border/80 text-foreground shadow-2xs focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Guest Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(Number(e.target.value))}
                  className="h-9 text-xs font-mono font-medium rounded-xl bg-muted/40 border-border/80 text-foreground shadow-2xs focus-visible:ring-primary/20"
                />
              </div>

              {/* Editable Live Table Status CustomSelect */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Live Table Status</Label>
                <CustomSelect
                  options={statusSelectOptions}
                  value={tableStatus}
                  onValueChange={handleStatusSelect}
                  placeholder="Select status..."
                  size="md"
                  clearable={false}
                />
              </div>
            </div>

            {/* Direct Ordering Link Field */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-muted-foreground">Direct Table Ordering URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={tableOrderUrl}
                  className="h-9 text-xs font-mono font-medium rounded-xl bg-muted/40 border-border/80 text-foreground shadow-2xs flex-1 truncate"
                />
                <CustomButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-9 px-3.5 text-xs font-bold rounded-xl shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </CustomButton>
              </div>
            </div>
          </div>

          {/* ── Space Upload QR Section ── */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                Upload Space for Table QR
              </h4>
              {customQrImage && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                  Custom QR Uploaded
                </span>
              )}
            </div>

            {customQrImage ? (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-2.5">
                <div className="p-3 bg-white rounded-2xl border border-border/60 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customQrImage}
                    alt={`QR Code for Table ${tableNum}`}
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <CustomButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    Replace Image
                  </CustomButton>

                  <CustomButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCustomQr}
                    className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    Remove
                  </CustomButton>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-muted/20 border-2 border-dashed border-border/80 hover:border-primary/50 text-center space-y-2 cursor-pointer transition-all hover:bg-primary/5"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    Click or Drop Image to Upload Table QR
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports PNG, JPG, or SVG images up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── System Standard Footer ── */}
        <div className="flex gap-2 justify-end border-t pt-3 px-4 pb-3 bg-background sticky bottom-0 border-border/80">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
          >
            Save
          </CustomButton>
        </div>
      </CustomModal>

      {/* ── Active Order Alert Modal ── */}
      <CustomModal
        isOpen={showActiveOrderResetAlert}
        onClose={() => setShowActiveOrderResetAlert(false)}
        title={`Active Order Alert — Table #${tableNum}`}
        size="sm"
      >
        <div className="p-4 px-5 space-y-3 bg-card">
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-bold text-xs text-foreground">Active Dining Order in Progress</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Table #{tableNum} has an open order #{table?.activeOrder?.orderNumber || "1001"} ({formatCurrency(table?.activeOrder?.totalAmount || 0)}).
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            To set this table status to 🟢 Available, you can reset the table session and clear the active order.
          </p>
        </div>
        <div className="flex gap-2 justify-end border-t pt-3 px-4 pb-3 bg-background sticky bottom-0 border-border/80">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => setShowActiveOrderResetAlert(false)}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            variant="destructive"
            onClick={handleConfirmResetFromModal}
          >
            Reset Table
          </CustomButton>
        </div>
      </CustomModal>
    </>
  );
}

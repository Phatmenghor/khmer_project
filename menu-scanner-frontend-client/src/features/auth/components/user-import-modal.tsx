"use client";

import React, { useCallback, useRef, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import {
  mapRowToCreateRequest,
  ParsedUserRow,
  parseUserImportFile,
} from "@/utils/excel/user-excel.utils";
import { createUserService } from "@/features/auth/store/thunks/users-thunks";
import { useAppDispatch } from "@/store";

// ── Types ─────────────────────────────────────────────────────────────────────

type RowStatus = "pending" | "success" | "error";

interface ImportRow {
  [key: string]: any;
  __status: RowStatus;
  __error?: string;
}

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userType?: string;
  businessId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserImportModal({
  isOpen,
  onClose,
  onSuccess,
  userType = "BUSINESS_USER",
  businessId,
}: UserImportModalProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [importDone, setImportDone] = useState(false);

  // ── File processing ──────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      showToast.error("Only .xlsx and .xls files are supported.");
      return;
    }
    setFileName(file.name);
    setImportDone(false);
    try {
      const { headers: h, rows: r, errors } = await parseUserImportFile(file);
      setHeaders(h);
      setRows(r.map((row) => ({ ...row, __status: "pending" })));
      setParseErrors(errors);
    } catch (e: any) {
      showToast.error(e.message || "Failed to parse file.");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Batch import ─────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!rows.length) return;
    setIsImporting(true);

    const updated = [...rows];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].__status === "success") { successCount++; continue; }

      try {
        const payload = mapRowToCreateRequest(updated[i] as any, userType, businessId);
        await dispatch(createUserService(payload as any)).unwrap();
        updated[i] = { ...updated[i], __status: "success", __error: undefined };
        successCount++;
      } catch (err: any) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || err?.error || "Failed to create user";
        updated[i] = { ...updated[i], __status: "error", __error: msg };
        errorCount++;
      }

      setRows([...updated]);
    }

    setIsImporting(false);
    setImportDone(true);

    if (successCount > 0 && errorCount === 0) {
      showToast.success(`All ${successCount} users imported successfully!`);
      onSuccess?.();
    } else if (successCount > 0) {
      showToast.success(`${successCount} imported, ${errorCount} failed. Fix errors and retry.`);
      onSuccess?.();
    } else {
      showToast.error(`All ${errorCount} rows failed. Please check the errors below.`);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setHeaders([]);
    setRows([]);
    setParseErrors([]);
    setFileName("");
    setImportDone(false);
  };

  const handleClose = () => {
    if (isImporting) return;
    handleReset();
    onClose();
  };

  // ── Stats ────────────────────────────────────────────────────────────────

  const totalRows = rows.length;
  const successRows = rows.filter((r) => r.__status === "success").length;
  const errorRows = rows.filter((r) => r.__status === "error").length;
  const pendingRows = rows.filter((r) => r.__status === "pending").length;
  const hasFailures = errorRows > 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="max-h-[90vh] flex flex-col p-0 gap-0"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-border flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground leading-none">
              Import Users from Excel
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">
              Upload a .xlsx file — preview data below then click Import
            </p>
          </div>
        </div>
        {totalRows > 0 && (
          <div className="flex items-center gap-1.5 mr-6">
            <Badge variant="secondary" className="text-xs">{totalRows} rows</Badge>
            {successRows > 0 && (
              <Badge className="text-xs bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                {successRows} ✓
              </Badge>
            )}
            {errorRows > 0 && (
              <Badge className="text-xs bg-red-500/20 text-red-500 border-red-500/30">
                {errorRows} ✗
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-hidden px-5 py-4 gap-4">
        {/* Drop zone — shown when no file yet */}
        {!totalRows && (
          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
              ${isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop your Excel file here
            </p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-3">.xlsx, .xls supported</p>
          </div>
        )}

        {/* File info strip */}
        {fileName && totalRows > 0 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 border border-border text-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span className="text-foreground font-medium">{fileName}</span>
              <span className="text-muted-foreground">— {totalRows} rows detected</span>
            </div>
            {!isImporting && (
              <button
                onClick={handleReset}
                className="text-muted-foreground hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Validation Warnings ({parseErrors.length})
            </div>
            {parseErrors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-xs text-amber-600 pl-5">{err}</p>
            ))}
            {parseErrors.length > 5 && (
              <p className="text-xs text-amber-500 pl-5">+{parseErrors.length - 5} more…</p>
            )}
          </div>
        )}

        {/* Data preview table */}
        {totalRows > 0 && (
          <ScrollArea className="flex-1 border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr>
                    {/* Status column */}
                    <th className="px-3 py-2.5 text-left text-muted-foreground font-medium border-b border-border w-8">
                      #
                    </th>
                    <th className="px-3 py-2.5 text-left text-muted-foreground font-medium border-b border-border w-20">
                      Status
                    </th>
                    {/* Dynamic headers from the Excel file */}
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-muted-foreground font-medium border-b border-border whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`border-b border-border/60 transition-colors
                        ${row.__status === "success" ? "bg-emerald-500/5" : ""}
                        ${row.__status === "error" ? "bg-red-500/5" : ""}
                        ${row.__status === "pending" ? "hover:bg-muted/40" : ""}
                      `}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{rowIdx + 1}</td>
                      <td className="px-3 py-2">
                        {row.__status === "pending" && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Pending
                          </Badge>
                        )}
                        {row.__status === "success" && (
                          <span className="flex items-center gap-1 text-emerald-500 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        )}
                        {row.__status === "error" && (
                          <span
                            className="flex items-center gap-1 text-red-500 cursor-help"
                            title={row.__error}
                          >
                            <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{row.__error}</span>
                          </span>
                        )}
                      </td>
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="px-3 py-2 text-foreground whitespace-nowrap max-w-[180px] truncate"
                          title={row[h]}
                        >
                          {row[h] || <span className="text-muted-foreground/50">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0 bg-muted/30">
        <div className="text-xs text-muted-foreground">
          {totalRows > 0
            ? `${pendingRows} pending · ${successRows} success · ${errorRows} error`
            : "No file selected"}
        </div>
        <div className="flex items-center gap-2">
          <CustomButton variant="outline" size="sm" onClick={handleClose} disabled={isImporting}>
            {importDone && !hasFailures ? "Close" : "Cancel"}
          </CustomButton>

          {totalRows > 0 && !isImporting && (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1"
            >
              <Upload className="w-3 h-3" />
              Replace File
            </CustomButton>
          )}

          {totalRows > 0 && (
            <CustomButton
              size="sm"
              onClick={handleImport}
              disabled={isImporting || pendingRows === 0}
              className="gap-1.5 min-w-[120px]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importing…
                </>
              ) : hasFailures && importDone ? (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Retry {errorRows} Failed
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Import {pendingRows} Users
                </>
              )}
            </CustomButton>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </CustomModal>
  );
}

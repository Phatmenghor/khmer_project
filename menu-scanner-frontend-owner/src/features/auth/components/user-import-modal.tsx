"use client";

import React, { useCallback, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

// ── Types ─────────────────────────────────────────────────────────────────────

type RowStatus = "pending" | "success" | "error";

interface ImportRow extends Record<string, any> {
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
  const dispatch = useDispatch<AppDispatch>();
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
        const payload = mapRowToCreateRequest(updated[i], userType, businessId);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full xl:max-w-7xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <FileSpreadsheet className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Import Users from Excel
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload a .xlsx file — preview data below then click Import
                </p>
              </div>
            </div>
            {totalRows > 0 && (
              <div className="flex items-center gap-1.5 mr-6">
                <Badge variant="secondary" className="text-xs">{totalRows} rows</Badge>
                {successRows > 0 && (
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    {successRows} ✓
                  </Badge>
                )}
                {errorRows > 0 && (
                  <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                    {errorRows} ✗
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden px-5 py-4 gap-4">
          {/* Drop zone — shown when no file yet */}
          {!totalRows && (
            <div
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
                ${isDragging
                  ? "border-pink-500 bg-pink-500/10"
                  : "border-gray-700 hover:border-pink-500/50 hover:bg-gray-800/50"
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
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <p className="text-sm font-medium text-gray-300">
                Drag & drop your Excel file here
              </p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-600 mt-3">.xlsx, .xls supported</p>
            </div>
          )}

          {/* File info strip */}
          {fileName && totalRows > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 font-medium">{fileName}</span>
                <span className="text-gray-500">— {totalRows} rows detected</span>
              </div>
              {!isImporting && (
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-red-400 transition-colors"
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
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Validation Warnings ({parseErrors.length})
              </div>
              {parseErrors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-xs text-amber-300/80 pl-5">{err}</p>
              ))}
              {parseErrors.length > 5 && (
                <p className="text-xs text-amber-500 pl-5">+{parseErrors.length - 5} more…</p>
              )}
            </div>
          )}

          {/* Data preview table */}
          {totalRows > 0 && (
            <ScrollArea className="flex-1 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10 bg-gray-900">
                    <tr>
                      {/* Status column */}
                      <th className="px-3 py-2.5 text-left text-gray-400 font-medium border-b border-gray-800 w-8">
                        #
                      </th>
                      <th className="px-3 py-2.5 text-left text-gray-400 font-medium border-b border-gray-800 w-20">
                        Status
                      </th>
                      {/* Dynamic headers from the Excel file */}
                      {headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-gray-400 font-medium border-b border-gray-800 whitespace-nowrap"
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
                        className={`border-b border-gray-800/60 transition-colors
                          ${row.__status === "success" ? "bg-green-500/5" : ""}
                          ${row.__status === "error" ? "bg-red-500/5" : ""}
                          ${row.__status === "pending" ? "hover:bg-gray-800/40" : ""}
                        `}
                      >
                        <td className="px-3 py-2 text-gray-500">{rowIdx + 1}</td>
                        <td className="px-3 py-2">
                          {row.__status === "pending" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Pending
                            </Badge>
                          )}
                          {row.__status === "success" && (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Done
                            </span>
                          )}
                          {row.__status === "error" && (
                            <span
                              className="flex items-center gap-1 text-red-400 cursor-help"
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
                            className="px-3 py-2 text-gray-300 whitespace-nowrap max-w-[180px] truncate"
                            title={row[h]}
                          >
                            {row[h] || <span className="text-gray-600">—</span>}
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 flex-shrink-0 bg-gray-900/50">
          <div className="text-xs text-gray-500">
            {totalRows > 0
              ? `${pendingRows} pending · ${successRows} success · ${errorRows} error`
              : "No file selected"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting}>
              {importDone && !hasFailures ? "Close" : "Cancel"}
            </Button>

            {totalRows > 0 && !isImporting && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1"
              >
                <Upload className="w-3 h-3" />
                Replace File
              </Button>
            )}

            {totalRows > 0 && (
              <Button
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
              </Button>
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
      </DialogContent>
    </Dialog>
  );
}

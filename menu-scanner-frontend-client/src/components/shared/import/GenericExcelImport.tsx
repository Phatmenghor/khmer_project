"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAdminToken, getToken } from "@/utils/local-storage/token";
import { CustomButton, DownloadTemplateButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shared/common/page-container";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { TextField } from "@/components/shared/form-field/text-field";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { BaseImportRow, ImportTableColumn, BatchImportResponse } from "./types";

function ImportImageCell({
  row,
  onChange,
  disabled,
  isWide,
}: {
  row: any;
  onChange: (file: File | null) => void;
  disabled: boolean;
  isWide?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const file = row.__imageFile;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex items-center gap-2 py-0.5">
      {previewUrl ? (
        <div className={`relative ${isWide ? "w-24 h-10" : "w-10 h-10"} rounded border border-border overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center`}>
          <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl hover:bg-red-600 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={`${isWide ? "w-24 h-10" : "w-10 h-10"} rounded border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all bg-muted/20`}
          title="Select Image"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[7px] font-medium leading-none mt-0.5">Image</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onChange(selected);
        }}
        className="hidden"
      />
    </div>
  );
}

interface GenericExcelImportProps<T extends BaseImportRow> {
  title: string;
  description: string;
  backRoute: string;
  entityName: string;
  downloadTemplate: () => void;
  parseFile: (file: File) => Promise<{ rows: T[]; errors: string[] }>;
  onImportBatch: (rows: T[], importId?: string) => Promise<BatchImportResponse>;
  onValidateRow?: (row: T) => {
    isValid: boolean;
    error?: string;
    fieldErrors?: Record<string, boolean>;
  };
  determineFieldErrors?: (row: T, errorMsg: string) => Record<string, boolean>;
  columns: ImportTableColumn<T>[];
  rowIdentifierKey?: keyof T;
  onSuccess?: () => void;
  disableRedirectOnSuccess?: boolean;
}

export function GenericExcelImport<T extends BaseImportRow>({
  title,
  description,
  backRoute,
  entityName,
  downloadTemplate,
  parseFile,
  onImportBatch,
  onValidateRow,
  determineFieldErrors,
  columns,
  rowIdentifierKey,
  onSuccess,
  disableRedirectOnSuccess = true,
}: GenericExcelImportProps<T>) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<T[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [importDone, setImportDone] = useState(false);

  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  // Initialize react-hook-form
  const { control, reset, setValue } = useForm();

  // ── Horizontal Table Scroll Controls ─────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftScroll(el.scrollLeft > 2);
    setShowRightScroll(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    const timeout = setTimeout(checkScroll, 100);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeout);
    };
  }, [rows, checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Sync rows data to react-hook-form using structured array notation: name-name-name
  useEffect(() => {
    const values: Record<string, any> = {};
    values[entityName] = rows.map((row) => {
      const rowValues: Record<string, any> = {};
      columns.forEach((col) => {
        rowValues[String(col.fieldKey)] = row[col.fieldKey];
      });
      return rowValues;
    });
    reset(values);
  }, [rows, columns, entityName, reset]);

  // ── File processing ───────────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showToast.error("Only .xlsx and .xls files are supported.");
        return;
      }
      setFileName(file.name);
      setImportDone(false);
      setIsParsingFile(true);

      // Minor delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        const { rows: r, errors } = await parseFile(file);
        setRows(r);
        setParseErrors(errors);
      } catch (e: any) {
        showToast.error(e.message || "Failed to parse file.");
      } finally {
        setIsParsingFile(false);
      }
    },
    [parseFile]
  );

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

  const handleDeleteRow = (rowIdx: number) => {
    const updated = [...rows];
    updated.splice(rowIdx, 1);
    setRows(updated);
  };

  const handleCellChange = (rowIdx: number, field: keyof T, value: any) => {
    const updated = [...rows];
    const fieldErrKey = `__${String(field)}Error`;

    updated[rowIdx] = {
      ...updated[rowIdx],
      [field]: value,
      ...(updated[rowIdx].__status === "error"
        ? { __status: "pending", __error: undefined }
        : {}),
      ...(fieldErrKey in (updated[rowIdx] as any) ? { [fieldErrKey]: false } : {}),
    };
    setRows(updated);
    setValue(`${entityName}.${rowIdx}.${String(field)}`, value);
  };

  const handleImport = async () => {
    const rowsToProcess = rows.filter((r) => r.__status !== "success");
    if (!rowsToProcess.length || hasValidationErrors) return;

    setIsImporting(true);
    setImportDone(false);

    // Scroll to top so the user can monitor import
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    const updated = [...rows];
    let clientValidationErrorCount = 0;

    // Client-side validations first
    rowsToProcess.forEach((row) => {
      if (onValidateRow) {
        const { isValid, error, fieldErrors } = onValidateRow(row);
        if (!isValid) {
          const idx = rows.indexOf(row);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              __status: "error",
              __error: error || "Validation error",
              ...fieldErrors,
            };
            clientValidationErrorCount++;
          }
        }
      }
    });

    if (clientValidationErrorCount > 0) {
      setRows(updated);
      setIsImporting(false);
      showToast.error(`Please fix validation errors on ${clientValidationErrorCount} rows first.`);
      return;
    }

    // Mark as pending
    rowsToProcess.forEach((row) => {
      const idx = rows.indexOf(row);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          __status: "pending",
          __error: undefined,
        };
      }
    });
    setRows(updated);

    const totalCount = rowsToProcess.length;
    setTotalToProcess(totalCount);
    setProcessedCount(0);
    setImportProgress(0);

    // Map rows to process to their original indices in the main rows state
    const rowsToProcessWithIndex = rows
      .map((row, index) => ({ row, index }))
      .filter((item) => item.row.__status !== "success");

    // Generate a unique import ID
    const importId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const wsUrl = `${apiBase || window.location.origin}/ws`;

    const token =
      (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")
        ? getAdminToken()
        : getToken()) || "";

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        stompClient.subscribe(`/topic/import-progress/${importId}`, (message) => {
          try {
            const event = JSON.parse(message.body);
            if (event.type === "IMPORT_PROGRESS" && event.payload) {
              const { progress, processed, total, lastResult } = event.payload;

              setProcessedCount(processed);
              setImportProgress(progress);
              setTotalToProcess(total);

              if (lastResult && typeof lastResult.index === "number" && lastResult.index < rowsToProcessWithIndex.length) {
                setRows((prevRows) => {
                  const newRows = [...prevRows];
                  const originalIndex = rowsToProcessWithIndex[lastResult.index].index;
                  if (originalIndex >= 0 && originalIndex < newRows.length) {
                    if (lastResult.success) {
                      newRows[originalIndex] = {
                        ...newRows[originalIndex],
                        __status: "success",
                        __error: undefined,
                      };
                    } else {
                      const msg = lastResult.error || `Failed to import ${entityName}`;
                      const fieldErrors = determineFieldErrors
                        ? determineFieldErrors(newRows[originalIndex], msg)
                        : {};
                      newRows[originalIndex] = {
                        ...newRows[originalIndex],
                        __status: "error",
                        __error: msg,
                        ...fieldErrors,
                      };
                    }
                  }
                  return newRows;
                });
              }
            }
          } catch (e) {
            // ignore JSON parse errors
          }
        });
      },
    });

    stompClient.activate();

    try {
      // Call batch API endpoint
      const batchResult: BatchImportResponse = await onImportBatch(rowsToProcess, importId);

      setRows((prevRows) => {
        const finalRows = [...prevRows];
        batchResult.results.forEach((res) => {
          if (res.index < rowsToProcessWithIndex.length) {
            const originalIndex = rowsToProcessWithIndex[res.index].index;
            if (originalIndex >= 0 && originalIndex < finalRows.length) {
              if (res.success) {
                finalRows[originalIndex] = {
                  ...finalRows[originalIndex],
                  __status: "success",
                  __error: undefined,
                };
              } else {
                const msg = res.error || `Failed to import ${entityName}`;
                const fieldErrors = determineFieldErrors
                  ? determineFieldErrors(finalRows[originalIndex], msg)
                  : {};
                finalRows[originalIndex] = {
                  ...finalRows[originalIndex],
                  __status: "error",
                  __error: msg,
                  ...fieldErrors,
                };
              }
            }
          }
        });
        return finalRows;
      });

      setProcessedCount(totalCount);
      setImportProgress(100);
      setIsImporting(false);
      setImportDone(true);

      const successCount = batchResult.successCount;
      const errorCount = batchResult.errorCount;

      if (successCount > 0 && errorCount === 0) {
        showToast.success(`All ${successCount} ${entityName} imported successfully!`);
        onSuccess?.();
        if (!disableRedirectOnSuccess) {
          setTimeout(() => {
            router.push(backRoute);
          }, 1500);
        }
      } else if (successCount > 0) {
        showToast.success(`${successCount} imported successfully. ${errorCount} failed rows remain.`);
        onSuccess?.();
      } else {
        showToast.error(`All ${errorCount} rows failed. Please check the errors listed.`);
      }
    } catch (err: any) {
      setIsImporting(false);
      setImportDone(true);
      const msg = typeof err === "string" ? err : err?.message || err?.error || "Batch import failed.";
      showToast.error(msg);

      // Mark any remaining pending rows as error
      setRows((prevRows) =>
        prevRows.map((r) =>
          r.__status === "pending"
            ? { ...r, __status: "error", __error: msg }
            : r
        )
      );

      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      stompClient.deactivate();
    }
  };

  const handleReset = () => {
    setRows([]);
    setParseErrors([]);
    setFileName("");
    setImportDone(false);
  };

  const hasValidationErrors = useMemo(() => {
    if (onValidateRow) {
      return rows
        .filter((r) => r.__status !== "success")
        .some((row) => !onValidateRow(row).isValid);
    }
    return false;
  }, [rows, onValidateRow]);

  const activeRowErrors = useMemo(() => {
    return rows
      .map((r, idx) => {
        const identifierVal = rowIdentifierKey ? r[rowIdentifierKey] : "";
        return {
          idx: idx + 1,
          error: r.__error,
          identifier: typeof identifierVal === "string" ? identifierVal : "Unknown",
        };
      })
      .filter((r) => r.error);
  }, [rows, rowIdentifierKey]);

  const totalRows = rows.length;
  const successRows = rows.filter((r) => r.__status === "success").length;
  const errorRows = rows.filter((r) => r.__status === "error").length;
  const pendingRows = rows.filter((r) => r.__status === "pending").length;
  const hasFailures = errorRows > 0;

  const isImportDisabled =
    isImporting ||
    hasValidationErrors ||
    rows.length === 0 ||
    rows.every((r) => r.__status === "success");

  // Auto-scroll to results/errors when import finishes
  useEffect(() => {
    if (importDone) {
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [importDone]);

  return (
    <PageContainer className="py-3 flex flex-col gap-3 min-h-[calc(100vh-80px)] overflow-hidden">
      <div ref={topRef} />
      {/* Page Header */}
      <div className="flex items-center justify-between py-3 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => router.push(backRoute)}
            disabled={isImporting}
            className="h-6 w-5 hover:bg-transparent shrink-0 p-0 m-0 border-none bg-transparent"
            title="Go back"
            icon={<ArrowLeft className="h-3 w-3" />}
          />
          <div className="flex flex-col pl-0.5">
            <h1 className="text-xs sm:text-sm font-bold text-foreground">{title}</h1>
            <p className="text-xs sm:text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <DownloadTemplateButton
            onDownload={downloadTemplate}
            className="h-8 min-w-[155px]"
          >
            Download Template
          </DownloadTemplateButton>
        </div>
      </div>

      {/* Main Card */}
      <Card className="flex flex-col border-border bg-card">
        {/* Drop zone */}
        {!totalRows && !isParsingFile && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center min-h-[400px]">
            <div
              className={`w-full max-w-xl relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer
                ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
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
              <div className="p-4 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Upload your Excel file</h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Drag and drop your template file here, or click to browse files from your computer.
              </p>
              <Badge variant="outline" className="mt-4 text-[10px] text-muted-foreground border-border bg-background">
                Only .xlsx and .xls formats are supported
              </Badge>
            </div>
          </div>
        )}

        {/* Skeleton Loading Table */}
        {isParsingFile && (
          <div className="flex flex-col border-border">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 text-xs">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-foreground font-semibold">Reading spreadsheet data, please wait...</span>
              </div>
            </div>
            <div className="p-3">
              <div className="rounded border border-border overflow-x-auto overflow-y-clip">
                <table
                  className="text-xs w-full"
                  style={{
                    tableLayout: "fixed",
                    minWidth: "100%",
                    width: "auto",
                  }}
                >
                  <thead className="bg-muted/50 sticky top-0 z-10 border-b border-border shadow-sm">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-12 bg-muted/90">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-16 bg-muted/90">Actions</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-28 bg-muted/90">Status</th>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border bg-muted/90"
                          style={{
                            width: col.width || "160px",
                            minWidth: col.minWidth || "140px",
                          }}
                        >
                          {col.label} {col.required && <span className="text-red-500">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-border/50 h-[40px]">
                        <td className="px-3 py-3 w-12"><div className="h-3 w-4 bg-muted animate-pulse rounded" /></td>
                        <td className="px-3 py-3 w-16"><div className="h-3 w-6 bg-muted animate-pulse rounded" /></td>
                        <td className="px-3 py-3 w-28"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></td>
                        {columns.map((_, c) => (
                          <td key={c} className="px-2 py-2">
                            <div className="h-8 bg-muted/40 animate-pulse rounded-md border border-border/10" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic preview list */}
        {totalRows > 0 && !isParsingFile && (
          <div className="flex flex-col border-border">
            {/* Header info bar */}
            <div className="sticky top-[46px] z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 pt-1.5 flex justify-between items-center h-10 px-2 border-b border-border/80 shadow-sm transition-all duration-200 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="text-foreground font-semibold truncate max-w-[150px] sm:max-w-xs">{fileName}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground font-medium">{totalRows} rows loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(showLeftScroll || showRightScroll) && (
                  <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border/50 flex-shrink-0">
                    <CustomButton
                      variant="unstyled"
                      size="unstyled"
                      type="button"
                      onClick={() => handleScroll("left")}
                      className="h-6 w-6 flex items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-150"
                      icon={<ChevronLeft className="h-3 w-3" />}
                      title="Scroll Left"
                    />
                    <span className="text-[10px] font-semibold text-muted-foreground px-1 select-none">
                      Scroll Table
                    </span>
                    <CustomButton
                      variant="unstyled"
                      size="unstyled"
                      type="button"
                      onClick={() => handleScroll("right")}
                      className="h-6 w-6 flex items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-150"
                      icon={<ChevronRight className="h-3 w-3" />}
                      title="Scroll Right"
                    />
                  </div>
                )}
                {!isImporting && (
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear File
                  </CustomButton>
                )}
              </div>
            </div>

            {/* Parse Warnings block */}
            {parseErrors.length > 0 && (
              <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Validation Warnings ({parseErrors.length})
                </div>
                {parseErrors.slice(0, 3).map((err, i) => (
                  <p key={i} className="text-xs text-amber-600 pl-5">{err}</p>
                ))}
                {parseErrors.length > 3 && (
                  <p className="text-xs text-amber-500 pl-5 font-medium">
                    +{parseErrors.length - 3} more...
                  </p>
                )}
              </div>
            )}

            {/* Centralized failure monitoring panel */}
            {activeRowErrors.length > 0 && (
              <div ref={!isImporting ? progressRef : undefined} className="mx-4 mt-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-red-500 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Import Failure Summary ({activeRowErrors.length})
                </h4>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1 max-h-[120px] overflow-y-auto pr-2">
                  {activeRowErrors.map((err, i) => (
                    <li key={i}>
                      Row {err.idx} ({err.identifier || "Unknown"}): {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress Bar Panel */}
            {isImporting && (
              <div ref={progressRef} className="mx-4 mt-3 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Importing {entityName}...
                  </span>
                  <span className="font-bold text-primary">{importProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Processed {processedCount} of {totalToProcess} rows</span>
                  <span className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{successRows} succeeded</span>
                    <span>·</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{errorRows} failed</span>
                  </span>
                </div>
              </div>
            )}

            {/* Preview grid table */}
            <div className="p-3">
              <div
                ref={scrollContainerRef}
                className="rounded border border-border overflow-x-auto overflow-y-clip"
              >
                <table
                  className="text-xs w-full"
                  style={{
                    tableLayout: "fixed",
                    minWidth: "100%",
                    width: "auto",
                  }}
                >
                  <thead className="bg-muted/50 sticky top-0 z-10 border-b border-border shadow-sm">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-12 bg-muted/90">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-16 bg-muted/90">Actions</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border w-28 bg-muted/90">Status</th>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border bg-muted/90"
                          style={{
                            width: col.width || "160px",
                            minWidth: col.minWidth || "140px",
                          }}
                        >
                          {col.label} {col.required && <span className="text-red-500">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => {
                      const isRowErr = onValidateRow ? !onValidateRow(row).isValid : false;

                      return (
                        <tr
                          key={rowIdx}
                          className={`text-xs transition-all duration-200 hover:bg-primary/5 border-b border-border/50
                            ${row.__status === "success" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : ""}
                            ${row.__status === "error" ? "bg-red-500/5 hover:bg-red-500/10" : ""}
                            ${row.__status === "pending" ? (isRowErr ? "bg-amber-500/5 hover:bg-amber-500/10" : "") : ""}
                          `}
                        >
                          <td className="px-3 py-2 text-muted-foreground font-medium">{rowIdx + 1}</td>

                          <td className="px-3 py-2">
                            <CustomButton
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRow(rowIdx)}
                              disabled={isImporting}
                              className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-none bg-transparent"
                              title="Delete row"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                            />
                          </td>

                          <td className="px-3 py-2">
                            {row.__status === "pending" && (
                              <Badge
                                variant={isRowErr ? "outline" : "secondary"}
                                className={`text-[10px] font-medium px-1.5 py-0
                                  ${isRowErr ? "border-amber-500 text-amber-600 bg-amber-500/5" : ""}
                                `}
                              >
                                {isRowErr ? "Pending" : "Ready"}
                              </Badge>
                            )}
                            {row.__status === "success" && (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-medium px-1.5 py-0">
                                Success
                              </Badge>
                            )}
                            {row.__status === "error" && (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white border-none text-[10px] font-medium px-1.5 py-0">
                                Error
                              </Badge>
                            )}
                          </td>

                          {columns.map((col) => {
                            const errKey = `__${String(col.fieldKey)}Error`;
                            const hasFieldErr = (row as any)[errKey] || (col.hasError ? col.hasError(row) : false);

                            return (
                              <td key={col.key} className="p-1">
                                {col.type === "text" && (
                                  <TextField
                                    name={`${entityName}.${rowIdx}.${String(col.fieldKey)}`}
                                    label=""
                                    labelClassName="hidden"
                                    className="gap-0"
                                    control={control}
                                    disabled={isImporting || row.__status === "success"}
                                    placeholder={col.placeholder || col.label}
                                    onCustomChange={(val) => handleCellChange(rowIdx, col.fieldKey, val)}
                                    inputClassName={`h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0
                                      ${hasFieldErr ? "border-red-500 bg-red-500/5 focus-visible:ring-red-500" : "border-border"}
                                    `}
                                  />
                                )}

                                {col.type === "select" && (
                                  <CustomSelect
                                    size="md"
                                    options={col.options || []}
                                    value={row[col.fieldKey] as string}
                                    placeholder={col.placeholder || `Select ${col.label}...`}
                                    onValueChange={(val) => handleCellChange(rowIdx, col.fieldKey, val)}
                                    disabled={isImporting || row.__status === "success"}
                                    error={hasFieldErr}
                                    className="h-[32px]"
                                  />
                                )}

                                {col.type === "custom" && col.renderCustom && (
                                  col.renderCustom(
                                    row,
                                    rowIdx,
                                    isImporting || row.__status === "success",
                                    (val) => handleCellChange(rowIdx, col.fieldKey, val)
                                  )
                                )}

                                {col.type === "image" && (
                                  <ImportImageCell
                                    row={row}
                                    onChange={(file) => handleCellChange(rowIdx, "__imageFile" as any, file)}
                                    disabled={isImporting || row.__status === "success"}
                                    isWide={col.isWide}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom batch actions footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/40 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground font-medium">
                  {pendingRows} pending · {successRows} success · {errorRows} error
                </div>
                {hasValidationErrors && pendingRows > 0 && (
                  <span className="text-xs text-amber-500 font-semibold flex items-center gap-1 animate-pulse-soft">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Please fix "Invalid Data" rows first.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(backRoute)}
                  disabled={isImporting}
                >
                  Cancel
                </CustomButton>

                <CustomButton
                  size="sm"
                  onClick={handleImport}
                  disabled={isImportDisabled}
                  className="gap-1.5 min-w-[130px]"
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
                      Import {entityName}
                    </>
                  )}
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

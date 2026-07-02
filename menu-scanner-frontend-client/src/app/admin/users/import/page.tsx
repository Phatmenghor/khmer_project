"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store";
import { CustomButton, DownloadTemplateButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shared/common/page-container";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { TextField } from "@/components/shared/form-field/text-field";
import { GENDER_OPTIONS } from "@/constants/form-options";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import {
  mapRowToCreateRequest,
  ParsedUserRow,
  parseUserImportFile,
  downloadUserTemplate,
} from "@/utils/excel/user-excel.utils";
import { createUserService } from "@/features/auth/store/thunks/users-thunks";
import { fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import { selectRolesList } from "@/features/auth/store/selectors/role-selectors";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { UserGropeType } from "@/constants/status/status";

// ── Types ─────────────────────────────────────────────────────────────────────

type RowStatus = "pending" | "success" | "error";

interface ImportRow {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  __status: RowStatus;
  __error?: string;
  __roleName?: string; // Resolved role NAME string (e.g. "BUSINESS_STAFF")
  __usernameError?: boolean; // Highlight username field if duplicate
  __roleError?: boolean; // Highlight role field if error
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserImportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useAppSelector(selectUser);
  const rolesList = useAppSelector(selectRolesList);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [importDone, setImportDone] = useState(false);

  // Initialize react-hook-form to support TextField control dependency
  const { control, reset, setValue } = useForm();

  // ── Horizontal Table Scroll Controls ─────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftScroll(el.scrollLeft > 2);
    setShowRightScroll(
      el.scrollLeft < el.scrollWidth - el.clientWidth - 2
    );
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

  // ── Fetch Roles on Load ───────────────────────────────────────────────────

  useEffect(() => {
    dispatch(
      fetchAllRolesListService({
        includeAll: false,
        userTypes: [UserGropeType.BUSINESS_USER],
      })
    );
  }, [dispatch]);

  // Sync rows data to react-hook-form values for TextFields on load
  useEffect(() => {
    const values: Record<string, string> = {};
    rows.forEach((row, idx) => {
      values[`username-${idx}`] = row.username;
      values[`password-${idx}`] = row.password;
      values[`fullName-${idx}`] = row.fullName;
      values[`email-${idx}`] = row.email;
      values[`phoneNumber-${idx}`] = row.phoneNumber;
      values[`dateOfBirth-${idx}`] = row.dateOfBirth;
    });
    reset(values);
  }, [rows, reset]);

  // ── Options mapping ───────────────────────────────────────────────────────

  const roleOptions = useMemo(() => {
    return rolesList
      .filter((r) => r.name !== "BUSINESS_OWNER")
      .map((role) => {
        // Format role name nicely: e.g. "BUSINESS_STAFF" -> "Staff", "BUSINESS_MANAGER" -> "Manager"
        const cleanName = role.name.replace("BUSINESS_", "");
        const formattedLabel = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
        return {
          value: role.name, // Set value to role.name because backend expects role name array
          label: formattedLabel,
        };
      });
  }, [rolesList]);

  // ── Helper to resolve Role ID from Excel Text ──────────────────────────────

  const resolveRoleId = useCallback((roleText: string) => {
    if (!roleText || !rolesList.length) return "";
    const cleanText = roleText.trim().toLowerCase();

    // 1. Exact match (case-insensitive for easy compare)
    const exact = rolesList.find((r) => r.name.toLowerCase() === cleanText);
    if (exact) return exact.name;

    // 2. Fuzzy match
    const contains = rolesList.find(
      (r) =>
        r.name.toLowerCase().includes(cleanText) ||
        cleanText.includes(r.name.toLowerCase())
    );
    if (contains) return contains.name;

    // 3. Common names conversion
    if (cleanText === "super admin" || cleanText === "superadmin") {
      const match = rolesList.find((r) => r.name.toUpperCase().includes("SUPER_ADMIN"));
      if (match) return match.name;
    }

    // No default fallback! Let it be empty so user must select explicitly
    return "";
  }, [rolesList]);

  // ── File processing ───────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      showToast.error("Only .xlsx and .xls files are supported.");
      return;
    }
    setFileName(file.name);
    setImportDone(false);
    setIsParsingFile(true);

    // Minor delay to show high-fidelity loading state
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const { rows: r, errors } = await parseUserImportFile(file);

      const parsedRows: ImportRow[] = r.map((row) => {
        const get = (keys: string[]): string => {
          const matchedKey = Object.keys(row).find((k) =>
            keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
          );
          return matchedKey ? row[matchedKey] : "";
        };

        const username = get(["username"]);
        const password = get(["password"]);
        const fullName = get(["name", "full"]);
        const email = get(["email"]);
        const phoneNumber = get(["phone", "number"]);
        const genderVal = get(["gender"]);
        const dateOfBirth = get(["birth", "dob"]);
        const roleVal = get(["role"]);

        // Normalize gender to UPPERCASE
        let gender = "";
        const cleanGender = genderVal.trim().toLowerCase();
        if (cleanGender === "male" || cleanGender === "m") gender = "MALE";
        else if (cleanGender === "female" || cleanGender === "f") gender = "FEMALE";
        else if (cleanGender === "other" || cleanGender === "o") gender = "OTHER";

        // Resolve Role ID
        const resolvedName = resolveRoleId(roleVal);

        return {
          username,
          password,
          fullName,
          email,
          phoneNumber,
          gender,
          dateOfBirth,
          role: roleVal,
          __status: "pending" as RowStatus,
          __roleName: resolvedName,
        };
      });

      setRows(parsedRows);
      setParseErrors(errors);
    } catch (e: any) {
      showToast.error(e.message || "Failed to parse file.");
    } finally {
      setIsParsingFile(false);
    }
  }, [resolveRoleId]);

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



  // ── Delete Row Action ──────────────────────────────────────────────────────

  const handleDeleteRow = (rowIdx: number) => {
    const updated = [...rows];
    updated.splice(rowIdx, 1);
    setRows(updated);
  };

  // ── Inline Cell Editing ───────────────────────────────────────────────────

  const handleCellChange = (rowIdx: number, field: keyof ImportRow, value: string) => {
    const updated = [...rows];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [field]: value,
      // Reset errors if edited
      ...(updated[rowIdx].__status === "error" ? { __status: "pending", __error: undefined } : {}),
      ...(field === "username" ? { __usernameError: false } : {}),
      ...(field === "__roleName" ? { __roleError: false } : {})
    };
    setRows(updated);
    setValue(`${field}-${rowIdx}`, value);
  };

  // ── Batch Import Action ───────────────────────────────────────────────────

  const handleImport = async () => {
    // Filter out successful rows first (removes them from table list before importing remaining)
    const rowsToProcess = rows.filter((r) => r.__status !== "success");
    if (!rowsToProcess.length || hasValidationErrors) return;

    setIsImporting(true);

    // Clear old errors and set status to pending for all rows we are about to process
    const cleanedRows: ImportRow[] = rowsToProcess.map((row) => ({
      ...row,
      __status: "pending" as RowStatus,
      __error: undefined,
      __usernameError: false,
      __roleError: false,
    }));
    setRows(cleanedRows);

    const updated = [...cleanedRows];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].username || !updated[i].password || !updated[i].__roleName || !updated[i].email) {
        updated[i] = {
          ...updated[i],
          __status: "error" as RowStatus,
          __error: "Username, Password, Role, and Email are required.",
          ...(!updated[i].username ? { __usernameError: true } : {}),
          ...(!updated[i].__roleName ? { __roleError: true } : {})
        };
        errorCount++;
        setRows([...updated]);
        continue;
      }

      try {
        const mapPayload: ParsedUserRow = {
          username: updated[i].username,
          password: updated[i].password,
          fullName: updated[i].fullName,
          email: updated[i].email,
          phoneNumber: updated[i].phoneNumber,
          gender: updated[i].gender,
          dateOfBirth: updated[i].dateOfBirth,
          roleId: updated[i].__roleName || "", // Sends the role name (e.g. BUSINESS_STAFF) to request
        };

        const payload = mapRowToCreateRequest(mapPayload, "BUSINESS_USER", businessId);
        await dispatch(createUserService(payload as any)).unwrap();

        // Successful rows are marked as success (stay in table until next import click)
        updated[i] = { 
          ...updated[i], 
          __status: "success", 
          __error: undefined, 
          __usernameError: false, 
          __roleError: false 
        };
        successCount++;
      } catch (err: any) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || err?.error || "Failed to create user";
        
        // Check for specific backend error messages to highlight fields
        const isDuplicate = msg.toLowerCase().includes("username") || msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("duplicate");
        const isRoleErr = msg.toLowerCase().includes("role");

        updated[i] = { 
          ...updated[i], 
          __status: "error" as RowStatus, 
          __error: msg,
          __usernameError: isDuplicate,
          __roleError: isRoleErr
        };
        errorCount++;
      }

      setRows([...updated]);
    }

    setIsImporting(false);
    setImportDone(true);

    if (successCount > 0 && errorCount === 0) {
      showToast.success(`All ${successCount} users imported successfully!`);
    } else if (successCount > 0) {
      showToast.success(`${successCount} imported successfully. ${errorCount} failed rows remain.`);
    } else {
      showToast.error(`All ${errorCount} rows failed. Please check the errors listed.`);
    }
  };

  const handleReset = () => {
    setRows([]);
    setParseErrors([]);
    setFileName("");
    setImportDone(false);
  };

  const isDobInvalid = (dob: string) => {
    if (!dob) return false;
    return !dob.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  // Validation Check before Import (only checks pending/error rows)
  const hasValidationErrors = useMemo(() => {
    return rows
      .filter((r) => r.__status !== "success")
      .some(row => 
        !row.username || 
        !row.password || 
        !row.email || 
        !row.__roleName || 
        isDobInvalid(row.dateOfBirth)
      );
  }, [rows]);

  // Aggregate active row errors for top failures listing
  const activeRowErrors = useMemo(() => {
    return rows
      .map((r, idx) => ({ idx: idx + 1, error: r.__error, username: r.username }))
      .filter(r => r.error);
  }, [rows]);

  const totalRows = rows.length;
  const successRows = rows.filter((r) => r.__status === "success").length;
  const errorRows = rows.filter((r) => r.__status === "error").length;
  const pendingRows = rows.filter((r) => r.__status === "pending").length;
  const hasFailures = errorRows > 0;

  // We only disable the button if all rows are already successfully imported, or if it is currently importing, or if it has static validation block errors
  const isImportDisabled = isImporting || hasValidationErrors || rows.length === 0 || rows.every(r => r.__status === "success");

  return (
    <PageContainer className="py-3 flex flex-col gap-3 min-h-[calc(100vh-80px)] overflow-hidden">
      
      {/* High-fidelity Page Header with left-aligned Back Button sitting flush */}
      <div className="flex items-center justify-between py-3 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/users")}
            disabled={isImporting}
            className="h-6 w-5 hover:bg-transparent shrink-0 p-0 m-0 border-none bg-transparent"
            title="Go back"
          >
            <ArrowLeft className="h-3 w-3" />
          </CustomButton>
          <div className="flex flex-col pl-0.5">
            <h1 className="text-xs sm:text-sm font-bold text-foreground">
              Import Users
            </h1>
            <p className="text-xs sm:text-xs text-muted-foreground mt-0.5">
              Upload a template spreadsheet to create business users in batch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <DownloadTemplateButton onDownload={downloadUserTemplate} />
        </div>
      </div>

      {/* Main Card */}
      <Card className="flex flex-col border-border bg-card">
        
        {/* Drop zone — shown when no file selected and not loading */}
        {!totalRows && !isParsingFile && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center min-h-[400px]">
            <div
              className={`w-full max-w-xl relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer
                ${isDragging
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
              <h3 className="text-base font-semibold text-foreground">
                Upload your Excel file
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Drag and drop your user template file here, or click to browse files from your computer.
              </p>
              <Badge variant="outline" className="mt-4 text-[10px] text-muted-foreground border-border bg-background">
                Only .xlsx and .xls formats are supported
              </Badge>
            </div>
          </div>
        )}

        {/* High-fidelity Skeleton Loading Table when parsing Excel file */}
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
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Username <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Password <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[150px] w-[170px] bg-muted/90">Role <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[150px] w-[170px] bg-muted/90">Full Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[180px] w-[200px] bg-muted/90">Email <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Phone</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[130px] w-[140px] bg-muted/90">Gender</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[130px] w-[140px] bg-muted/90">DOB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-border/50 h-[40px]">
                        <td className="px-3 py-3 w-12"><div className="h-3 w-4 bg-muted animate-pulse rounded" /></td>
                        <td className="px-3 py-3 w-16"><div className="h-3 w-6 bg-muted animate-pulse rounded" /></td>
                        <td className="px-3 py-3 w-28"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></td>
                        {[...Array(8)].map((_, c) => (
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
                <span className="text-muted-foreground font-medium">
                  {totalRows} rows loaded
                </span>
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

            {/* Centralized failure monitoring panel at the top */}
            {activeRowErrors.length > 0 && (
              <div className="mx-4 mt-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-red-500 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Import Failure Summary ({activeRowErrors.length})
                </h4>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1 max-h-[120px] overflow-y-auto pr-2">
                  {activeRowErrors.map((err, i) => (
                    <li key={i}>
                      Row {err.idx} ({err.username || "Unknown"}): {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DataTable-styled preview grid table */}
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
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Username <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Password <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[150px] w-[170px] bg-muted/90">Role <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[150px] w-[170px] bg-muted/90">Full Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[180px] w-[200px] bg-muted/90">Email <span className="text-red-500">*</span></th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[140px] w-[160px] bg-muted/90">Phone</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[130px] w-[140px] bg-muted/90">Gender</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border min-w-[130px] w-[140px] bg-muted/90">DOB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => {
                      const dobErr = isDobInvalid(row.dateOfBirth);
                      const isRowErr =
                        !row.username ||
                        !row.password ||
                        !row.email ||
                        dobErr ||
                        !row.__roleName;

                      return (
                        <tr
                          key={rowIdx}
                          className={`text-xs transition-all duration-200 hover:bg-primary/5 border-b border-border/50
                            ${row.__status === "success" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : ""}
                            ${row.__status === "error" ? "bg-red-500/5 hover:bg-red-500/10" : ""}
                            ${row.__status === "pending" ? (isRowErr ? "bg-amber-500/5 hover:bg-amber-500/10" : "") : ""}
                          `}
                        >
                          {/* Row Index */}
                          <td className="px-3 py-2 text-muted-foreground font-medium">{rowIdx + 1}</td>

                          {/* Delete Action Cell */}
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

                          {/* Row Status Badge (Clean: Just Success or Error badge) */}
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

                          {/* Username Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`username-${rowIdx}`}
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="Username"
                              onCustomChange={(val) => handleCellChange(rowIdx, "username", val)}
                              inputClassName={`h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0
                                ${!row.username || row.__usernameError ? "border-red-500 bg-red-500/5 focus-visible:ring-red-500" : "border-border"}
                              `}
                            />
                          </td>

                          {/* Password Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`password-${rowIdx}`}
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="Password"
                              onCustomChange={(val) => handleCellChange(rowIdx, "password", val)}
                              inputClassName={`h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0
                                ${!row.password ? "border-red-500/50 bg-red-500/5" : "border-border"}
                              `}
                            />
                          </td>

                          {/* Role Select Dropdown (32px height) */}
                          <td className="p-1">
                            <CustomSelect
                              size="md"
                              options={roleOptions}
                              value={row.__roleName}
                              placeholder="Select Role..."
                              onValueChange={(val) => handleCellChange(rowIdx, "__roleName", val)}
                              disabled={isImporting || row.__status === "success"}
                              error={!row.__roleName || row.__roleError}
                              className="h-[32px]"
                            />
                          </td>

                          {/* Full Name Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`fullName-${rowIdx}`}
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="Full Name"
                              onCustomChange={(val) => handleCellChange(rowIdx, "fullName", val)}
                              inputClassName="h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-border"
                            />
                          </td>

                          {/* Email Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`email-${rowIdx}`}
                              type="email"
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="Email"
                              onCustomChange={(val) => handleCellChange(rowIdx, "email", val)}
                              inputClassName={`h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0
                                ${!row.email ? "border-red-500/50 bg-red-500/5" : "border-border"}
                              `}
                            />
                          </td>

                          {/* Phone Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`phoneNumber-${rowIdx}`}
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="Phone"
                              onCustomChange={(val) => handleCellChange(rowIdx, "phoneNumber", val)}
                              inputClassName="h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-border"
                            />
                          </td>

                          {/* Gender Select Dropdown (32px height) */}
                          <td className="p-1">
                            <CustomSelect
                              size="md"
                              options={GENDER_OPTIONS}
                              value={row.gender}
                              placeholder="Gender..."
                              onValueChange={(val) => handleCellChange(rowIdx, "gender", val)}
                              disabled={isImporting || row.__status === "success"}
                              className="h-[32px]"
                            />
                          </td>

                          {/* DOB Input using custom TextField */}
                          <td className="p-1">
                            <TextField
                              name={`dateOfBirth-${rowIdx}`}
                              label=""
                              labelClassName="hidden"
                              className="gap-0"
                              control={control}
                              disabled={isImporting || row.__status === "success"}
                              placeholder="YYYY-MM-DD"
                              onCustomChange={(val) => handleCellChange(rowIdx, "dateOfBirth", val)}
                              inputClassName={`h-[32px] py-1 text-xs bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0
                                ${dobErr ? "border-red-500/50 bg-red-500/5" : "border-border"}
                              `}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom batch actions footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/40 flex-shrink-0">
              {/* Validation Warning Alert in footer to prevent submission of invalid data */}
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
                  onClick={() => router.push("/admin/users")}
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
                      Import Users
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

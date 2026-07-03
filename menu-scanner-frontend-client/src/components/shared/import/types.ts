import React from "react";

export type RowStatus = "pending" | "success" | "error";

export interface BaseImportRow {
  __status: RowStatus;
  __error?: string;
  [key: string]: any;
}

export interface BatchImportResponse<T = any> {
  successCount: number;
  errorCount: number;
  results: Array<{
    index: number;
    success: boolean;
    error: string | null;
    data: T | null;
  }>;
}

export interface ImportTableColumn<T> {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  required?: boolean;
  type?: "text" | "select" | "custom" | "image";
  isWide?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  fieldKey: keyof T;
  hasError?: (row: T) => boolean;
  hasFieldWarning?: (row: T) => boolean;
  renderCustom?: (
    row: T,
    rowIdx: number,
    isDisabled: boolean,
    onChange: (val: any) => void
  ) => React.ReactNode;
}

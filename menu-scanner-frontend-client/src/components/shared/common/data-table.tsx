"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSizeSelectField } from "@/components/shared/form-field/page-size-select-field";
import { cn } from "@/lib/utils";

// Constants
const PAGINATION_ITEMS_THRESHOLD = 7;
const PAGINATION_START_OFFSET = 2;
const PAGINATION_WINDOW_SIZE = 4;
const PAGINATION_SIDE_ITEMS = 3;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  truncate?: boolean;
  maxWidth?: string;
  minWidth?: string;
  width?: string;
}

interface DataTableWithPaginationProps<T = any> {
  data: T[] | null;
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string | number;

  // Pagination props
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  paginationSize?: "sm" | "md" | "lg";
  showPagination?: boolean;

  // Page size selector props
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function DataTableWithPagination<T = any>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  className = "",
  onRowClick,
  getRowKey = (_, index) => index,
  currentPage,
  totalPages,
  onPageChange,
  paginationSize = "md",
  showPagination = true,
  pageSize = 10,
  totalElements = 0,
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
}: DataTableWithPaginationProps<T>) {
  const tableData: T[] = Array.isArray(data) ? data : [];

  const sizeClasses = {
    sm: {
      button: "h-8 px-3 text-xs",
      icon: "h-3 w-3",
      pageButton: "h-8 min-w-8 text-xs",
    },
    md: {
      button: "h-9 px-4 text-sm",
      icon: "h-4 w-4",
      pageButton: "h-9 min-w-9 text-sm",
    },
    lg: {
      button: "h-10 px-5 text-base",
      icon: "h-5 w-5",
      pageButton: "h-10 min-w-10 text-base",
    },
  };

  const classes = sizeClasses[paginationSize];

  const getPaginationItems = (): (number | "ellipsis")[] => {
    const items: (number | "ellipsis")[] = [];

    if (totalPages <= PAGINATION_ITEMS_THRESHOLD) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      let start = Math.max(PAGINATION_START_OFFSET, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= PAGINATION_SIDE_ITEMS) {
        start = PAGINATION_START_OFFSET;
        end = PAGINATION_WINDOW_SIZE;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - PAGINATION_SIDE_ITEMS;
        end = totalPages - 1;
      }

      if (start > PAGINATION_START_OFFSET) {
        items.push("ellipsis");
      }

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (end < totalPages - 1) {
        items.push("ellipsis");
      }

      items.push(totalPages);
    }

    return items;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`rounded-md border overflow-x-auto ${className}`}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left font-semibold text-xs text-muted-foreground border-b border-border ${
                      column.className || ""
                    }`}
                    style={{
                      ...(column.width && { width: column.width }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                      ...(column.minWidth && { minWidth: column.minWidth }),
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 border-b border-border/50"
                      style={{
                        ...(column.width && { width: column.width }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.minWidth && { minWidth: column.minWidth }),
                      }}
                    >
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Table */}
      <div className={`rounded-md border overflow-x-auto ${className}`}>
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left font-semibold text-xs text-muted-foreground border-b border-border ${
                    column.className || ""
                  }`}
                  style={{
                    ...(column.width && { width: column.width }),
                    ...(column.maxWidth && { maxWidth: column.maxWidth }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground border-b border-border/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={`text-sm transition-all duration-200 hover:bg-muted/30 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => {
                    const cellContent = column.render
                      ? column.render(item, index)
                      : String(item[column.key as keyof T] || "---");

                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 border-b border-border/50 ${
                          column.className || ""
                        }`}
                        style={{
                          ...(column.width && { width: column.width }),
                          ...(column.maxWidth && { maxWidth: column.maxWidth }),
                          ...(column.minWidth && { minWidth: column.minWidth }),
                        }}
                      >
                        <div
                          className={`whitespace-nowrap ${
                            column.truncate
                              ? "overflow-hidden text-ellipsis"
                              : ""
                          }`}
                          title={
                            column.truncate && typeof cellContent === "string"
                              ? cellContent
                              : undefined
                          }
                        >
                          {cellContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between gap-4 p-4 flex-wrap">
          {/* Page Size Selector */}
          {showPageSizeSelector && totalPages > 1 ? (
            <PageSizeSelectField
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
            />
          ) : (
            <div />
          )}

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                ${classes.button}
                flex items-center gap-2 rounded-lg border font-medium transition-all duration-200
                ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                    : "text-foreground border-border hover:bg-muted hover:border-border-strong"
                }
              `}
              >
                <ChevronLeft className={classes.icon} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPaginationItems().map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      onClick={() => onPageChange(item)}
                      className={`
                      ${classes.pageButton}
                      rounded-lg font-medium px-2 transition-all duration-200
                      ${
                        currentPage === item
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground border border-border hover:bg-muted hover:border-border-strong"
                      }
                    `}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`
                ${classes.button}
                flex items-center gap-2 rounded-lg border font-medium transition-all duration-200
                ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                    : "text-foreground border-border hover:bg-muted hover:border-border-strong"
                }
              `}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className={classes.icon} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageSizeSelectField } from "@/components/shared/form-field/page-size-select-field";

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
  onPageChange: (page: number) => void;
  paginationSize?: "sm" | "md" | "lg";
  showPagination?: boolean;

  // Page size props
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  totalElements?: number;
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
  pageSize = 15,
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 15, 20, 50, 100],
  showPageSizeSelector = true,
  totalElements = 0,
}: DataTableWithPaginationProps<T>) {
  const tableData: T[] = Array.isArray(data) ? data : [];

  const sizeClasses = {
    sm: {
      button: "h-5 px-2 text-xs",
      icon: "h-2 w-2",
      pageButton: "h-5 min-w-5 text-xs",
    },
    md: {
      button: "h-6 px-3 text-xs",
      icon: "h-3 w-3",
      pageButton: "h-6 min-w-6 text-xs",
    },
    lg: {
      button: "h-7 px-3 text-xs",
      icon: "h-3 w-3",
      pageButton: "h-7 min-w-7 text-xs",
    },
  };

  const classes = sizeClasses[paginationSize];

  const getPaginationItems = (): (number | "ellipsis")[] => {
    const items: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
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
      <div className="space-y-3">
        <div className={`rounded border overflow-x-auto ${className}`}>
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border ${
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
                      className="px-3 py-2 border-b border-border/50"
                      style={{
                        ...(column.width && { width: column.width }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.minWidth && { minWidth: column.minWidth }),
                      }}
                    >
                      <div className="h-3 bg-muted animate-pulse rounded" />
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
    <div className="space-y-3">
      {/* Data Table */}
      <div className={`rounded border overflow-x-auto ${className}`}>
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-b border-border ${
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
                  className="px-3 py-5 text-center text-muted-foreground border-b border-border/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={`text-xs transition-all duration-200 hover:bg-muted/30 ${
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
                        className={`px-3 py-2 border-b border-border/50 ${
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
        <div className="flex items-center justify-between gap-3 p-3 flex-wrap">
          {/* Page size selector */}
          {showPageSizeSelector && totalElements >= 10 ? (
            <PageSizeSelectField
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
            />
          ) : (
            <div />
          )}

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  ${classes.button}
                  flex items-center gap-1 rounded border font-medium transition-all duration-200
                  ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                      : "text-foreground border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                  }
                `}
              >
                <ChevronLeft className={classes.icon} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {getPaginationItems().map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-muted-foreground"
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
                        rounded font-medium px-1 transition-all duration-200
                        ${
                          currentPage === item
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground border border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                        }
                      `}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`
                  ${classes.button}
                  flex items-center gap-1 rounded border font-medium transition-all duration-200
                  ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                      : "text-foreground border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
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

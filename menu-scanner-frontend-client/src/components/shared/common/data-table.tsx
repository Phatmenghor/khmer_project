"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageSizeSelectField } from "@/components/shared/form-field/page-size-select-field";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";

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

  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  paginationSize?: "sm" | "md" | "lg";
  showPagination?: boolean;
  hideEllipsis?: boolean;

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
  hideEllipsis = false,
  pageSize = 10,
  totalElements = 0,
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
}: DataTableWithPaginationProps<T>) {
  const tableData: T[] = Array.isArray(data) ? data : [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftScroll(scrollLeft > 5);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
    };
  }, [data, loading]);

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

    if (totalPages <= PAGINATION_ITEMS_THRESHOLD) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      let start = Math.max(PAGINATION_START_OFFSET, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= PAGINATION_SIDE_ITEMS) {
        start = PAGINATION_START_OFFSET;
        end = PAGINATION_WINDOW_SIZE + 1;
      }

      if (currentPage >= totalPages - 3) {
        start = totalPages - PAGINATION_SIDE_ITEMS - 1;
        end = totalPages - 1;
      }

      if (!hideEllipsis && start > PAGINATION_START_OFFSET) {
        items.push("ellipsis");
      }

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (!hideEllipsis && end < totalPages - 1) {
        items.push("ellipsis");
      }

      items.push(totalPages);
    }

    return items;
  };

  const totalItems = totalElements || tableData.length;
  const hasControls = totalItems > 0 || showLeftScroll || showRightScroll;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className={`rounded border overflow-x-auto ${className}`}>
          <table
            className="text-xs"
            style={{
              tableLayout: "fixed",
              minWidth: "100%",
              width: "auto",
            }}
          >
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
      {/* Top Table Controls: Entries info on left, Scroll buttons on right */}
      {hasControls && (
        <div className="sticky top-12 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 pt-1.5 flex justify-between items-center h-10 px-2 border-b border-border/80 shadow-sm transition-all duration-200">
          <div className="text-xs text-muted-foreground font-medium">
            {totalItems > 0 && (
              <span>
                Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(totalItems, currentPage * pageSize)} of {totalItems} entries
              </span>
            )}
          </div>
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
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={`rounded border overflow-x-auto ${className}`}
      >
        <table
          className="text-xs"
          style={{
            tableLayout: "fixed",
            minWidth: "100%",
            width: "auto",
          }}
        >
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
                  className={`text-xs transition-all duration-200 hover:bg-primary/5 ${
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

      {}
      {showPagination && (
        <div className="flex items-center justify-between gap-3 p-3 flex-wrap">
          {}
          {showPageSizeSelector && totalPages > 1 ? (
            <PageSizeSelectField
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
            />
          ) : (
            <div />
          )}

          {}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {}
              <CustomButton
                variant="unstyled"
                size="unstyled"
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
              </CustomButton>

              {}
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
                    <CustomButton
                      variant="unstyled"
                      size="unstyled"
                      key={item}
                      onClick={() => onPageChange(item)}
                      className={`
                      ${classes.pageButton}
                      rounded font-medium px-1 transition-all duration-200
                      ${
                        currentPage === item
                          ? "bg-primary text-primary-foreground border-2 border-primary shadow-md font-bold"
                          : "text-foreground border border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                      }
                    `}
                    >
                      {item}
                    </CustomButton>
                  );
                })}
              </div>

              {}
              <CustomButton
                variant="unstyled"
                size="unstyled"
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
              </CustomButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

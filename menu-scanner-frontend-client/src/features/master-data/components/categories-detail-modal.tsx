"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { CategoriesResponseModel } from "../store/models/response/categories-response";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";

interface CategoriesDetailModalProps {
  categories: CategoriesResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground break-words">{value || "-"}</span>
    </div>
  );
}

export function CategoriesDetailModal({
  categories,
  isOpen,
  onClose,
}: CategoriesDetailModalProps) {
  if (!categories) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle className="sr-only">Category Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-2xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No category data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = categories.status === "ACTIVE";
  const totalProducts = categories.totalProducts ?? categories.productCount ?? 0;
  const activeProducts = categories.activeProducts ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Category Details - {categories.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
            {categories.imageUrl ? (
              <img src={categories.imageUrl} alt={categories.name} className="w-full h-full object-cover" />
            ) : (
              <Tag className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Category</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage product categories for your business</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-3">
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Category Information</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <InfoRow label="Name" value={categories.name || "-"} />
                  <InfoRow
                    label="Status"
                    value={
                      <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                        {categories.status ? formatEnumValue(categories.status) : "-"}
                      </span>
                    }
                  />
                  <InfoRow label="Description" value={categories.description} fullWidth />
                </div>
              </div>

              {/* Product Stats */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Product Stats</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center gap-1 p-3 rounded bg-muted/30 border border-border/40">
                    <span className="text-lg font-bold text-foreground">
                      {totalProducts}
                    </span>
                    <span className="text-xs text-muted-foreground">Total Products</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded bg-muted/30 border border-border/40">
                    <span className="text-lg font-bold text-green-700">
                      {activeProducts}
                    </span>
                    <span className="text-xs text-muted-foreground">Active Products</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="space-y-2.5">
<InfoRow label="Created By" value={categories.createdBy || "-"} />
                  <InfoRow label="Created At" value={dateTimeFormat(categories.createdAt ?? "")} />
                  <InfoRow label="Updated By" value={categories.updatedBy || "-"} />
                  <InfoRow label="Last Updated" value={dateTimeFormat(categories.updatedAt ?? "")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

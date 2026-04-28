"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubcategoriesResponseModel } from "../store/models/response/subcategories-response";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";

interface SubcategoriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: SubcategoriesResponseModel | null;
}

export function SubcategoriesDetailModal({
  isOpen,
  onClose,
  subcategory,
}: SubcategoriesDetailModalProps) {
  if (!subcategory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subcategory Details</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {subcategory.imageUrl && (
            <div className="flex justify-center">
              <img
                src={subcategory.imageUrl}
                alt={subcategory.name}
                className="h-32 w-32 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Subcategory Name
              </label>
              <p className="text-sm font-semibold">{subcategory.name}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <p className="text-sm font-semibold">{subcategory.categoryName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Business
              </label>
              <p className="text-sm font-semibold">{subcategory.businessName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <p className="text-sm font-semibold">
                {formatEnumValue(subcategory.status)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-sm">{dateTimeFormat(subcategory.createdAt)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Updated At
              </label>
              <p className="text-sm">{dateTimeFormat(subcategory.updatedAt)}</p>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Subcategory ID
              </label>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {subcategory.id}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

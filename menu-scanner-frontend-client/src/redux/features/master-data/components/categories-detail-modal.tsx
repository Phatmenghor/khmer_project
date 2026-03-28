"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { CategoriesResponseModel } from "../store/models/response/categories-response";

interface CategoriesDetailModalProps {
  categories: CategoriesResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No category data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Category Details - {categories?.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Category Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              Detailed information about the selected category
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Category Information */}
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Labels Row - Top alignment */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left label - Category Name */}
                  <div className="w-full md:w-1/2">
                    <p className="text-sm font-medium text-foreground">Category Name</p>
                  </div>
                  {/* Right label - Category Image */}
                  {categories.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <p className="text-sm font-medium text-foreground">Category Image</p>
                    </div>
                  )}
                </div>

                {/* Content Row - Fields and Image */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Basic Info - Left Side (50%) */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <p className="text-foreground">{categories.name || "---"}</p>
                    <DisplayField label="Business Name" value={categories.businessName || "---"} />
                    <DisplayField label="Status" value={categories.status ? formatEnumValue(categories.status) : "---"} />
                    <DisplayField label="Total Products" value={categories.totalProducts ?? "---"} />
                    <DisplayField label="Active Products" value={categories.activeProducts ?? "---"} />
                  </div>

                  {/* Category Image - Right Side (50%) */}
                  {categories.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <div className="h-40 w-40 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                        <img
                          src={categories.imageUrl}
                          alt={categories.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Category ID" value={categories.id} />
                  <DisplayField label="Created At" value={dateTimeFormat(categories.createdAt ?? "")} />
                  <DisplayField label="Created By" value={categories.createdBy || "---"} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(categories.updatedAt ?? "")} />
                  <DisplayField label="Updated By" value={categories.updatedBy || "---"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

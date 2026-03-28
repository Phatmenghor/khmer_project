"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { BrandResponseModel } from "../store/models/response/brand-response";

interface BrandDetailModalProps {
  brand: BrandResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModal({
  brand,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  if (!brand) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle className="sr-only">Brand Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No brand data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Brand Details - {brand?.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Brand Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              Detailed information about the selected brand
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Brand Information */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Labels Row - Top alignment */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left label - Brand Name */}
                  <div className="w-full md:w-1/2">
                    <p className="text-sm font-medium text-foreground">Brand Name</p>
                  </div>
                  {/* Right label - Brand Image */}
                  {brand.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <p className="text-sm font-medium text-foreground">Brand Image</p>
                    </div>
                  )}
                </div>

                {/* Content Row - Fields and Image */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Basic Info - Left Side (50%) */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <p className="text-foreground">{brand.name || "---"}</p>
                    <DisplayField label="Description" value={brand.description || "---"} />
                    <DisplayField label="Status" value={brand.status ? formatEnumValue(brand.status) : "---"} />
                    <DisplayField label="Total Products" value={formatProductCount(brand.totalProducts)} />
                    <DisplayField label="Active Products" value={formatProductCount(brand.activeProducts)} />
                  </div>

                  {/* Brand Image - Right Side (50%) */}
                  {brand.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <div className="h-40 w-40 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
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
                  <DisplayField label="Brand ID" value={brand.id} />
                  <DisplayField label="Created At" value={dateTimeFormat(brand.createdAt ?? "")} />
                  <DisplayField label="Created By" value={brand.createdBy || "---"} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(brand.updatedAt ?? "")} />
                  <DisplayField label="Updated By" value={brand.updatedBy || "---"} />
                  <DisplayField label="Business Name" value={brand.businessName || "---"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

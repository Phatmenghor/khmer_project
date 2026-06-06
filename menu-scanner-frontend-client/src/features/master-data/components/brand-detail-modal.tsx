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
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-foreground">
              Brand Details
            </h2>
            <p className="text-xs text-foreground mt-1">
              Detailed information about the selected brand
            </p>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {}
                <div className="flex flex-col md:flex-row gap-4">
                  {}
                  <div className="w-full md:w-1/2">
                    <p className="text-xs font-medium text-foreground">Brand Name</p>
                  </div>
                  {}
                  {brand.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <p className="text-xs font-medium text-foreground">Brand Image</p>
                    </div>
                  )}
                </div>

                {}
                <div className="flex flex-col md:flex-row gap-4">
                  {}
                  <div className="w-full md:w-1/2 space-y-3">
                    <p className="text-foreground">{brand.name || "---"}</p>
                    <DisplayField label="Description" value={brand.description || "---"} />
                    <DisplayField label="Status" value={brand.status ? formatEnumValue(brand.status) : "---"} />
                    <DisplayField label="Total Products" value={formatProductCount(brand.totalProducts)} />
                    <DisplayField label="Active Products" value={formatProductCount(brand.activeProducts)} />
                  </div>

                  {}
                  {brand.imageUrl && (
                    <div className="w-full md:w-1/2">
                      <div className="h-28 w-28 rounded overflow-hidden bg-muted border border-border flex-shrink-0">
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

            {}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

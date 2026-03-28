"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedCategories,
} from "../store/selectors/categories-selector";
import { fetchCategoriesByIdService } from "../store/thunks/categories-thunks";
import { clearSelectedCategories } from "../store/slice/categories-slice";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesDetailModalProps {
  categoriesId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoriesDetailModal({
  categoriesId,
  isOpen,
  onClose,
}: CategoriesDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const categoriesData = useAppSelector(selectSelectedCategories);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      if (!categoriesId || !isOpen) return;

      try {
        await dispatch(fetchCategoriesByIdService(categoriesId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching categories data:", error);
      }
    };

    fetchCategoriesData();
  }, [categoriesId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedCategories());
    onClose();
  };

  if (!categoriesData && !isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Category Details - {categoriesData?.name}</DialogTitle>
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
            {isFetchingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : categoriesData ? (
              <>
                {/* Category Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Image */}
                    {categoriesData.imageUrl && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Category Image</p>
                        <div className="h-32 w-32 rounded-md overflow-hidden bg-muted border border-border">
                          <img
                            src={categoriesData.imageUrl}
                            alt={categoriesData.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="Category Name" value={categoriesData.name || "---"} />
                      <DisplayField label="Business Name" value={categoriesData.businessName || "---"} />
                      <DisplayField label="Status" value={categoriesData.status || "---"} />
                      <DisplayField label="Product Count" value={categoriesData.productCount ?? categoriesData.totalProducts ?? "---"} />
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
                      <DisplayField label="Category ID" value={categoriesData.id} />
                      <DisplayField label="Created At" value={dateTimeFormat(categoriesData.createdAt ?? "")} />
                      <DisplayField label="Created By" value={categoriesData.createdBy || "---"} />
                      <DisplayField label="Last Updated" value={dateTimeFormat(categoriesData.updatedAt ?? "")} />
                      <DisplayField label="Updated By" value={categoriesData.updatedBy || "---"} />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

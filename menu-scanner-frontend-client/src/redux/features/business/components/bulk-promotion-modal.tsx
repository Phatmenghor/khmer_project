"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { BulkPromotionProductTable } from "./bulk-promotion-product-table";
import { bulkPromotionSchema, BulkPromotionFormData } from "../store/models/schema/bulk-promotion-schema";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllProductAdminService, createBulkPromotionsService } from "../store/thunks/product-thunks";
import { setPageNo } from "../store/slice/product-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { useProductState } from "../store/state/product-state";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { PROMOTION_TYPES, PROMOTION_DEFAULT_DURATION_DAYS } from "@/constants/form-options";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkPromotionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BulkPromotionFormData>({
    resolver: zodResolver(bulkPromotionSchema),
    mode: "onBlur",
    defaultValues: {
      productIds: [],
      promotionType: undefined,
      promotionValue: 0,
      promotionFromDate: new Date().toISOString(),
      promotionToDate: new Date(
        Date.now() + PROMOTION_DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  });

  // Fetch products for selection and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form and selections
      form.reset({
        productIds: [],
        promotionType: undefined,
        promotionValue: 0,
        promotionFromDate: new Date().toISOString(),
        promotionToDate: new Date(
        Date.now() + PROMOTION_DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000
      ).toISOString(),
      });
      setSelectedProductIds(new Set());

      // Fetch products
      dispatch(
        fetchAllProductAdminService({
          search: "",
          pageNo: 1,
          pageSize: globalPageSize,
          status: undefined,
        })
      );
    }
  }, [isOpen, dispatch, globalPageSize]);

  const handleSelectProduct = useCallback((productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected && productContent && productContent.length > 0) {
      const allIds = new Set(productContent.map((p) => p.id));
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds(new Set());
    }
  }, [productContent]);

  const handlePageChange = (page: number) => {
    dispatch(setPageNo(page));
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: page,
        pageSize: globalPageSize,
        status: undefined,
      })
    );
  };

  const onSubmit = async (data: BulkPromotionFormData) => {
    if (selectedProductIds.size === 0) {
      showToast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createBulkPromotionsService({
          productIds: Array.from(selectedProductIds),
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
        })
      ).unwrap();

      showToast.success(result.message || "Bulk promotion created successfully!");

      // Reset form and close modal
      form.reset();
      setSelectedProductIds(new Set());
      onClose();

      // Refresh products list
      dispatch(
        fetchAllProductAdminService({
          search: "",
          pageNo: 1,
          pageSize: globalPageSize,
          hasPromotion: true,
          status: undefined,
        })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? (error as Record<string, unknown>).message
          : "Failed to create bulk promotion";

      showToast.error(String(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedProductIds(new Set());
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogTitle className="sr-only">Create Bulk Promotion</DialogTitle>

        <FormHeader title="Create Bulk Promotion" />

        <FormBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Grid Layout - 2 Columns */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Product Selection */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Step 1: Select Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BulkPromotionProductTable
                      products={productContent}
                      selectedProductIds={selectedProductIds}
                      onSelectProduct={handleSelectProduct}
                      onSelectAll={handleSelectAll}
                      currentPage={filters.pageNo}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Promotion Details */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Step 2: Promotion Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 auto-rows-max">
                      {/* Promotion Type */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Promotion Type *</label>
                        <select
                          {...form.register("promotionType")}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="">Select promotion type...</option>
                          {PROMOTION_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {form.formState.errors.promotionType && (
                          <p className="text-xs text-destructive font-medium">
                            {form.formState.errors.promotionType.message}
                          </p>
                        )}
                      </div>

                      {/* Promotion Value */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {form.watch("promotionType") === "PERCENTAGE"
                            ? "Discount Percentage (%)"
                            : "Discount Amount ($)"} *
                        </label>
                        <input
                          type="number"
                          placeholder={
                            form.watch("promotionType") === "PERCENTAGE"
                              ? "Enter 0-100"
                              : "Enter amount"
                          }
                          step="0.01"
                          min="0"
                          max={form.watch("promotionType") === "PERCENTAGE" ? "100" : ""}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...form.register("promotionValue", {
                            valueAsNumber: true,
                          })}
                        />
                        {form.formState.errors.promotionValue && (
                          <p className="text-xs text-destructive font-medium">
                            {form.formState.errors.promotionValue.message}
                          </p>
                        )}
                      </div>

                      {/* Date Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From Date *</label>
                        <input
                          type="datetime-local"
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...form.register("promotionFromDate")}
                        />
                        {form.formState.errors.promotionFromDate && (
                          <p className="text-xs text-destructive font-medium">
                            {form.formState.errors.promotionFromDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">To Date *</label>
                        <input
                          type="datetime-local"
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...form.register("promotionToDate")}
                        />
                        {form.formState.errors.promotionToDate && (
                          <p className="text-xs text-destructive font-medium">
                            {form.formState.errors.promotionToDate.message}
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      {selectedProductIds.size > 0 && (
                        <Card className="bg-blue-50 border-blue-200 mt-2">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-blue-900">Summary:</p>
                              <p className="text-xs text-blue-800">
                                <strong>{selectedProductIds.size}</strong> product(s) selected
                              </p>
                              {form.watch("promotionType") && (
                                <p className="text-xs text-blue-800">
                                  Discount: <strong>
                                    {form.watch("promotionType") === "PERCENTAGE"
                                      ? `${form.watch("promotionValue")}%`
                                      : `$${form.watch("promotionValue")}`}
                                  </strong>
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <FormFooter>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isLoading={isSubmitting}
                disabled={selectedProductIds.size === 0 || isSubmitting}
                text="Create Promotion"
                loadingText="Creating..."
              />
            </FormFooter>
          </form>
        </FormBody>
      </DialogContent>
    </Dialog>
  );
};

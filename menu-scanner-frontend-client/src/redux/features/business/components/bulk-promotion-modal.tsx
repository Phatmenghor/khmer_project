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
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { BulkPromotionProductTable } from "./bulk-promotion-product-table";
import { bulkPromotionSchema, BulkPromotionFormData } from "../store/models/schema/bulk-promotion-schema";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllProductAdminService, createBulkPromotionsService } from "../store/thunks/product-thunks";
import { selectProductStatus, setPageNo } from "../store/slice/product-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { useProductState } from "../store/state/product-state";
import { usePagination } from "@/redux/store/use-pagination";
import { ROUTES } from "@/constants/app-routes/routes";
import { ProductStatus } from "@/constants/status/status";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PROMOTION_TYPES = [
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

export const BulkPromotionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products for selection and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form and selections
      form.reset({
        productIds: [],
        promotionType: undefined,
        promotionValue: undefined,
        promotionFromDate: new Date().toISOString(),
        promotionToDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
  }, [isOpen, dispatch, globalPageSize, form]);

  const form = useForm<BulkPromotionFormData>({
    resolver: zodResolver(bulkPromotionSchema),
    mode: "onChange",
    defaultValues: {
      productIds: [],
      promotionType: undefined,
      promotionValue: undefined,
      promotionFromDate: new Date().toISOString(),
      promotionToDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

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
    } catch (error: any) {
      showToast.error(
        error?.message || "Failed to create bulk promotion"
      );
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Create Bulk Promotion</DialogTitle>

        <FormHeader title="Create Bulk Promotion" />

        <FormBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Selection Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 1: Select Products</CardTitle>
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

            {/* Promotion Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 2: Set Promotion Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promotion Type */}
                <SelectField
                  label="Promotion Type"
                  placeholder="Select promotion type..."
                  options={PROMOTION_TYPES}
                  error={form.formState.errors.promotionType?.message}
                  disabled={isSubmitting}
                  {...form.register("promotionType")}
                  onValueChange={(value) =>
                    form.setValue("promotionType", value as any)
                  }
                  value={form.watch("promotionType")}
                />

                {/* Promotion Value */}
                <TextField
                  label={
                    form.watch("promotionType") === "PERCENTAGE"
                      ? "Discount Percentage (%)"
                      : "Discount Amount ($)"
                  }
                  type="number"
                  placeholder={
                    form.watch("promotionType") === "PERCENTAGE"
                      ? "Enter percentage (0-100)"
                      : "Enter amount"
                  }
                  step="0.01"
                  min="0"
                  max={form.watch("promotionType") === "PERCENTAGE" ? "100" : ""}
                  error={form.formState.errors.promotionValue?.message}
                  disabled={isSubmitting}
                  {...form.register("promotionValue", {
                    valueAsNumber: true,
                  })}
                />

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <DateTimePickerField
                    label="Promotion From"
                    error={form.formState.errors.promotionFromDate?.message}
                    disabled={isSubmitting}
                    value={form.watch("promotionFromDate")}
                    onChange={(value) =>
                      form.setValue("promotionFromDate", value || "")
                    }
                  />
                  <DateTimePickerField
                    label="Promotion To"
                    error={form.formState.errors.promotionToDate?.message}
                    disabled={isSubmitting}
                    value={form.watch("promotionToDate")}
                    onChange={(value) =>
                      form.setValue("promotionToDate", value || "")
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedProductIds.size > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    <strong>{selectedProductIds.size}</strong> product(s) will be updated with{" "}
                    <strong>
                      {form.watch("promotionType") === "PERCENTAGE"
                        ? `${form.watch("promotionValue")}% discount`
                        : `$${form.watch("promotionValue")} discount`}
                    </strong>
                  </p>
                </CardContent>
              </Card>
            )}

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

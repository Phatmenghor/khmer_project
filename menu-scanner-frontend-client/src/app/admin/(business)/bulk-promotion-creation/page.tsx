"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useProductState } from "@/redux/features/business/store/state/product-state";
import { fetchAllProductAdminService, createBulkPromotionsService } from "@/redux/features/business/store/thunks/product-thunks";
import { setPageNo } from "@/redux/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { bulkPromotionSchema, BulkPromotionFormData } from "@/redux/features/business/store/models/schema/bulk-promotion-schema";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

const PROMOTION_TYPES = [
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

export default function BulkPromotionCreationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BulkPromotionFormData>({
    resolver: zodResolver(bulkPromotionSchema),
    mode: "onBlur",
    defaultValues: {
      productIds: [],
      promotionType: undefined,
      promotionValue: 0,
      promotionFromDate: new Date().toISOString(),
      promotionToDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  // Fetch products on page load
  useEffect(() => {
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: 1,
        pageSize: globalPageSize,
        status: undefined,
      })
    );
  }, [dispatch, globalPageSize]);

  // Calculate checkbox states
  const allSelected = productContent.length > 0 && productContent.every((p) => selectedProductIds.has(p.id));
  const someSelected = productContent.some((p) => selectedProductIds.has(p.id)) && !allSelected;

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
      router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to create bulk promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION);
  };

  const discountDisplay = useMemo(() => {
    const type = form.watch("promotionType");
    const value = form.watch("promotionValue");
    if (!type || !value) return null;
    return type === "PERCENTAGE" ? `${value}%` : `$${value}`;
  }, [form.watch("promotionType"), form.watch("promotionValue")]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Create Bulk Promotion</h1>
          </div>
          <p className="text-sm text-gray-600 ml-11">Select products and set promotion details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Product Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-6">Select Products</h2>

                {/* Select All */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
                  />
                  <label className="text-sm font-medium cursor-pointer">
                    Select all ({selectedProductIds.size} selected)
                  </label>
                </div>

                {/* Products List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-gray-500">Loading products...</p>
                    </div>
                  ) : productContent.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-gray-500">No products found</p>
                    </div>
                  ) : (
                    productContent.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedProductIds.has(product.id)}
                          onCheckedChange={() => handleSelectProduct(product.id)}
                          disabled={isLoading}
                        />
                        <CustomAvatar
                          imageUrl={product.mainImageUrl}
                          name={product.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.categoryName} • ${parseFloat(product.displayPrice?.toString() || "0").toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.pageNo - 1)}
                      disabled={filters.pageNo === 1 || isLoading}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-xs text-gray-500">
                      Page {filters.pageNo} of {pagination.totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.pageNo + 1)}
                      disabled={filters.pageNo === pagination.totalPages || isLoading}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Promotion Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8 h-fit">
                <h2 className="text-lg font-semibold mb-6">Promotion Details</h2>

                <div className="space-y-6">
                  {/* Promotion Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Promotion Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("promotionType")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select type...</option>
                      {PROMOTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.promotionType && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.promotionType.message}
                      </p>
                    )}
                  </div>

                  {/* Promotion Value */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {form.watch("promotionType") === "PERCENTAGE"
                        ? "Discount (%)"
                        : "Discount Amount ($)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder={
                        form.watch("promotionType") === "PERCENTAGE"
                          ? "0-100"
                          : "Amount"
                      }
                      step="0.01"
                      min="0"
                      max={form.watch("promotionType") === "PERCENTAGE" ? "100" : ""}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...form.register("promotionValue", {
                        valueAsNumber: true,
                      })}
                    />
                    {form.formState.errors.promotionValue && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.promotionValue.message}
                      </p>
                    )}
                  </div>

                  {/* From Date */}
                  <DateTimePickerField
                    control={form.control}
                    name="promotionFromDate"
                    label="From Date"
                    required
                    mode="datetime"
                    error={form.formState.errors.promotionFromDate}
                  />

                  {/* To Date */}
                  <DateTimePickerField
                    control={form.control}
                    name="promotionToDate"
                    label="To Date"
                    required
                    mode="datetime"
                    error={form.formState.errors.promotionToDate}
                  />

                  {/* Summary */}
                  {selectedProductIds.size > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-xs font-semibold text-blue-900 mb-3">Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-blue-800">
                          <span>Products Selected:</span>
                          <span className="font-semibold">{selectedProductIds.size}</span>
                        </div>
                        {discountDisplay && (
                          <div className="flex justify-between text-xs text-blue-800">
                            <span>Discount:</span>
                            <span className="font-semibold">{discountDisplay}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedProductIds.size === 0 || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Promotion"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

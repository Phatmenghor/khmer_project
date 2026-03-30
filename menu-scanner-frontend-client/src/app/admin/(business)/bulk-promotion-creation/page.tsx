"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

  const isFormValid = selectedProductIds.size > 0 &&
    form.watch("promotionType") &&
    form.watch("promotionValue") > 0;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Bulk Promotion</h1>
            <p className="text-sm text-slate-500 mt-0.5">Select products and configure discount settings</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{selectedProductIds.size}</p>
          <p className="text-xs text-slate-500">Products Selected</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden">
        {/* Left Column - Product Selection (Full scrollable) */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200">
          {/* Select All Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected || someSelected}
                onCheckedChange={handleSelectAll}
                disabled={isLoading}
                className="h-5 w-5"
              />
              <span className="text-sm font-semibold text-slate-700">
                {allSelected ? "All Selected" : someSelected ? "Partially Selected" : "Select Products"}
              </span>
            </div>
            {productContent.length > 0 && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {productContent.length} available
              </span>
            )}
          </div>

          {/* Products List */}
          <ScrollArea className="flex-1 w-full overflow-hidden">
            <div className="space-y-1 p-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">Loading products...</p>
                </div>
              ) : productContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-2">
                  <p className="text-sm text-slate-500 font-medium">No products found</p>
                  <p className="text-xs text-slate-400">Try adjusting your filters</p>
                </div>
              ) : (
                productContent.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                      selectedProductIds.has(product.id)
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={(e) => {
                        e.stopPropagation?.();
                        handleSelectProduct(product.id);
                      }}
                      disabled={isLoading}
                      className="h-5 w-5"
                    />
                    <CustomAvatar
                      imageUrl={product.mainImageUrl}
                      name={product.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.categoryName} • <span className="font-semibold">${parseFloat(product.displayPrice?.toString() || "0").toFixed(2)}</span>
                      </p>
                    </div>
                    {selectedProductIds.has(product.id) && (
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.pageNo - 1)}
                disabled={filters.pageNo === 1 || isLoading}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-600">
                  Page <span className="font-bold text-slate-900">{filters.pageNo}</span> of <span className="font-bold text-slate-900">{pagination.totalPages}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.pageNo + 1)}
                disabled={filters.pageNo === pagination.totalPages || isLoading}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Column - Promotion Details & Actions */}
        <div className="w-96 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 overflow-hidden">
          {/* Form Content */}
          <ScrollArea className="flex-1 w-full">
            <div className="p-6 space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg font-bold text-slate-900">Promotion Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Configure discount details for selected products</p>
              </div>

              <Separator className="bg-slate-200" />

              {/* Promotion Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("promotionType")}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-400"
                    disabled={isSubmitting}
                  >
                    <option value="">Choose discount type...</option>
                    {PROMOTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.promotionType && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      ⚠️ {form.formState.errors.promotionType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Promotion Value */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    {form.watch("promotionType") === "PERCENTAGE"
                      ? "Discount Percentage"
                      : "Discount Amount"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
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
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-400"
                      {...form.register("promotionValue", {
                        valueAsNumber: true,
                      })}
                    />
                    {form.watch("promotionType") && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
                        {form.watch("promotionType") === "PERCENTAGE" ? "%" : "$"}
                      </span>
                    )}
                  </div>
                  {form.formState.errors.promotionValue && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      ⚠️ {form.formState.errors.promotionValue.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Date Range */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Promotion Duration</p>

                <DateTimePickerField
                  control={form.control}
                  name="promotionFromDate"
                  label="Start Date"
                  required
                  mode="datetime"
                  error={form.formState.errors.promotionFromDate}
                />

                <DateTimePickerField
                  control={form.control}
                  name="promotionToDate"
                  label="End Date"
                  required
                  mode="datetime"
                  error={form.formState.errors.promotionToDate}
                />
              </div>

              <Separator className="bg-slate-200" />

              {/* Summary Card */}
              {selectedProductIds.size > 0 && (
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg">
                  <CardContent className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-3">Summary</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium opacity-90">Products Selected</span>
                        <span className="text-xl font-bold">{selectedProductIds.size}</span>
                      </div>
                      {discountDisplay && (
                        <>
                          <div className="w-full h-px bg-white opacity-20" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium opacity-90">Discount</span>
                            <span className="text-lg font-bold">{discountDisplay}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <Separator className="bg-slate-200 mb-6" />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 h-10 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 h-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      "Create Promotion"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </form>
    </div>
  );
}

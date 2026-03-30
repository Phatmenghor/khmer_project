"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
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

  // Watch form values without dependency issues
  const promotionType = form.watch("promotionType");
  const promotionValue = form.watch("promotionValue");

  const discountDisplay = useMemo(() => {
    if (!promotionType || !promotionValue) return null;
    return promotionType === "PERCENTAGE" ? `${promotionValue}%` : `$${promotionValue}`;
  }, [promotionType, promotionValue]);

  const isFormValid = selectedProductIds.size > 0 &&
    promotionType &&
    promotionValue > 0;

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Bulk Promotion</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Select products and configure discount settings</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{selectedProductIds.size}</p>
          <p className="text-xs text-muted-foreground">Products Selected</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Column - Product Selection (Table) */}
        <div className="flex-1 flex flex-col bg-background border-r border-border overflow-hidden">
          {/* Table */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-md border m-4 mb-0">
            <ScrollArea className="flex-1 w-full">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground border-b border-border w-12">
                      <Checkbox
                        checked={allSelected || someSelected}
                        onCheckedChange={handleSelectAll}
                        disabled={isLoading}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground border-b border-border">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground border-b border-border">Category</th>
                    <th className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground border-b border-border w-24">Price</th>
                  </tr>
                </thead>
              </table>
              <div className="w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
                  </div>
                ) : productContent.length === 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground border-b border-border/50">
                          No products found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {productContent.map((product) => (
                        <tr
                          key={product.id}
                          onClick={() => handleSelectProduct(product.id)}
                          className={`text-sm transition-all duration-200 cursor-pointer ${
                            selectedProductIds.has(product.id)
                              ? "hover:bg-muted/30 bg-muted/20"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-4 py-3 border-b border-border/50">
                            <Checkbox
                              checked={selectedProductIds.has(product.id)}
                              onCheckedChange={() => handleSelectProduct(product.id)}
                              disabled={isLoading}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                              <CustomAvatar
                                imageUrl={product.mainImageUrl}
                                name={product.name}
                                size="sm"
                              />
                              <span className="font-medium text-foreground truncate">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-border/50 text-muted-foreground">{product.categoryName}</td>
                          <td className="px-4 py-3 border-b border-border/50 text-right font-medium text-foreground">
                            ${parseFloat(product.displayPrice?.toString() || "0").toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 p-4 mx-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.pageNo - 1)}
                  disabled={filters.pageNo === 1 || isLoading}
                  className={`h-9 px-4 flex items-center gap-2 rounded-lg border font-medium transition-all duration-200 text-sm ${
                    filters.pageNo === 1
                      ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                      : "text-foreground border-border hover:bg-muted hover:border-border"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`h-9 min-w-9 px-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        filters.pageNo === page
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground border border-border hover:bg-muted hover:border-border"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(filters.pageNo + 1)}
                  disabled={filters.pageNo === pagination.totalPages || isLoading}
                  className={`h-9 px-4 flex items-center gap-2 rounded-lg border font-medium transition-all duration-200 text-sm ${
                    filters.pageNo === pagination.totalPages
                      ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                      : "text-foreground border-border hover:bg-muted hover:border-border"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Promotion Details & Actions */}
        <div className="w-96 flex flex-col bg-background border-l border-border overflow-hidden">
          {/* Form Content */}
          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg font-bold text-foreground">Promotion Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure discount details for selected products</p>
              </div>

              <Separator className="bg-border" />

              {/* Promotion Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Discount Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    {...form.register("promotionType")}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background hover:border-border"
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
                    <p className="text-xs text-destructive mt-1.5 font-medium">
                      ⚠️ {form.formState.errors.promotionType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Promotion Value */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {promotionType === "PERCENTAGE"
                      ? "Discount Percentage"
                      : "Discount Amount"}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={
                        promotionType === "PERCENTAGE"
                          ? "Enter 0-100"
                          : "Enter amount"
                      }
                      step="0.01"
                      min="0"
                      max={promotionType === "PERCENTAGE" ? "100" : ""}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background hover:border-border"
                      {...form.register("promotionValue", {
                        valueAsNumber: true,
                      })}
                    />
                    {promotionType && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                        {promotionType === "PERCENTAGE" ? "%" : "$"}
                      </span>
                    )}
                  </div>
                  {form.formState.errors.promotionValue && (
                    <p className="text-xs text-destructive mt-1.5 font-medium">
                      ⚠️ {form.formState.errors.promotionValue.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Date Range */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Promotion Duration</p>

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

              <Separator className="bg-border" />

              {/* Summary Card */}
              {selectedProductIds.size > 0 && (
                <Card className="bg-primary border-0 text-primary-foreground shadow-lg">
                  <CardContent className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-3">Summary</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium opacity-90">Products Selected</span>
                        <span className="text-xl font-bold">{selectedProductIds.size}</span>
                      </div>
                      {discountDisplay && (
                        <>
                          <div className="w-full h-px bg-primary-foreground opacity-20" />
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
                <Separator className="bg-border mb-6" />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 h-10 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
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

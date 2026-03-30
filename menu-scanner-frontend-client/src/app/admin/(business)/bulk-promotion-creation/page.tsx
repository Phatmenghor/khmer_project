"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { CustomSelect, SelectOption } from "@/components/shared/common/custom-select";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import {
  DataTableWithPagination,
  TableColumn,
} from "@/components/shared/common/data-table";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useProductState } from "@/redux/features/business/store/state/product-state";
import {
  fetchAllProductAdminService,
  createBulkPromotionsService,
} from "@/redux/features/business/store/thunks/product-thunks";
import { setPageNo } from "@/redux/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import {
  bulkPromotionSchema,
  BulkPromotionFormData,
} from "@/redux/features/business/store/models/schema/bulk-promotion-schema";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

const PROMOTION_TYPES: SelectOption[] = [
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

export default function BulkPromotionCreationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
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
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
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
      }),
    );
  }, [dispatch, globalPageSize]);

  // Calculate checkbox states
  const allSelected =
    productContent.length > 0 &&
    productContent.every((p) => selectedProductIds.has(p.id));
  const someSelected =
    productContent.some((p) => selectedProductIds.has(p.id)) && !allSelected;

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

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected && productContent && productContent.length > 0) {
        const allIds = new Set(productContent.map((p) => p.id));
        setSelectedProductIds(allIds);
      } else {
        setSelectedProductIds(new Set());
      }
    },
    [productContent],
  );

  const handlePageChange = (page: number) => {
    dispatch(setPageNo(page));
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: page,
        pageSize: globalPageSize,
        status: undefined,
      }),
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
        }),
      ).unwrap();

      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );
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
    return promotionType === "PERCENTAGE"
      ? `${promotionValue}%`
      : `$${promotionValue}`;
  }, [promotionType, promotionValue]);

  const isFormValid =
    selectedProductIds.size > 0 && promotionType && promotionValue > 0;

  // Define table columns for products - stable memoization
  const columns = useMemo<TableColumn<ProductDetailResponseModel>[]>(() => [
    {
      key: "checkbox",
      label: "",
      width: "48px",
      render: (product) => (
        <Checkbox
          key={`checkbox-${product.id}-${selectedProductIds.has(product.id)}`}
          checked={selectedProductIds.has(product.id)}
          onCheckedChange={() => handleSelectProduct(product.id)}
          disabled={isLoading}
          className="h-4 w-4"
        />
      ),
    },
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CustomAvatar
              imageUrl={product.mainImageUrl}
              name={product.name}
              size="sm"
            />
            <span className="font-medium truncate">{product.name}</span>
          </div>
          {selectedProductIds.has(product.id) && (
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
        </div>
      ),
    },
    {
      key: "categoryName",
      label: "Category",
      render: (product) => product.categoryName,
    },
    {
      key: "price",
      label: "Price",
      className: "text-right",
      render: (product) => `$${parseFloat(product.displayPrice?.toString() || "0").toFixed(2)}`,
    },
  ], []);

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 hover:bg-muted"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create Bulk Promotion</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Select products and apply discount settings</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0"
      >
        {/* Left Column - Product Selection */}
        <div className="flex-1 flex flex-col gap-4 px-2 sm:px-4 py-4 overflow-hidden min-h-0 lg:border-r lg:border-border">
          <div className="flex-1 overflow-hidden min-h-0">
            <DataTableWithPagination
              key={`table-${selectedProductIds.size}`}
              data={productContent}
              columns={columns}
              loading={isLoading}
              emptyMessage="No products found"
              getRowKey={(product) => product.id}
              onRowClick={(product) => handleSelectProduct(product.id)}
              currentPage={filters.pageNo}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              showPagination={pagination.totalPages > 1}
            />
          </div>
        </div>

        {/* Right Column - Promotion Settings */}
        <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-2 sm:px-4 py-4 space-y-4 sm:space-y-6">
              {/* Selected Count */}
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  Selected Products
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {selectedProductIds.size}
                </p>
              </div>

              {/* Promotion Type */}
              <CustomSelect
                label="Discount Type"
                placeholder="Choose discount type..."
                options={PROMOTION_TYPES}
                value={promotionType}
                onValueChange={(value) => form.setValue("promotionType", value as "FIXED_AMOUNT" | "PERCENTAGE")}
                disabled={isSubmitting}
                required
                size="md"
              />
              {form.formState.errors.promotionType && (
                <p className="text-xs text-destructive font-medium">
                  ⚠️ {form.formState.errors.promotionType.message}
                </p>
              )}

              {/* Promotion Value */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-foreground">
                  {promotionType === "PERCENTAGE"
                    ? "Discount Percentage"
                    : "Discount Amount"}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={
                      promotionType === "PERCENTAGE" ? "0-100" : "Amount"
                    }
                    step="0.01"
                    min="0"
                    max={promotionType === "PERCENTAGE" ? "100" : ""}
                    disabled={isSubmitting}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background hover:border-border"
                    {...form.register("promotionValue", {
                      valueAsNumber: true,
                    })}
                  />
                  {promotionType && (
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-muted-foreground">
                      {promotionType === "PERCENTAGE" ? "%" : "$"}
                    </span>
                  )}
                </div>
                {form.formState.errors.promotionValue && (
                  <p className="text-xs text-destructive font-medium">
                    ⚠️ {form.formState.errors.promotionValue.message}
                  </p>
                )}
              </div>

              <Separator className="bg-border" />

              {/* Date Range */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Promotion Duration
                </p>
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

              {/* Summary Card */}
              {selectedProductIds.size > 0 && discountDisplay && (
                <Card className="bg-primary border-0 text-primary-foreground shadow-lg">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-2 sm:mb-3">
                      Summary
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm opacity-90">
                          Items
                        </span>
                        <span className="font-bold text-sm sm:text-base">
                          {selectedProductIds.size}
                        </span>
                      </div>
                      <div className="w-full h-px bg-primary-foreground opacity-20" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm opacity-90">
                          Discount
                        </span>
                        <span className="font-bold text-base sm:text-lg">
                          {discountDisplay}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 px-2 sm:px-4 py-3 sm:py-4 border-t border-border shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span className="hidden sm:inline">Creating...</span>
                  <span className="sm:hidden">Create...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Create Promotion</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

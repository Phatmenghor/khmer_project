"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { PageFormHeader } from "@/components/shared/form-field/page-form-header";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useProductState } from "@/redux/features/business/store/state/product-state";
import { fetchAllProductAdminService, createBulkPromotionsService } from "@/redux/features/business/store/thunks/product-thunks";
import { setPageNo } from "@/redux/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { bulkPromotionSchema, BulkPromotionFormData } from "@/redux/features/business/store/models/schema/bulk-promotion-schema";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

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

  // Define table columns for products
  const columns = useMemo<TableColumn<ProductDetailResponseModel>[]>(() => [
    {
      key: "checkbox",
      label: "",
      width: "48px",
      render: (product) => (
        <Checkbox
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
        <div className="flex items-center gap-2">
          <CustomAvatar
            imageUrl={product.mainImageUrl}
            name={product.name}
            size="sm"
          />
          <span className="font-medium truncate">{product.name}</span>
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
  ], [selectedProductIds, isLoading]);

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Header */}
      <PageFormHeader
        title="Create Bulk Promotion"
        description="Select products and apply discount settings to multiple items"
        isCreate
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Column - Product Selection */}
        <div className="flex-1 flex flex-col gap-4 px-4 py-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <DataTableWithPagination
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
              showPageSizeSelector={false}
            />
          </div>
        </div>

        {/* Right Column - Promotion Settings */}
        <div className="w-96 flex flex-col gap-4 px-4 py-4 overflow-hidden border-l border-border">
          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            <div className="pr-4 space-y-6">
              {/* Selected Count */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Selected Products</p>
                <p className="text-2xl font-bold text-foreground mt-1">{selectedProductIds.size}</p>
              </div>

              {/* Promotion Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
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
                  <p className="text-xs text-destructive font-medium">
                    ⚠️ {form.formState.errors.promotionType.message}
                  </p>
                )}
              </div>

              {/* Promotion Value */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  {promotionType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={promotionType === "PERCENTAGE" ? "Enter 0-100" : "Enter amount"}
                    step="0.01"
                    min="0"
                    max={promotionType === "PERCENTAGE" ? "100" : ""}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background hover:border-border"
                    {...form.register("promotionValue", { valueAsNumber: true })}
                  />
                  {promotionType && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
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

              {/* Summary Card */}
              {selectedProductIds.size > 0 && discountDisplay && (
                <Card className="bg-primary border-0 text-primary-foreground shadow-lg">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-3">Summary</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm opacity-90">Items</span>
                        <span className="font-bold">{selectedProductIds.size}</span>
                      </div>
                      <div className="w-full h-px bg-primary-foreground opacity-20" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm opacity-90">Discount</span>
                        <span className="font-bold text-lg">{discountDisplay}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
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
      </form>
    </div>
  );
}

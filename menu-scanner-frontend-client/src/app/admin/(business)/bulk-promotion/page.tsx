"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CheckSquare, Square, Trash2 } from "lucide-react";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { CustomSelect } from "@/components/shared/common/custom-select";
import {
  DataTableWithPagination,
  TableColumn,
} from "@/components/shared/common/data-table";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
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
import {
  PROMOTION_TYPES,
  PROMOTION_DEFAULT_DURATION_DAYS,
} from "@/constants/form-options";
import { AppDefault } from "@/constants/app-resource/default/default";
import { bulkPromotionTableColumns } from "@/redux/features/business/table/bulk-promotion-table";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { ProductStatus } from "@/constants/status/status";
import { selectProductStatus } from "@/redux/features/business/store/slice/product-slice";
import {
  setSelectedProducts,
  toggleSelectedProduct,
  clearSelectedProducts,
} from "@/redux/features/business/store/slice/bulk-promotion-slice";
import { selectSelectedProductIds } from "@/redux/features/business/store/selectors/bulk-promotion-selector";
import { useBulkPromotionStorageSync } from "@/hooks/useBulkPromotionStorageSync";

export default function BulkPromotionCreationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const selectedProductIdsFromRedux = useAppSelector(selectSelectedProductIds);

  // Convert array to Map for efficient lookup
  const selectedProductIds = useMemo(() => {
    return new Map(selectedProductIdsFromRedux.map((id) => [id, true]));
  }, [selectedProductIdsFromRedux]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(globalPageSize);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);

  const form = useForm<BulkPromotionFormData>({
    resolver: zodResolver(bulkPromotionSchema),
    mode: "onBlur",
    defaultValues: {
      productIds: [],
      promotionType: undefined,
      promotionValue: 0,
      promotionFromDate: new Date().toISOString(),
      promotionToDate: new Date(
        Date.now() + PROMOTION_DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  });

  // ─── localStorage Sync with Redux (Bulk Promotion Selections) ───
  // Same pattern as POS cart sync - clean and simple!
  const { clearSelections } = useBulkPromotionStorageSync({
    storageKey: "bulk-promotion:selected-products",
    debounceMs: 1000,
    enabled: true,
  });

  // Fetch products on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: 1,
        pageSize: globalPageSize,
        status:
          filters.status === ProductStatus.ALL ? undefined : filters.status,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
      }),
    );
  }, [
    dispatch,
    globalPageSize,
    filters.status,
    selectedBrand,
    selectedCategories,
  ]);

  // Toggle product selection
  const handleSelectProduct = useCallback(
    (productId: string) => {
      dispatch(toggleSelectedProduct(productId));
    },
    [dispatch, selectedProductIdsFromRedux],
  );

  // Select/deselect all products on current page
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && productContent.length > 0) {
        const currentPageIds = productContent.map((p) => p.id);
        const combined = new Set([
          ...selectedProductIdsFromRedux,
          ...currentPageIds,
        ]);
        dispatch(setSelectedProducts(Array.from(combined)));
      } else {
        const pageIdsSet = new Set(productContent.map((p) => p.id));
        const filtered = selectedProductIdsFromRedux.filter(
          (id) => !pageIdsSet.has(id),
        );
        dispatch(setSelectedProducts(filtered));
      }
    },
    [selectedProductIdsFromRedux, productContent, dispatch],
  );

  // Check if all products on current page are selected
  const allSelected =
    productContent.length > 0 &&
    productContent.every((p) => selectedProductIds.has(p.id));

  // Check if some products are selected
  const someSelected =
    productContent.some((p) => selectedProductIds.has(p.id)) && !allSelected;

  // Filter handlers
  const handleBrandChange = (brand: BrandResponseModel | null) => {
    setSelectedBrand(brand);
    dispatch(setPageNo(1));
  };

  const handleCategoriesChange = (
    categories: CategoriesResponseModel | null,
  ) => {
    setSelectedCategories(categories);
    dispatch(setPageNo(1));
  };

  const handleProductStatusChange = (status: ProductStatus) => {
    dispatch(selectProductStatus(status));
    dispatch(setPageNo(1));
  };

  // Clear all selections (for testing/resetting)
  const handleClearAllSelections = () => {
    dispatch(clearSelectedProducts());
    clearSelections();
    showToast.success("All selections cleared");
  };

  // Get selected product IDs as array
  const selectedIds = Array.from(selectedProductIds.keys());

  // Watch form values
  const promotionType = form.watch("promotionType");
  const promotionValue = form.watch("promotionValue");

  // Discount display
  const discountDisplay = useMemo(() => {
    if (!promotionType || !promotionValue) return null;
    return promotionType === "PERCENTAGE"
      ? `${promotionValue}%`
      : `$${promotionValue}`;
  }, [promotionType, promotionValue]);

  // Form validity
  const isFormValid =
    selectedIds.length > 0 && promotionType && promotionValue > 0;

  // Define table columns using bulk promotion table
  const columns = useMemo<TableColumn<ProductDetailResponseModel>[]>(
    () =>
      bulkPromotionTableColumns({
        selectedProductIds,
        onSelectProduct: handleSelectProduct,
        onSelectAll: handleSelectAll,
        allSelected,
        someSelected,
        isLoading,
        pageNo: filters.pageNo,
        pageSize,
      }),
    [
      selectedProductIds,
      handleSelectProduct,
      handleSelectAll,
      allSelected,
      someSelected,
      isLoading,
      filters.pageNo,
      pageSize,
    ],
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPageNo(page));
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: page,
        pageSize: pageSize,
        status:
          filters.status === ProductStatus.ALL ? undefined : filters.status,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
      }),
    );
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    dispatch(setPageNo(1));
    dispatch(
      fetchAllProductAdminService({
        search: "",
        pageNo: 1,
        pageSize: newPageSize,
        status:
          filters.status === ProductStatus.ALL ? undefined : filters.status,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
      }),
    );
  };

  // Handle form submission
  const onSubmit = async (data: BulkPromotionFormData) => {
    if (selectedIds.length === 0) {
      showToast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createBulkPromotionsService({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
        }),
      ).unwrap();

      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );
      // Clear selections after successful creation
      dispatch(clearSelectedProducts());
      clearSelections();
      router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION);
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

  return (
    <div className="flex flex-1 flex-col h-full bg-background scroll-smooth">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
            className="h-9 w-9 hover:bg-muted"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Create Bulk Promotion
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Select products and apply discount settings
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0"
      >
        {/* Left Column - Product Selection */}
        <div className="flex-1 flex flex-col gap-4 px-2 sm:px-4 py-4 overflow-y-auto min-h-0 lg:border-r lg:border-border scroll-smooth">
          {/* Filters + Select All Control - Combined Row */}
          {productContent.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 transition-all duration-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-3 gap-4">
                {/* Left Side - Select All Control */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <CustomCheckbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
                    size="lg"
                    variant="default"
                    ariaLabel="Select all products on this page"
                    className="flex-shrink-0"
                  />

                  {/* Status Text */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                      {allSelected
                        ? "All products selected"
                        : someSelected
                          ? `${
                              Array.from(selectedProductIds.keys()).filter(
                                (id) => productContent.some((p) => p.id === id),
                              ).length
                            } products selected`
                          : "Select all products"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {productContent.length} products on this page
                    </span>
                  </div>

                  {/* Count Badge + Clear Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedIds.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {selectedIds.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearAllSelections}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-destructive border border-destructive/40 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-150"
                          title="Clear all selections (stored in browser)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Spacer - pushes filters to the right */}
                <div className="hidden sm:block flex-1"></div>

                {/* Right Side - Filters (aligned to the end) */}
                <div className="flex flex-wrap items-end gap-2 flex-shrink-0">
                  <div className="max-w-[150px]">
                    <ComboboxSelectBrand
                      dataSelect={selectedBrand}
                      onChangeSelected={handleBrandChange}
                      placeholder="All Brand"
                      showAllOption={true}
                    />
                  </div>
                  <div className="max-w-[150px]">
                    <ComboboxSelectCategories
                      dataSelect={selectedCategories}
                      onChangeSelected={handleCategoriesChange}
                      placeholder="All Categories"
                      showAllOption={true}
                    />
                  </div>
                  <div className="">
                    <CustomSelect
                      options={PRODUCT_STATUS_FILTER}
                      value={filters.status}
                      placeholder="All Status"
                      onValueChange={(value) =>
                        handleProductStatusChange(value as ProductStatus)
                      }
                      className="w-[150px]"
                      label="Product Status"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Table with DataTableWithPagination */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <DataTableWithPagination<ProductDetailResponseModel>
              data={productContent}
              columns={columns}
              loading={isLoading}
              currentPage={filters.pageNo}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
              showPagination={pagination.totalPages > 1}
              showPageSizeSelector={true}
              emptyMessage="No products found"
            />
          </div>
        </div>

        {/* Right Column - Promotion Settings */}
        <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden scroll-smooth">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-2 sm:px-4 py-4 space-y-4 sm:space-y-4">
              {/* Selected Count Card */}
              <div className="h-20 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border flex flex-col justify-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  Selected Products
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                  {selectedIds.length}
                </p>
              </div>

              {/* Discount Type */}
              <div className="h-20 flex flex-col justify-center">
                <CustomSelect
                  label="Discount Type"
                  placeholder="Choose discount type..."
                  options={PROMOTION_TYPES}
                  value={promotionType}
                  onValueChange={(value) =>
                    form.setValue(
                      "promotionType",
                      value as "FIXED_AMOUNT" | "PERCENTAGE",
                    )
                  }
                  disabled={isSubmitting}
                  required
                  size="md"
                />
                {form.formState.errors.promotionType && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    ⚠️ {form.formState.errors.promotionType.message}
                  </p>
                )}
              </div>

              {/* Promotion Value */}
              <div className="h-20 flex flex-col justify-center">
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
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
                  <p className="text-xs text-destructive font-medium mt-1">
                    ⚠️ {form.formState.errors.promotionValue.message}
                  </p>
                )}
              </div>

              <Separator className="bg-border" />

              {/* Date Range */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Promotion Duration
                </p>
                <div className="h-20 flex flex-col justify-center">
                  <DateTimePickerField
                    control={form.control}
                    name="promotionFromDate"
                    label="Start Date"
                    required
                    mode="datetime"
                    error={form.formState.errors.promotionFromDate}
                  />
                </div>
                <div className="h-20 flex flex-col justify-center">
                  <DateTimePickerField
                    control={form.control}
                    name="promotionToDate"
                    label="End Date"
                    required
                    mode="datetime"
                    error={form.formState.errors.promotionToDate}
                  />
                </div>
              </div>

              {/* Summary Card */}
              {selectedIds.length > 0 && discountDisplay && (
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
                          {selectedIds.length}
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

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
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
                      <span className="hidden sm:inline">Applying...</span>
                      <span className="sm:hidden">Apply...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Apply</span>
                      <span className="sm:hidden">Apply</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CheckSquare, Square, Trash2 } from "lucide-react";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { PromotionValueField } from "@/components/shared/form-field/promotion-value-field";
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
  resetAllPromotionsService,
} from "@/redux/features/business/store/thunks/product-thunks";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
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
import { useBulkPromotionSizesStorageSync } from "@/hooks/useBulkPromotionSizesStorageSync";
import {
  toggleSizeForProduct,
  clearAllSizeSelections,
  selectAllSizesForProduct,
  clearSizesForProduct,
} from "@/redux/features/business/store/slice/promotion-size-selection-slice";
import { selectPromotionSizeSelections } from "@/redux/features/business/store/selectors/promotion-size-selection-selector";

export default function BulkPromotionCreationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const selectedProductIdsFromRedux = useAppSelector(selectSelectedProductIds);
  const selectedSizesFromRedux = useAppSelector(selectPromotionSizeSelections);

  // Convert array to Map for efficient lookup
  const selectedProductIds = useMemo(() => {
    return new Map(selectedProductIdsFromRedux.map((id) => [id, true]));
  }, [selectedProductIdsFromRedux]);

  // Convert Redux size selections (arrays) to Map<string, Set<string>> for efficient lookup in table
  const selectedSizes = useMemo(() => {
    const sizeMap = new Map<string, Set<string>>();
    Object.entries(selectedSizesFromRedux).forEach(([productId, sizeArray]) => {
      if (Array.isArray(sizeArray) && sizeArray.length > 0) {
        sizeMap.set(productId, new Set(sizeArray));
      }
    });
    return sizeMap;
  }, [selectedSizesFromRedux]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(globalPageSize);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  // ─── localStorage Sync for Size Selections ───
  const { clearSelections: clearSizeSelections } = useBulkPromotionSizesStorageSync({
    storageKey: "bulk-promotion:selected-sizes",
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

  // Toggle product selection (and auto-select/deselect all sizes)
  const handleSelectProduct = useCallback(
    (productId: string) => {
      const isCurrentlySelected = selectedProductIds.has(productId);

      // Get the product to access its sizes
      const product = productContent.find((p) => p.id === productId);

      // Always toggle the product regardless of sizes
      dispatch(toggleSelectedProduct(productId));

      if (!isCurrentlySelected && product && product.hasSizes && product.sizes) {
        // Selecting product WITH sizes: auto-select all sizes
        const sizeIds = product.sizes.map((s) => s.id);
        dispatch(selectAllSizesForProduct({ productId, sizeIds }));
      } else if (isCurrentlySelected) {
        // Deselecting: clear all sizes for this product (if any)
        dispatch(clearSizesForProduct(productId));
      }
    },
    [dispatch, selectedProductIds, productContent],
  );

  // Toggle size selection for a product
  const handleSizeToggle = useCallback(
    (productId: string, sizeId: string) => {
      dispatch(toggleSizeForProduct({ productId, sizeId }));
    },
    [dispatch],
  );

  // Select/deselect all products on current page (and auto-select/deselect sizes)
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && productContent.length > 0) {
        const currentPageIds = productContent.map((p) => p.id);
        const combined = new Set([
          ...selectedProductIdsFromRedux,
          ...currentPageIds,
        ]);
        dispatch(setSelectedProducts(Array.from(combined)));

        // Auto-select all sizes for newly selected products (only if they have sizes)
        productContent.forEach((product) => {
          if (!selectedProductIds.has(product.id) && product.hasSizes && product.sizes) {
            const sizeIds = product.sizes.map((s) => s.id);
            dispatch(selectAllSizesForProduct({ productId: product.id, sizeIds }));
          }
        });
      } else {
        const pageIdsSet = new Set(productContent.map((p) => p.id));
        const filtered = selectedProductIdsFromRedux.filter(
          (id) => !pageIdsSet.has(id),
        );
        dispatch(setSelectedProducts(filtered));

        // Clear all sizes for deselected products
        productContent.forEach((product) => {
          if (pageIdsSet.has(product.id)) {
            dispatch(clearSizesForProduct(product.id));
          }
        });
      }
    },
    [selectedProductIdsFromRedux, selectedProductIds, productContent, dispatch],
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
    dispatch(clearAllSizeSelections());
    clearSelections();
    clearSizeSelections();
    showToast.success("All selections cleared");
  };

  // Get selected product IDs as array
  const selectedIds = Array.from(selectedProductIds.keys());

  // Handle view product details
  const handleViewDetails = useCallback(
    (product: ProductDetailResponseModel) => {
      // Navigate to product details or show modal
      console.log("View details for:", product.id);
    },
    [],
  );

  // Handle edit product
  const handleEditProduct = useCallback(
    (product: ProductDetailResponseModel) => {
      // Navigate to product edit or show modal
      console.log("Edit product:", product.id);
    },
    [],
  );

  // Sync selected products to form
  useEffect(() => {
    form.setValue("productIds", selectedIds);
  }, [selectedIds, form]);

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

  // Form validity - check required fields manually
  const hasValidPromotionType = !!promotionType;
  const hasValidPromotionValue = promotionValue && promotionValue > 0;
  const hasValidDates =
    form.watch("promotionFromDate") &&
    form.watch("promotionToDate") &&
    new Date(form.watch("promotionFromDate")) < new Date(form.watch("promotionToDate"));
  const hasSelectedProducts = selectedIds.length > 0;

  const isFormValid =
    hasValidPromotionType &&
    hasValidPromotionValue &&
    hasValidDates &&
    hasSelectedProducts;

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
        selectedSizes,
        onSizeToggle: handleSizeToggle,
        onViewDetails: handleViewDetails,
        onEditProduct: handleEditProduct,
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
      selectedSizes,
      handleSizeToggle,
      handleViewDetails,
      handleEditProduct,
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
      // Build product size mapping
      const productSizeMapping: Record<string, string[]> = {};
      selectedIds.forEach((productId) => {
        const sizeSet = selectedSizes.get(productId);
        if (sizeSet && sizeSet.size > 0) {
          productSizeMapping[productId] = Array.from(sizeSet);
        }
      });

      const result = await dispatch(
        createBulkPromotionsService({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
          productSizeMapping: Object.keys(productSizeMapping).length > 0 ? productSizeMapping : undefined,
        }),
      ).unwrap();

      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );
      // Clear selections after successful creation
      dispatch(clearSelectedProducts());
      dispatch(clearAllSizeSelections());
      clearSelections();
      form.reset();
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

  // Handle apply button click
  const handleApplyClick = async () => {
    // Manually trigger validation first
    const isValidForm = await form.trigger();

    if (!isValidForm) {
      return;
    }

    // Trigger form submission
    await form.handleSubmit(onSubmit)();
  };

  // Handle reset all promotions
  const handleResetAllPromotions = async () => {
    try {
      setIsResetting(true);
      await dispatch(resetAllPromotionsService()).unwrap();
      showToast.success("All promotions have been reset successfully!");
      setShowResetModal(false);
      // Clear size selections as well
      dispatch(clearAllSizeSelections());
      // Refresh products list
      dispatch(
        fetchAllProductAdminService({
          search: "",
          pageNo: filters.pageNo,
          pageSize: pageSize,
          status:
            filters.status === ProductStatus.ALL ? undefined : filters.status,
          brandId: selectedBrand?.id,
          categoryId: selectedCategories?.id,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset promotions";
      showToast.error(errorMessage);
    } finally {
      setIsResetting(false);
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
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowResetModal(true)}
          className="gap-2"
          title="Reset all promotions"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Reset All</span>
        </Button>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-no-progress="true"
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

                  {/* Clear Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllSelections}
                        className="inline-flex ml-3 items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-destructive border border-destructive/40 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-150"
                        title="Clear all selections (stored in browser)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Spacer - pushes filters to the right */}
                <div className="hidden sm:block flex-1"></div>

                {/* Right Side - Filters (aligned to the end) */}
                <div className="flex flex-wrap items-end gap-2 flex-shrink-0">
                  <div className="max-w-[150px]">
                    <ComboboxSelectCategories
                      dataSelect={selectedCategories}
                      onChangeSelected={handleCategoriesChange}
                      placeholder="All Categories"
                      showAllOption={true}
                    />
                  </div>

                  <div className="max-w-[150px]">
                    <ComboboxSelectBrand
                      dataSelect={selectedBrand}
                      onChangeSelected={handleBrandChange}
                      placeholder="All Brand"
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
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
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
        <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden scroll-smooth bg-gradient-to-b from-background via-background to-primary/5">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 sm:px-5 md:px-4 lg:px-5 py-6 sm:py-8 md:py-6 lg:py-8 space-y-6 sm:space-y-8 md:space-y-6 lg:space-y-8">
              {/* Header Section */}
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Promotion Setup
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Configure discount details below
                </p>
              </div>

              {/* Selected Count Card */}
              <div className="rounded-lg p-5 bg-gradient-to-r from-primary/15 to-green-500/15 border border-primary/25 shadow-sm">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                    Selection Status
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 sm:gap-8">
                    {/* Products Count */}
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl sm:text-6xl font-black text-primary">
                        {selectedIds.length}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground/60">
                        {selectedIds.length === 1 ? "Product" : "Products"}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-primary/20" />

                    {/* Sizes Count */}
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl sm:text-4xl font-black text-green-600">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0
                        )}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground/60">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0
                        ) === 1 ? "Size" : "Sizes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Sections - Grouped */}
              <div className="space-y-6 sm:space-y-7 md:space-y-6 lg:space-y-7">
                {/* Discount Section */}
                <div className="space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider px-1">
                    Discount Settings
                  </h3>
                  <div className="space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
                    <CustomSelect
                      placeholder="Choose discount type..."
                      label="Discount Type"
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
                    />
                    {form.formState.errors.promotionType && (
                      <p className="text-xs text-destructive font-medium px-1">
                        {form.formState.errors.promotionType.message}
                      </p>
                    )}

                    <PromotionValueField
                      control={form.control}
                      name="promotionValue"
                      label={
                        promotionType === "PERCENTAGE"
                          ? "Discount Percentage"
                          : "Discount Amount"
                      }
                      promotionType={promotionType}
                      error={form.formState.errors.promotionValue}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Duration Section */}
                <div className="space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
                  <div className="space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
                    <DateTimePickerField
                      control={form.control}
                      className="h-10"
                      name="promotionFromDate"
                      label="Start Date"
                      required
                      mode="datetime"
                      error={form.formState.errors.promotionFromDate}
                    />

                    <DateTimePickerField
                      control={form.control}
                      className="h-10"
                      name="promotionToDate"
                      label="End Date"
                      required
                      mode="datetime"
                      error={form.formState.errors.promotionToDate}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons - Modern Style */}
              <div className="flex gap-3 sm:gap-4 md:gap-3 lg:gap-4 pt-2 sm:pt-4 md:pt-2 lg:pt-4">
                <CancelButton
                  onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11 md:h-10 lg:h-11 text-xs sm:text-sm md:text-xs lg:text-sm font-semibold rounded-lg border-2 hover:bg-muted/50"
                  text="Cancel"
                />
                <SubmitButton
                  isSubmitting={isSubmitting}
                  isDirty={selectedIds.length > 0}
                  isCreate={true}
                  createText="Apply Promotion"
                  submittingCreateText="Applying..."
                  disabled={!isFormValid}
                  onClick={handleApplyClick}
                  variant="default"
                  className="flex-1 h-10 sm:h-11 md:h-10 lg:h-11 text-xs sm:text-sm md:text-xs lg:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Reset All Promotions Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetAllPromotions}
        title="Reset All Promotions"
        description="Are you sure you want to reset all promotions? This will remove all current and future promotion data from all products and sizes."
        actionLabel="Reset All"
        actionVariant="destructive"
        headerBgColor="bg-red-50"
        isDangerous={true}
        isSubmitting={isResetting}
      />
    </div>
  );
}

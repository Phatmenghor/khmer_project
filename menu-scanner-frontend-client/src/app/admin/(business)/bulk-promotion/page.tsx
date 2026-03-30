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

  // Debug logs for form state
  useEffect(() => {
    console.log("Form State Debug:", {
      hasValidPromotionType,
      hasValidPromotionValue,
      hasValidDates,
      hasSelectedProducts,
      isFormValid,
      promotionType,
      promotionValue,
      selectedIds: selectedIds.length,
    });
  }, [
    hasValidPromotionType,
    hasValidPromotionValue,
    hasValidDates,
    hasSelectedProducts,
    isFormValid,
    promotionType,
    promotionValue,
    selectedIds.length,
  ]);

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
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form submitted with data:", data);
    console.log("Selected IDs:", selectedIds);
    console.log("Form valid:", form.formState.isValid);
    console.log("Form errors:", form.formState.errors);

    if (selectedIds.length === 0) {
      console.error("No products selected!");
      showToast.error("Please select at least one product");
      return;
    }

    console.log("✓ Validation passed, starting API call...");
    setIsSubmitting(true);
    try {
      console.log("Calling API with:", {
        productIds: selectedIds,
        promotionType: data.promotionType,
        promotionValue: data.promotionValue,
        promotionFromDate: data.promotionFromDate,
        promotionToDate: data.promotionToDate,
      });

      const result = await dispatch(
        createBulkPromotionsService({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
        }),
      ).unwrap();

      console.log("✓ API SUCCESS:", result);
      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );
      // Clear selections after successful creation
      dispatch(clearSelectedProducts());
      clearSelections();
      form.reset();
    } catch (error) {
      console.error("✗ API ERROR:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? (error as Record<string, unknown>).message
            : "Failed to create bulk promotion";

      showToast.error(String(errorMessage));
    } finally {
      setIsSubmitting(false);
      console.log("=== FORM SUBMISSION ENDED ===");
    }
  };

  // Handle apply button click
  const handleApplyClick = async () => {
    console.log("Apply button clicked!");
    console.log("Current form validity:", isFormValid);
    console.log("Is submitting:", isSubmitting);
    console.log("Form state:", {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      errors: form.formState.errors,
    });
    console.log("Form values:", form.getValues());
    console.log("Selected IDs:", selectedIds);

    // Manually trigger validation first
    const isValidForm = await form.trigger();
    console.log("Form trigger result:", isValidForm);

    if (!isValidForm) {
      console.error("Form validation failed!", form.formState.errors);
      return;
    }

    console.log("✓ Form validation passed, submitting...");
    // Trigger form submission manually
    try {
      await form.handleSubmit(onSubmit)();
      console.log("✓ Form submission completed");
    } catch (err) {
      console.error("✗ Form submission error:", err);
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

              {/* Selected Count Card - Premium Design */}
              <div className="relative overflow-hidden rounded-xl p-5 sm:p-6 md:p-5 lg:p-6 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
                <div className="absolute inset-0 bg-grid-small-white/5 opacity-30" />
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                    Selection Status
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl font-bold text-primary">
                      {selectedIds.length}
                    </p>
                    <span className="text-sm text-muted-foreground font-medium">
                      items selected
                    </span>
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
                <CustomButton
                  variant="outline"
                  onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
                  disabled={isSubmitting}
                  className="flex-1 h-10 sm:h-11 md:h-10 lg:h-11 text-xs sm:text-sm md:text-xs lg:text-sm font-semibold rounded-lg border-2 hover:bg-muted/50 transition-all duration-200"
                >
                  Cancel
                </CustomButton>
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
    </div>
  );
}

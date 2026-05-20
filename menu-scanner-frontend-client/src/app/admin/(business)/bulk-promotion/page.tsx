"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/utils/debounce/debounce";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Search, X } from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "@/store";
import { useProductState } from "@/features/business/store/state/product-state";
import {
  fetchAllProductAdminService,
  createBulkPromotionsService,
  resetAllPromotionsService,
  resetProductPromotionService,
  resetSelectedPromotionsService,
} from "@/features/business/store/thunks/product-thunks";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import {
  setPageNo,
  resetProductPromotionOptimistic,
} from "@/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import {
  bulkPromotionSchema,
  BulkPromotionFormData,
} from "@/features/business/store/models/schema/bulk-promotion-schema";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import {
  PROMOTION_TYPES,
  PROMOTION_DEFAULT_DURATION_DAYS,
} from "@/constants/form-options";
import { AppDefault } from "@/constants/app-resource/default/default";
import { bulkPromotionTableColumns } from "@/features/business/table/bulk-promotion-table";
import {
  PRODUCT_SIZE_FILTER,
} from "@/constants/status/filter-status";

const PROMOTION_FILTER_OPTIONS = [
  { value: "ALL", label: "All Products" },
  { value: "HAS_PROMOTION", label: "Has Promotion" },
  { value: "NO_PROMOTION", label: "No Promotion" },
];
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { ProductStatus } from "@/constants/status/status";
import { selectProductStatus } from "@/features/business/store/slice/product-slice";
import {
  setSelectedProducts,
  toggleSelectedProduct,
  clearSelectedProducts,
} from "@/features/business/store/slice/bulk-promotion-slice";
import {
  createBulkPromotionsOptimistic,
  resetSelectedPromotionsOptimistic,
} from "@/features/business/store/slice/product-slice";
import { selectSelectedProductIds } from "@/features/business/store/selectors/bulk-promotion-selector";
import { useBulkPromotionStorageSync } from "@/hooks/useBulkPromotionStorageSync";
import { useBulkPromotionSizesStorageSync } from "@/hooks/useBulkPromotionSizesStorageSync";
import {
  toggleSizeForProduct,
  clearAllSizeSelections,
  selectAllSizesForProduct,
  clearSizesForProduct,
} from "@/features/business/store/slice/promotion-size-selection-slice";
import { selectPromotionSizeSelections } from "@/features/business/store/selectors/promotion-size-selection-selector";

export default function BulkPromotionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const selectedProductIdsFromRedux = useAppSelector(selectSelectedProductIds);
  const selectedSizesFromRedux = useAppSelector(selectPromotionSizeSelections);

  const selectedProductIds = useMemo(() => {
    return new Map(selectedProductIdsFromRedux.map((id) => [id, true]));
  }, [selectedProductIdsFromRedux]);

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasPromotionFilter, setHasPromotionFilter] = useState<string>("ALL");
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    productId: "",
  });

  const [resetPromotionState, setResetPromotionState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  const [showClearSelectedModal, setShowClearSelectedModal] = useState(false);
  const [isClearingSelected, setIsClearingSelected] = useState(false);

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

  const { clearSelections } = useBulkPromotionStorageSync({
    storageKey: "bulk-promotion:selected-products",
    debounceMs: 1000,
    enabled: true,
  });

  const { clearSelections: clearSizeSelections } =
    useBulkPromotionSizesStorageSync({
      storageKey: "bulk-promotion:selected-sizes",
      debounceMs: 1000,
      enabled: true,
    });

  useEffect(() => {
    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: 1,
        pageSize: globalPageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
      }),
    );
  }, [
    dispatch,
    globalPageSize,
    filters.status,
    selectedBrand,
    selectedCategories,
    debouncedSearchQuery,
    hasPromotionFilter,
  ]);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      const isCurrentlySelected = selectedProductIds.has(productId);

      const product = productContent.find((p) => p.id === productId);

      dispatch(toggleSelectedProduct(productId));

      if (
        !isCurrentlySelected &&
        product &&
        product.hasSizes &&
        product.sizes
      ) {

        const sizeIds = product.sizes.map((s) => s.id);
        dispatch(selectAllSizesForProduct({ productId, sizeIds }));
      } else if (isCurrentlySelected) {

        dispatch(clearSizesForProduct(productId));
      }
    },
    [dispatch, selectedProductIds, productContent],
  );

  const handleSizeToggle = useCallback(
    (productId: string, sizeId: string) => {

      const currentSizesForProduct = selectedSizes.get(productId);
      const sizeIsCurrentlySelected =
        currentSizesForProduct && currentSizesForProduct.has(sizeId);

      const isProductSelected = selectedProductIds.has(productId);

      if (!sizeIsCurrentlySelected) {

        if (!isProductSelected) {
          dispatch(toggleSelectedProduct(productId));
        }
      } else {

        const remainingSizes = currentSizesForProduct
          ? new Set(
              Array.from(currentSizesForProduct).filter((s) => s !== sizeId),
            )
          : new Set();

        if (remainingSizes.size === 0 && isProductSelected) {
          dispatch(toggleSelectedProduct(productId));
        }
      }

      dispatch(toggleSizeForProduct({ productId, sizeId }));
    },
    [dispatch, selectedProductIds, selectedSizes],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && productContent.length > 0) {
        const currentPageIds = productContent.map((p) => p.id);
        const combined = new Set([
          ...selectedProductIdsFromRedux,
          ...currentPageIds,
        ]);
        dispatch(setSelectedProducts(Array.from(combined)));

        productContent.forEach((product) => {
          if (
            !selectedProductIds.has(product.id) &&
            product.hasSizes &&
            product.sizes
          ) {
            const sizeIds = product.sizes.map((s) => s.id);
            dispatch(
              selectAllSizesForProduct({ productId: product.id, sizeIds }),
            );
          }
        });
      } else {
        const pageIdsSet = new Set(productContent.map((p) => p.id));
        const filtered = selectedProductIdsFromRedux.filter(
          (id) => !pageIdsSet.has(id),
        );
        dispatch(setSelectedProducts(filtered));

        productContent.forEach((product) => {
          if (pageIdsSet.has(product.id)) {
            dispatch(clearSizesForProduct(product.id));
          }
        });
      }
    },
    [selectedProductIdsFromRedux, selectedProductIds, productContent, dispatch],
  );

  const allSelected =
    productContent.length > 0 &&
    productContent.every((p) => selectedProductIds.has(p.id));

  const someSelected =
    productContent.some((p) => selectedProductIds.has(p.id)) && !allSelected;

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

  const handlePromotionFilterChange = (value: string) => {
    setHasPromotionFilter(value);
    dispatch(setPageNo(1));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    dispatch(setPageNo(1));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(setPageNo(1));
  };

  const handleClearAllSelections = () => {
    dispatch(clearSelectedProducts());
    dispatch(clearAllSizeSelections());
    clearSelections();
    clearSizeSelections();
    showToast.success(Messages.promotions.allSelectionsCleared);
  };

  const selectedIds = Array.from(selectedProductIds.keys());

  const handleViewDetails = useCallback(
    (product: ProductDetailResponseModel) => {
      setDetailModalState({
        isOpen: true,
        productId: product.id || "",
      });
    },
    [],
  );

  const handleEditProduct = useCallback(
    (product: ProductDetailResponseModel) => {

    },
    [],
  );

  const handleResetPromotion = useCallback(
    (product: ProductDetailResponseModel) => {
      setResetPromotionState({
        isOpen: true,
        product: product,
      });
    },
    [],
  );

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      productId: "",
    });
  };

  const closeResetPromotionModal = () => {
    setResetPromotionState({
      isOpen: false,
      product: null,
    });
  };

  const handleConfirmResetPromotion = async () => {
    if (!resetPromotionState.product?.id) return;

    dispatch(resetProductPromotionOptimistic(resetPromotionState.product.id));

    closeResetPromotionModal();

    dispatch(resetProductPromotionService(resetPromotionState.product.id))
      .then(() => {
        showToast.success(
          `Promotion reset for product "${resetPromotionState.product?.name ?? ""}"`,
        );
      })
      .catch((error: unknown) => {
        showToast.error((error as { message?: string })?.message || Messages.promotions.resetFailed);
      });
  };

  useEffect(() => {
    form.setValue("productIds", selectedIds);
  }, [selectedIds, form]);

  const promotionType = form.watch("promotionType");
  const promotionValue = form.watch("promotionValue");

  const discountDisplay = useMemo(() => {
    if (!promotionType || !promotionValue) return null;
    return promotionType === "PERCENTAGE"
      ? `${promotionValue}%`
      : `$${promotionValue}`;
  }, [promotionType, promotionValue]);

  const hasValidPromotionType = !!promotionType;
  const hasValidPromotionValue = promotionValue && promotionValue > 0;
  const hasValidDates =
    form.watch("promotionFromDate") &&
    form.watch("promotionToDate") &&
    new Date(form.watch("promotionFromDate")) <
      new Date(form.watch("promotionToDate"));
  const hasSelectedProducts = selectedIds.length > 0;

  const isFormValid =
    hasValidPromotionType &&
    hasValidPromotionValue &&
    hasValidDates &&
    hasSelectedProducts;

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
        onResetPromotion: handleResetPromotion,
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
      handleResetPromotion,
    ],
  );

  const handlePageChange = (page: number) => {
    dispatch(setPageNo(page));
    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: page,
        pageSize: pageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
      }),
    );
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    dispatch(setPageNo(1));
    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: 1,
        pageSize: newPageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
      }),
    );
  };

  const onSubmit = async (data: BulkPromotionFormData) => {
    if (selectedIds.length === 0) {
      showToast.error(Messages.product.selectAtLeastOne);
      return;
    }

    setIsSubmitting(true);
    try {

      const productSizeMapping: Record<string, string[]> = {};
      selectedIds.forEach((productId) => {
        const sizeSet = selectedSizes.get(productId);
        if (sizeSet && sizeSet.size > 0) {
          productSizeMapping[productId] = Array.from(sizeSet);
        }
      });

            dispatch(
        createBulkPromotionsOptimistic({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      );

            const result = await dispatch(
        createBulkPromotionsService({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      ).unwrap();

      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );

      dispatch(clearSelectedProducts());
      dispatch(clearAllSizeSelections());
      clearSelections();

      form.reset({
        ...form.getValues(),
        productIds: [],
      });
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

  const handleApplyClick = async () => {

    const isValidForm = await form.trigger();

    if (!isValidForm) {
      return;
    }

    await form.handleSubmit(onSubmit)();
  };

  const handleResetAllPromotions = async () => {
    try {
      setIsResetting(true);
      await dispatch(resetAllPromotionsService()).unwrap();
      showToast.success(Messages.promotions.allResetFull);
      setShowResetModal(false);

      dispatch(clearAllSizeSelections());

      dispatch(
        fetchAllProductAdminService({
          search: debouncedSearchQuery,
          pageNo: filters.pageNo,
          pageSize: pageSize,
          statuses:
            filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
          brandId: selectedBrand?.id,
          categoryId: selectedCategories?.id,
          hasPromotion:
            hasPromotionFilter === "HAS_PROMOTION"
              ? true
              : hasPromotionFilter === "NO_PROMOTION"
                ? false
                : undefined,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset promotions";
      showToast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearSelectedPromotionsClick = () => {
    if (selectedIds.length === 0) {
      showToast.error(Messages.product.selectAtLeastOne);
      return;
    }
    setShowClearSelectedModal(true);
  };

  const handleConfirmClearSelected = async () => {
    setIsClearingSelected(true);
    try {

      const productSizeMapping: Record<string, string[]> = {};
      selectedIds.forEach((productId) => {
        const sizeSet = selectedSizes.get(productId);
        if (sizeSet && sizeSet.size > 0) {
          productSizeMapping[productId] = Array.from(sizeSet);
        }
      });

            dispatch(
        resetSelectedPromotionsOptimistic({
          productIds: selectedIds,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      );

      showToast.success(Messages.promotions.clearingBackground);

            await dispatch(
        resetSelectedPromotionsService({
          productIds: selectedIds,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      ).unwrap();

      showToast.success(Messages.promotions.cleared);

      dispatch(clearSelectedProducts());
      dispatch(clearAllSizeSelections());
      clearSelections();
      setShowClearSelectedModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear promotions";
      showToast.error(String(errorMessage));
    } finally {
      setIsClearingSelected(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background scroll-smooth">
      {}
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelectedPromotionsClick}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="gap-2"
            title="Clear promotion for selected products and sizes"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Promotion Selected</span>
          </Button>

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
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-no-progress="true"
        className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0"
      >
        {}
        <div className="flex-1 flex flex-col gap-4 px-2 sm:px-4 py-4 overflow-y-auto min-h-0 lg:border-r lg:border-border scroll-smooth">
          {}
          <div className="rounded-lg border border-border/60 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 transition-all duration-200 overflow-hidden">
            {}
            <div className="px-4 py-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CustomCheckbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
                    size="lg"
                    variant="default"
                    ariaLabel="Select all products on this page"
                    className="flex-shrink-0"
                  />

                  {}
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
                </div>

                {}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  {}
                  <div className="relative flex-1 sm:flex-none sm:w-auto sm:min-w-[300px] sm:max-w-[370px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                        title="Clear search"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  {}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSelections}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-destructive border border-destructive/40 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-150 flex-shrink-0"
                      title="Clear all selections (stored in browser)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {}
              <div className="min-w-0">
                <ComboboxSelectCategories
                  dataSelect={selectedCategories}
                  onChangeSelected={handleCategoriesChange}
                  placeholder="All Categories"
                  showAllOption={true}
                />
              </div>

              {}
              <div className="min-w-0">
                <ComboboxSelectBrand
                  dataSelect={selectedBrand}
                  onChangeSelected={handleBrandChange}
                  placeholder="All Brand"
                  showAllOption={true}
                />
              </div>

              {}
              <div className="min-w-0">
                <CustomSelect
                  options={PROMOTION_FILTER_OPTIONS}
                  value={hasPromotionFilter}
                  placeholder="All Products"
                  onValueChange={handlePromotionFilterChange}
                  className="w-full"
                  label="Promotion Status"
                  size="md"
                />
              </div>
            </div>
          </div>

          {}
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

        {}
        <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden scroll-smooth bg-background">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 sm:px-5 md:px-4 lg:px-5 py-6 sm:py-8 md:py-6 lg:py-8 space-y-5 sm:space-y-6 md:space-y-5 lg:space-y-6">
              {}
              <div className="space-y-2 border-b border-border pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Promotion Setup
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Configure discount details for selected products
                </p>
              </div>

              {}
              <div className="rounded-lg p-5 bg-gradient-to-r from-primary/15 to-green-500/15 border border-primary/25 shadow-sm">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                    Selection Status
                  </p>

                  {}
                  <div className="flex items-center gap-6 sm:gap-8">
                    {}
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl sm:text-6xl font-black text-primary">
                        {selectedIds.length}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground/60">
                        {selectedIds.length === 1 ? "Product" : "Products"}
                      </p>
                    </div>

                    {}
                    <div className="h-12 w-px bg-primary/20" />

                    {}
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl sm:text-4xl font-black text-green-600">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0,
                        )}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground/60">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0,
                        ) === 1
                          ? "Size"
                          : "Sizes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-4">
                {}
                <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Discount Settings
                  </h3>
                  <div className="space-y-3">
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
                      <p className="text-xs text-destructive font-medium">
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

                {}
                <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    Duration
                  </h3>
                  <div className="space-y-3">
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

              {}
              <div className="border-t border-border pt-5">
                <div className="flex gap-3 sm:gap-4 md:gap-3 lg:gap-4">
                  <CancelButton
                    onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
                    disabled={isSubmitting}
                    variant="outline"
                    className="flex-1 h-10 sm:h-11 md:h-10 lg:h-11 text-xs sm:text-sm md:text-xs lg:text-sm font-semibold rounded-lg border border-border hover:bg-muted/50 transition-colors"
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
                    className="flex-1 h-10 sm:h-11 md:h-10 lg:h-11 text-xs sm:text-sm md:text-xs lg:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <ConfirmationModal
        isOpen={resetPromotionState.isOpen}
        onClose={closeResetPromotionModal}
        onConfirm={handleConfirmResetPromotion}
        title="Reset Promotion"
        description="Clear all promotional discounts and restore product to regular pricing"
        itemName={resetPromotionState.product?.name || ""}
        actionLabel="Reset Promotion"
        actionVariant="secondary"
        headerBgColor="bg-yellow-50"
        buttonColor="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
        isDangerous={false}
      />

      {}
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

      {}
      <ConfirmationModal
        isOpen={showClearSelectedModal}
        onClose={() => setShowClearSelectedModal(false)}
        onConfirm={handleConfirmClearSelected}
        title="Clear Promotions for Selected Items"
        description={`You are about to clear promotions for ${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} ${
          Array.from(selectedSizes.values()).some((s) => s.size > 0)
            ? `with ${Array.from(selectedSizes.values()).reduce((sum, s) => sum + s.size, 0)} size${
                Array.from(selectedSizes.values()).reduce(
                  (sum, s) => sum + s.size,
                  0,
                ) !== 1
                  ? "s"
                  : ""
              }`
            : ""
        }. This will remove all promotion data from the selected products${
          Array.from(selectedSizes.values()).some((s) => s.size > 0)
            ? " and sizes"
            : ""
        }.`}
        actionLabel="Clear Promotion"
        actionVariant="default"
        headerBgColor="bg-yellow-50"
        isDangerous={false}
        isSubmitting={isClearingSelected}
      />
    </div>
  );
}

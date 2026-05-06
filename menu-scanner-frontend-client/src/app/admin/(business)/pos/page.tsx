"use client";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  ShoppingCart,
  X,
  ReceiptText,
  CreditCard,
  Package,
  ChevronRight,
  Loader2,
  ChevronsUpDown,
  Check,
  Truck,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";
import { POSCartItem } from "@/components/pos-custom/pos-cart-item";
import { POSMoreOptionsModal } from "@/components/pos-custom/pos-more-options-modal";
import { POSOrderSuccessModal } from "@/components/pos-custom/pos-order-success-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { POSProductCard } from "@/components/shared/card/pos-product-card";
import { SizePickerModal } from "@/components/shared/modal/size-picker-modal";
import { POSEditCartItemModal } from "@/components/pos-custom/pos-edit-cart-item-modal";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useAppDispatch } from "@/redux/store";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { cn } from "@/lib/utils";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useFilterURLSync } from "@/hooks/useFilterURLSync";

// ─── Redux Imports ───
import { usePOSPageState } from "@/redux/features/business/store/state/pos-page-state";
import {
  setSelectedDeliveryOption,
  setSelectedPaymentOption,
  setProducts,
  appendProducts,
  setProductsLoading,
  setProductsError,
  setSearchTerm,
  setSelectedCategory,
  setSelectedSubcategory,
  setSelectedBrand,
  setCategories,
  setSubcategories,
    subcategories,
  setBrands,
  setCategoriesLoading,
  setSubcategoriesLoading,
    subcategoriesLoading,
  setBrandsLoading,
  setProductPage,
  setHasMoreProducts,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  setCartPricing,
  setShowCart,
  setCustomerNote,
  setIsSubmitting,
  setSizePickerProduct,
  setEditingCartItemId,
  storeProductCustomizations,
  clearProductCustomizations,
  setSuccessOrder,
  setShowOrderDetailsModal,
  setBrandOpen,
  setSubcategoryOpen,
  setPromotionFilter,
  setPromotionOpen,
} from "@/redux/features/business/store/slice/pos-page-slice";
import {
  fetchPOSPageCategoriesService,
  fetchPOSPageSubcategoriesService,
  fetchPOSPageBrandsService,
  fetchPOSPageProductsService,
  createPOSCheckoutOrderService,
} from "@/redux/features/business/store/thunks/pos-page-thunks";
import { AppDispatch, RootState } from "@/redux/store";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { useSelector } from "react-redux";


export default function PosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch() as AppDispatch;

  // ─── Business Settings from Redux (for tax percentage, colors, etc) ───
  const businessSettings = useSelector((state: RootState) => selectBusinessSettings(state));

  // ─── Redux State ───
  const {
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    productsError,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    categories,
    subcategories,
    brands,
    categoriesLoading,
    subcategoriesLoading,
    brandsLoading,
    productPage,
    hasMoreProducts,
    cartItems,
    cartPricing,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    lastSelectedCustomizations,
    successOrder,
    showOrderDetailsModal,
    brandOpen,
    subcategoryOpen,
    promotionFilter,
    promotionOpen,
  } = usePOSPageState();

  // ─── localStorage Sync with Redux (Cart) ───
  useLocalStorageSync({
    storageKey: "pos:cart",
    debounceMs: 1000,
    enabled: true,
  });

  // ─── URL Sync with Redux (Filters) ───
  useFilterURLSync({
    enabled: true,
    debounceMs: 800,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const posPageRef = useRef<HTMLDivElement>(null);

  // ─── Debounce search ───
  const debouncedSearch = useDebounce(searchTerm, 400);
  // ─── Edit Cart Item for Price/Promotion ───
  const [editingItemForPrice, setEditingItemForPrice] = useState<PosPageCartItem | null>(null);

  // ─── Order-Level Discount ───
  const [orderDiscount, setOrderDiscount] = useState<{
    type: "fixed" | "percentage";
    value: number;
    reason: string;
    // ✅ AUDIT TRAIL: Complete before/after snapshot
    beforeTotal: number;           // Order total BEFORE discount
    afterTotal: number;            // Order total AFTER discount
    discountAmount: number;        // Actual discount amount applied
    appliedAt: string;             // ISO timestamp of when applied
  } | null>(null);

  // Mobile responsive zoom
  useEffect(() => {
    const applyResponsiveZoom = () => {
      if (posPageRef.current) {
        if (window.innerWidth < 768) {
          posPageRef.current.style.zoom = "1";
        } else {
          posPageRef.current.style.zoom = "0.8";
        }
      }
    };
    applyResponsiveZoom();
    window.addEventListener("resize", applyResponsiveZoom);
    return () => window.removeEventListener("resize", applyResponsiveZoom);
  }, []);

  // ─── Initialize Categories, Brands, and Business Settings on Mount ───
  useEffect(() => {
    dispatch(fetchPOSPageCategoriesService());
    dispatch(fetchPOSPageSubcategoriesService());
    dispatch(fetchPOSPageBrandsService());
    // Fetch business settings from Redux (includes tax percentage, colors, etc)
    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch]);

  // ─── Fetch Products when filters/search change ───
  useEffect(() => {
    dispatch(setProductPage(1));
    dispatch(setProducts([]));
    dispatch(setProductsLoading(true));
    dispatch(
      fetchPOSPageProductsService({
        page: 1,
        search: debouncedSearch,
        categoryId: selectedCategory?.id,
        subcategoryId: selectedSubcategory?.id,
        brandId: selectedBrand?.id,
        hasPromotion: promotionFilter,
        reset: true,
      })
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, selectedSubcategory, promotionFilter, dispatch]);

  // Use constant skeleton count to avoid hydration mismatch
  const skeletonCount = 4;

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      const nextPage = productPage + 1;
      // IMPORTANT: Update productPage BEFORE fetching so reducer knows to append, not replace
      dispatch(setProductPage(nextPage));
      dispatch(
        fetchPOSPageProductsService({
          page: nextPage,
          search: debouncedSearch,
          subcategoryId: selectedSubcategory?.id,
          categoryId: selectedCategory?.id,
          brandId: selectedBrand?.id,
          hasPromotion: promotionFilter,
        })
      );
    }
  };

  // ─── Infinite Scroll ───
  const { observerTarget } = useInfiniteScroll({
    onLoadMore: loadMoreProducts,
    hasMore: hasMoreProducts,
    isLoading: productsLoading,
  });

  // ─── Track Scroll Position ───
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const viewport = productGridRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {
      // Show button if scrolled down more than 200px
      setShowScrollToTop(viewport.scrollTop > 200);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Category Scroll Handler ───
  const scrollCategories = useCallback((direction: "left" | "right") => {
    const viewport = categoryScrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;
    const scrollAmount = 250;
    viewport.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);


  // ─── Scroll Products to Top ───
  const scrollProductsToTop = useCallback(() => {
    const viewport = productGridRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;
    viewport.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  // ─── Configure Category Scroll Styling ───
  useEffect(() => {
    const categoryContainer = categoryScrollRef.current;
    if (!categoryContainer) return;
    const viewport = categoryContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;
    Object.assign(categoryContainer.style, {
      overflow: "hidden",
      height: "40px",
    });
    Object.assign(viewport.style, {
      overflowY: "hidden",
      overflowX: "auto",
      scrollBehavior: "smooth",
      height: "40px",
      minHeight: "40px",
      maxHeight: "40px",
    });
  }, []);

  // ─── Cart Logic ───
  const addToCart = useCallback(
    (product: ProductDetailResponseModel, size?: ProductSize, editingId?: string, quantity: number = 1, customizationIds?: string[]) => {
      // Generate unique cart ID including customizations
      const customizationKey = customizationIds && customizationIds.length > 0
        ? `-${customizationIds.sort().join("-")}`
        : "";
      
      const cartId = size
        ? `${product.id}-${size.id}${customizationKey}`
        : `${product.id}${customizationKey}`;
      const currentPrice = size
        ? size.price
        : parseFloat(String(product.displayOriginPrice || product.price || 0));
      let finalPrice = size
        ? size.finalPrice || size.price
        : product.displayPrice || parseFloat(String(product.price || 0));

      const customizations = customizationIds && customizationIds.length > 0
        ? customizationIds.map((customId) => {
            const custom = product.customizations?.find((c) => c.id === customId);
            return {
              productCustomizationId: customId,
              name: custom?.name || "",
              priceAdjustment: custom?.priceAdjustment || 0,
            };
          })
        : [];

      // Calculate total customization price adjustment
      const customizationTotal = customizations.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0);

      // Include customization prices in final price
      finalPrice = finalPrice + customizationTotal;

      const newItem: PosPageCartItem = {
        id: cartId,

        // If not editing and no customizations found, use last stored customizations for this product
        if (!editingCartItemId && initialCustomIds.length === 0 && sizePickerProduct) {
          const storedCustomIds = lastSelectedCustomizations?.[sizePickerProduct.id];
          if (storedCustomIds && storedCustomIds.length > 0) {
            initialCustomIds = storedCustomIds;
              productId: sizePickerProduct.id,
              storedCustomIds,
            });
          }
        }

        return (
          <SizePickerModal
            product={sizePickerProduct}
            open={!!sizePickerProduct}
            onOpenChange={(open) => {
              if (!open) {
                dispatch(setSizePickerProduct(null));
                dispatch(setEditingCartItemId(null));
              }
            }}
            onSizeSelect={(product, size, qty, customizationIds) => {
              addToCart(product, size, editingCartItemId || undefined, qty || 1, customizationIds);
              dispatch(setSizePickerProduct(null));
              dispatch(setEditingCartItemId(null));
            }}
            isEditing={!!editingCartItemId}
            editingId={editingCartItemId || undefined}
            initialQuantities={initialQties}
            initialCustomizations={initialCustomIds}
          />
        );
      })()}

      <POSOrderSuccessModal
        open={!!successOrder}
        onClose={() => dispatch(setSuccessOrder(null))}
        orderNumber={successOrder?.orderNumber || ""}
        totalAmount={successOrder?.total || 0}
      />


      {/* Edit Cart Item Modal for Price/Promotion */}
      <POSEditCartItemModal
        open={!!editingItemForPrice}
        onOpenChange={(open) => {
          if (!open) setEditingItemForPrice(null);
        }}
        item={
          editingItemForPrice ? {
            id: editingItemForPrice.id,
            productName: editingItemForPrice.productName,
            productImageUrl: editingItemForPrice.productImageUrl,
            sizeName: editingItemForPrice.sizeName,
            currentPrice: editingItemForPrice.currentPrice,
            quantity: editingItemForPrice.quantity,
          } : null
        }
        onSave={handleSaveItemChanges}
      />
      <POSMoreOptionsModal
        open={showOrderDetailsModal}
        onOpenChange={(open) => dispatch(setShowOrderDetailsModal(open))}
        customerNote={customerNote}
        onNoteChange={(note) => dispatch(setCustomerNote(note))}
        currentOrderTotal={cartSummary.finalTotal}
        onDiscountApply={handleDiscountApply}
      />
    </div>
  );
}

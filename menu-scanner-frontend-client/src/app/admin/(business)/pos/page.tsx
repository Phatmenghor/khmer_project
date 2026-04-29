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
import { useBusinessSettings } from "@/hooks/use-business-settings";

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
import { AppDispatch } from "@/redux/store";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";


export default function PosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch() as AppDispatch;

  // ─── Business Settings (for tax percentage) ───
  const { businessSettings, fetchBusinessSettings } = useBusinessSettings();

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
    // Fetch business settings to get tax percentage
    fetchBusinessSettings().catch((err) => {
      console.warn("Failed to fetch business settings:", err);
    });
  }, [dispatch, fetchBusinessSettings]);

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

  // Calculate skeleton count dynamically based on screen width (matches grid columns)
  const getSkeletonCount = useCallback(() => {
    if (typeof window === "undefined") return 6;
    const width = window.innerWidth;
    if (width < 640) return 2;      // sm: 2 cols
    if (width < 768) return 3;      // md: 3 cols
    if (width < 1024) return 4;     // lg: 4 cols
    if (width < 1280) return 5;     // xl: 5 cols
    return 6;                        // 2xl: 6 cols
  }, []);

  const skeletonCount = useMemo(() => getSkeletonCount(), [getSkeletonCount]);

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
      const cartId = size ? `${product.id}-${size.id}` : product.id;
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
              id: customId,
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
        productId: product.id,
        productName: product.name,
        productImageUrl: product.mainImageUrl || "",
        productSizeId: size?.id || null,
        sizeName: size?.name || null,
        quantity,
        sku: product.sku || "",
        barcode: product.barcode || "",
        customizations,
        currentPrice,
        finalPrice,
        totalPrice: finalPrice * quantity,
      };

      if (editingId) {
        const existingItem = cartItems.find((item) => item.id === editingId);
        if (existingItem) {
          dispatch(updateCartItem({
            ...newItem,
            quantity: existingItem.quantity,
            totalPrice: finalPrice * existingItem.quantity,
          }));
        }
      } else {
        const existing = cartItems.find((item) => item.id === cartId);
        if (existing) {
          const qty = existing.quantity + 1;
          dispatch(updateCartItem({
            ...newItem,
            quantity: qty,
            totalPrice: finalPrice * qty,
          }));
        } else {
          dispatch(addCartItem(newItem));
        }
      }

      // Store customizations for this product so they're available if modal opens again
      if (customizations.length > 0) {
        dispatch(storeProductCustomizations({
          productId: product.id,
          customizationIds: customizations.map(c => c.productCustomizationId),
        }));
      }

      if (!showCart && window.innerWidth < 1024) {
        dispatch(setShowCart(true));
      }
      dispatch(setEditingCartItemId(null));
    },
    [cartItems, showCart, dispatch]
  );

  const updateQuantity = useCallback(
    (cartId: string, delta: number) => {
      const item = cartItems.find((i) => i.id === cartId);
      if (!item) return;

      const newQuantity = Math.max(0, item.quantity + delta);
      if (newQuantity === 0) {
        dispatch(removeCartItem(cartId));
        dispatch(clearProductCustomizations(item.productId));
      } else {
        // Note: finalPrice already includes customization prices
        dispatch(updateCartItem({
          ...item,
          quantity: newQuantity,
          totalPrice: item.finalPrice * newQuantity,
        }));
      }
    },
    [cartItems, dispatch]
  );

  const removeItem = useCallback(
    (cartId: string) => {
      const item = cartItems.find((i) => i.id === cartId);
      if (item) {
        dispatch(removeCartItem(cartId));
        dispatch(clearProductCustomizations(item.productId));
      }
    },
    [cartItems, dispatch]
  );

  const clearCart = () => dispatch(clearCartItems());

  // ─── Cart Calculations with Tax ───
  const cartSummary = useMemo(() => {
    let totalItems = cartItems.length;
    let totalQuantity = 0;
    let subtotal = 0;
    let customizationTotal = 0;
    let discountAmount = 0;
    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      const itemSubtotal = item.finalPrice * item.quantity;
      subtotal += itemSubtotal;
      // Calculate customization total for each item
      if (item.customizations && item.customizations.length > 0) {
        const itemCustomizationTotal = item.customizations.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0);
        customizationTotal += itemCustomizationTotal * item.quantity;
      }
    });
    const deliveryFee = selectedDeliveryOption?.price || 0;
    // Calculate tax from business settings (taxPercentage is 0-100, convert to decimal)
    const taxPercentage = businessSettings?.taxPercentage || 0;
    const taxAmount = subtotal * (taxPercentage / 100);
    const finalTotal = Math.max(0, subtotal + deliveryFee + taxAmount);
    return {
      totalItems,
      totalQuantity,
      subtotal,
      customizationTotal,
      discountAmount,
      deliveryFee,
      taxAmount,
      taxPercentage,
      finalTotal,
    };
  }, [cartItems, selectedDeliveryOption, businessSettings?.taxPercentage]);

  // ─── Product Click Handler ───
  const handleProductClick = useCallback((product: ProductDetailResponseModel) => {
    if (product.hasSizes) {
      dispatch(setSizePickerProduct(product));
      return;
    }
    addToCart(product, undefined, undefined, 1);
  }, [dispatch, addToCart]);

  // ─── Get quantity in cart ───
  const getProductCartQuantity = useCallback(
    (productId: string) => {
      return cartItems
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [cartItems]
  );

  // ─── Handle Edit Cart Item for Price/Promotion ───
  const handleEditPriceItem = useCallback((item: PosPageCartItem) => {
    setEditingItemForPrice(item);
  }, []);

  // ─── Save Cart Item Price Changes ───
  const handleSaveItemChanges = useCallback((editData: any) => {
    if (!editingItemForPrice) return;

    const newPrice = parseFloat(editData.newPrice) || editingItemForPrice.currentPrice;
    const newQuantity = parseInt(editData.newQuantity) || editingItemForPrice.quantity;

    let finalPrice = newPrice;
    // Note: Promotional calculations removed as we simplified pricing model

    const updatedItem: PosPageCartItem = {
      ...editingItemForPrice,
      quantity: newQuantity,
      currentPrice: newPrice,
      finalPrice,
      totalPrice: finalPrice * newQuantity,
    };

    dispatch(updateCartItem(updatedItem));
    showToast.success("Item updated successfully");
  }, [dispatch, editingItemForPrice]);

  // ─── Handle Order-Level Discount ───
  const handleDiscountApply = (discount: {
    type: "fixed" | "percentage";
    value: number;
    reason: string;
    // ✅ AUDIT TRAIL: Complete before/after snapshot
    beforeTotal: number;
    afterTotal: number;
    discountAmount: number;
    appliedAt: string;
  }) => {
    setOrderDiscount(discount);
    showToast.success(`✅ Discount applied: Before: $${discount.beforeTotal.toFixed(2)} → After: $${discount.afterTotal.toFixed(2)} (Saved: $${discount.discountAmount.toFixed(2)})`);
  };

  // ─── Submit Order ───
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error("Please add items to cart");
      return;
    }

    if (!selectedDeliveryOption) {
      showToast.error("Please select a delivery option");
      return;
    }

    // Build POSCheckoutRequest payload with complete audit trail
    // Items: before/after snapshots + metadata for each change
    // Order: before/after pricing + discount metadata
    const payload = {
      businessId: products[0]?.businessId || AppDefault.BUSINESS_ID,

      // Address - use ID for backend to fetch full details
      addressId: "",  // TODO: Implement address selection modal for POS

      // Full delivery option details (same as public checkout)
      deliveryOption: {
        name: selectedDeliveryOption.name || "Delivery",
        description: selectedDeliveryOption.description || "POS Order",
        imageUrl: selectedDeliveryOption.imageUrl || "",
        price: selectedDeliveryOption.price || 0,
      },

      // Cart — items with full customization details
      cart: {
        businessId: products[0]?.businessId || AppDefault.BUSINESS_ID,
        businessName: products[0]?.businessName || "",
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          productSizeId: item.productSizeId || null,
          sizeName: item.sizeName || null,
          quantity: item.quantity,
          // Send full customization details (ID, name, price adjustment)
          customizations: item.customizations || [],
          customizationIds: item.customizations?.map((c) => c.id) || [],
          finalPrice: item.finalPrice,
          totalPrice: item.totalPrice,
          // SKU and barcode for store tracking
          sku: item.sku || "",
          barcode: item.barcode || "",
        })),
        totalItems: cartSummary.totalItems,
        totalQuantity: cartSummary.totalQuantity,
        subtotal: cartSummary.subtotal,
        finalTotal: cartSummary.finalTotal,
      },

      // Pricing with tax calculation
      pricing: {
        deliveryFee: selectedDeliveryOption?.price || 0,
        subtotal: cartSummary.subtotal,
        taxPercentage: cartSummary.taxPercentage,
        taxAmount: cartSummary.taxAmount,
        finalTotal: cartSummary.finalTotal,
      },

      // Payment info
      payment: {
        paymentMethod: "CASH",
        paymentStatus: "PAID",
      },

      // Notes
      customerNote: customerNote || "",
      businessNote: "Created via POS System",
      orderStatus: OrderStatus.PENDING,
    };

    dispatch(setIsSubmitting(true));
    try {
      const result = await dispatch(createPOSCheckoutOrderService(payload) as any);
      if (result.payload) {
        const order = result.payload;
        dispatch(setSuccessOrder({ orderNumber: order.orderNumber, total: order.totalAmount }));
        dispatch(clearCartItems());
        dispatch(setCartPricing(null));
        dispatch(setCustomerNote(""));
        setOrderDiscount(null);
        showToast.success("✅ POS Order created successfully!");
      }
    } catch (error: any) {
      showToast.error(error?.message || "❌ Failed to create POS order");
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };

  // ─── Render ───
  return (
    <div
      ref={posPageRef}
      className="flex flex-col h-full w-full max-md:p-1"
      style={{ zoom: "0.8" }}
    >
      {/* ─── Main Content ─── */}
      <div className="flex max-md:flex-col md:flex-row flex-1 overflow-hidden">
        {/* ─── Product Section ─── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Search & Brand Filter Bar */}
          <div className="flex flex-wrap items-end gap-2 max-md:gap-1 max-md:p-2 md:p-3 border-b bg-muted/20 shrink-0">
            <div className="relative flex-1 max-md:min-w-[140px] md:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 max-md:h-3.5 max-md:w-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search..."
                className="max-md:pl-8 max-md:h-8 max-md:text-xs pl-10 h-9"
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
            {/* Brand Filter */}
            <Popover open={brandOpen} onOpenChange={(open) => dispatch(setBrandOpen(open))}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={brandOpen}
                  className="max-md:w-[120px] md:w-[200px] justify-between h-9 text-sm"
                >
                  {selectedBrand?.name || "All Brands"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search brands..." />
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          dispatch(setSelectedBrand(null));
                          dispatch(setBrandOpen(false));
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedBrand === null ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Brands
                      </CommandItem>
                      {brands.map((brand) => (
                        <CommandItem
                          key={brand.id}
                          value={brand.id}
                          onSelect={() => {
                            dispatch(setSelectedBrand(brand));
                            dispatch(setBrandOpen(false));
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {brand.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Subcategory Filter */}
            <Popover open={subcategoryOpen} onOpenChange={(open) => dispatch(setSubcategoryOpen(open))}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subcategoryOpen}
                  className="max-md:w-[140px] md:w-[200px] justify-between h-9 text-sm"
                >
                  {selectedSubcategory?.name || "All Subcategories"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search subcategories..." />
                  <CommandEmpty>No subcategory found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          dispatch(setSelectedSubcategory(null));
                          dispatch(setSubcategoryOpen(false));
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSubcategory === null ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Subcategories
                      </CommandItem>
                      {subcategories.map((subcategory) => (
                        <CommandItem
                          key={subcategory.id}
                          value={subcategory.id}
                          onSelect={() => {
                            dispatch(setSelectedSubcategory(subcategory));
                            dispatch(setSubcategoryOpen(false));
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSubcategory?.id === subcategory.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {subcategory.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Promotion Filter */}
            <Popover open={promotionOpen} onOpenChange={(open) => dispatch(setPromotionOpen(open))}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={promotionOpen}
                  className="max-md:w-[100px] md:w-[130px] justify-between h-9 text-sm max-md:text-xs"
                >
                  {promotionFilter === undefined ? "All Products" : "Promotion"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[130px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          dispatch(setPromotionFilter(undefined));
                          dispatch(setPromotionOpen(false));
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            promotionFilter === undefined ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Products
                      </CommandItem>
                      <CommandItem
                        value="promotion"
                        onSelect={() => {
                          dispatch(setPromotionFilter(true));
                          dispatch(setPromotionOpen(false));
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            promotionFilter === true ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Promotion
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Clear All Filter Button */}
            {(searchTerm || selectedCategory || selectedBrand || selectedSubcategory || promotionFilter !== undefined) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  dispatch(setSearchTerm(""));
                  dispatch(setSelectedCategory(null));
                  dispatch(setSelectedBrand(null));
                  dispatch(setSelectedSubcategory(null));
                  dispatch(setPromotionFilter(undefined));
                }}
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="shrink-0 border-b bg-muted/10 flex items-center gap-2 px-2 h-10 mt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 hover:bg-primary/10"
              onClick={() => scrollCategories("left")}
              title="Scroll left"
            >
              <ChevronRight className="h-5 w-5 transform rotate-180" />
            </Button>
            <ScrollArea className="flex-1 h-10 overflow-hidden" ref={categoryScrollRef}>
              <div className="flex gap-3 px-2 h-10 items-center">
                <button
                  onClick={() => dispatch(setSelectedCategory(null))}
                  className={cn(
                    "shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer h-10 flex items-center",
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-border text-foreground hover:bg-muted"
                  )}
                >
                  All
                </button>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 px-3 h-10">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => dispatch(setSelectedCategory(category))}
                      className={cn(
                        "shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer h-10 flex items-center",
                        selectedCategory?.id === category.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border border-border text-foreground hover:bg-muted"
                      )}
                      title={category.name}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 hover:bg-primary/10"
              onClick={() => scrollCategories("right")}
              title="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 w-full overflow-hidden" ref={productGridRef}>
            <div
              className="w-full max-md:p-2 md:p-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {productsLoading && products.length === 0 &&
                Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-initial-${i}`} />
                ))}
              {products.map((product) => (
                <POSProductCard
                  key={product.id}
                  product={product}
                  onAddClick={handleProductClick}
                  onQuantityChange={updateQuantity}
                />
              ))}
              {/* ALWAYS show skeleton loaders when hasMoreProducts is true - matches home page pattern */}
              {hasMoreProducts &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-pagination-${i}`} />
                ))}
              {/* ALWAYS show loading message when hasMoreProducts is true */}
              {hasMoreProducts && (
                <div className="col-span-full flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Loading more products...
                  </p>
                </div>
              )}
            </div>
            {hasMoreProducts && !productsLoading && (
              <div ref={observerTarget} className="h-1" />
            )}
            {!productsLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                {productsError ? (
                  <>
                    <Package className="w-16 h-16 mb-4 opacity-20 text-destructive" />
                    <p className="text-sm font-medium text-destructive">Failed to load products</p>
                    <p className="text-xs mt-1">{productsError}</p>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
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
                      }}
                    >
                      Retry
                    </CustomButton>
                  </>
                ) : (
                  <>
                    <Package className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
          
          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 h-10 w-10 rounded-full border-2 border-primary shadow-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200 animate-fade-in"
              onClick={scrollProductsToTop}
              title="Scroll to top"
            >
              <ChevronRight className="h-5 w-5 transform -rotate-90" />
            </Button>
          )}
        </div>

        {/* ─── Cart Panel ─── */}
        <div
          className={`${
            showCart ? "flex" : "hidden"
          } md:flex w-full max-md:border-t md:border-l md:w-[380px] xl:w-[420px] max-md:h-1/3 md:h-full flex-col bg-card shrink-0 overflow-hidden ${
            showCart && "fixed inset-0 z-50 md:relative md:z-auto max-md:bottom-0 max-md:w-full max-md:h-auto"
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div>
              <h2 className="font-semibold text-sm">Current Order</h2>
              {cartItems.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} • {cartSummary.totalQuantity} total
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 rounded-lg gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => dispatch(setShowCart(false))}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground flex-1">
                <ShoppingCart className="w-20 h-20 mb-4 opacity-20" />
                <p className="text-base font-semibold">No items yet</p>
                <p className="text-sm mt-2 text-center px-4 leading-relaxed">
                  Click on products to add them to the order
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-3 p-3">
                  {cartItems.map((item) => (
                    <POSCartItem
                      key={item.id}
                      id={item.id}
                      productName={item.productName}
                      productImageUrl={item.productImageUrl}
                      sizeName={item.sizeName}
                      currentPrice={item.currentPrice}
                      finalPrice={item.finalPrice}
                      quantity={item.quantity}
                      onQuantityChange={(delta) => updateQuantity(item.id, delta)}
                      onRemove={() => removeItem(item.id)}
                      onEdit={() => handleEditPriceItem(item)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Checkout Section */}
          <div className="border-t bg-card shrink-0">
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 min-w-0">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Truck className="w-3 h-3 shrink-0" />
                    Delivery
                  </Label>
                  <ComboboxSelectDelivery
                    dataSelect={selectedDeliveryOption as any}
                    onChangeSelected={(item) => dispatch(setSelectedDeliveryOption(item as any))}
                    placeholder="Delivery..."
                    label=""
                    businessId={AppDefault.BUSINESS_ID}
                    statuses={["ACTIVE"]}
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <CreditCard className="w-3 h-3 shrink-0" />
                    Payment
                  </Label>
                  <ComboboxSelectPayment
                    dataSelect={selectedPaymentOption as any}
                    onChangeSelected={(item) => dispatch(setSelectedPaymentOption(item as any))}
                    placeholder="Payment..."
                    label=""
                    businessId={AppDefault.BUSINESS_ID}
                    statuses={["ACTIVE"]}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Subtotal ({cartSummary.totalQuantity} {cartSummary.totalQuantity === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium">{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                {cartSummary.customizationTotal > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 font-medium">Add-ons</span>
                    <span className="text-green-600 font-semibold">+{formatCurrency(cartSummary.customizationTotal)}</span>
                  </div>
                )}
                {cartSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500 font-medium">Discount</span>
                    <span className="text-red-500 font-semibold">-{formatCurrency(cartSummary.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-primary">
                    {cartSummary.deliveryFee > 0 ? `+${formatCurrency(cartSummary.deliveryFee)}` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Tax<span className="text-[9px] bg-muted px-1 py-0.5 rounded font-medium">0%</span>
                  </span>
                  <span className="font-medium">{formatCurrency(cartSummary.taxAmount)}</span>
                </div>
                {orderDiscount && (
                  <>
                    <Separator />
                    <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      Order-Level Discount
                    </div>
                    <div className="flex justify-between text-xs bg-orange-50 -mx-3 -mb-1.5 px-3 py-2 rounded-b-lg">
                      <span className="text-orange-700 font-medium">
                        {orderDiscount.type === "fixed" ? `$${orderDiscount.value.toFixed(2)}` : `${orderDiscount.value}%`} off
                      </span>
                      <span className="text-orange-700 font-semibold">
                        Save: {formatCurrency(orderDiscount.discountAmount)}
                      </span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-base font-bold text-primary">
                    {(() => {
                      let total = cartSummary.finalTotal;
                      if (orderDiscount) {
                        if (orderDiscount.type === "fixed") {
                          total = Math.max(0, total - orderDiscount.value);
                        } else if (orderDiscount.type === "percentage") {
                          total = total * (1 - (orderDiscount.value / 100));
                        }
                      }
                      return formatCurrency(total);
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              <div className="rounded-xl overflow-hidden border border-border shadow-sm flex items-stretch">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-auto px-3 gap-2 text-xs font-semibold border-r border-border hover:bg-muted/50",
                    orderDiscount && "text-green-600 hover:bg-green-50"
                  )}
                  onClick={() => dispatch(setShowOrderDetailsModal(true))}
                >
                  <Tag className="w-3.5 h-3.5" />
                  More
                  {orderDiscount && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      {orderDiscount.type === "fixed" 
                        ? `-$${orderDiscount.value.toFixed(2)}` 
                        : `-${orderDiscount.value}%`}
                    </span>
                  )}
                </Button>
                <div className="flex-1 px-3 py-2.5 bg-muted/30 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {cartSummary.totalQuantity} {cartSummary.totalQuantity === 1 ? "item" : "items"}
                      {selectedPaymentOption && (
                        <span className="ml-1 text-muted-foreground/70">
                          · {selectedPaymentOption.name || selectedPaymentOption.paymentOptionType}
                        </span>
                      )}
                    </p>
                    <p className="text-lg font-bold text-primary leading-tight">{formatCurrency(cartSummary.finalTotal)}</p>
                  </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={cartItems.length === 0 || isSubmitting}
                  className={cn(
                    "flex flex-col items-center justify-center px-5 gap-0.5 transition-all shrink-0",
                    cartItems.length === 0 || isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ReceiptText className="w-5 h-5" />
                  )}
                  <span className="text-[11px] font-semibold whitespace-nowrap">
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {/* Calculate initial quantities and customizations when opening modal */}
      {(() => {
        const initialQties = new Map<string, number>();
        let initialCustomIds: string[] = [];
        if (sizePickerProduct && cartItems.length > 0) {
          // Get all cart items for this product and build a map of size -> quantity
          cartItems
            .filter((item) => item.productId === sizePickerProduct.id)
            .forEach((item) => {
              const sizeId = item.productSizeId || "no_size";
              initialQties.set(sizeId, item.quantity);
              // If this is the item being edited, get its customizations
              if (editingCartItemId && item.id === editingCartItemId && item.customizations) {
                initialCustomIds = item.customizations.map((c) => c.productCustomizationId);
              }
            });
        }

        // If not editing and no customizations found, use last stored customizations for this product
        if (!editingCartItemId && initialCustomIds.length === 0 && sizePickerProduct) {
          const storedCustomIds = lastSelectedCustomizations?.[sizePickerProduct.id];
          if (storedCustomIds && storedCustomIds.length > 0) {
            initialCustomIds = storedCustomIds;
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

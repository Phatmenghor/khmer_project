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
import { usePOSStatePersistence } from "@/utils/persistence/use-pos-state-persistence";

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
  setSelectedBrand,
  setCategories,
  setBrands,
  setCategoriesLoading,
  setBrandsLoading,
  setProductPage,
  setHasMoreProducts,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  setShowCart,
  setCustomerNote,
  setIsSubmitting,
  setSizePickerProduct,
  setEditingCartItemId,
  setSuccessOrder,
  setShowOrderDetailsModal,
  setBrandOpen,
  setPromotionFilter,
  setPromotionOpen,
} from "@/redux/features/business/store/slice/pos-page-slice";
import {
  fetchPOSPageCategoriesService,
  fetchPOSPageBrandsService,
  fetchPOSPageProductsService,
  createPOSPageOrderService,
} from "@/redux/features/business/store/thunks/pos-page-thunks";
import { AppDispatch } from "@/redux/store";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";

interface PosCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  currentPrice: number;
  finalPrice: number;
  hasActivePromotion: boolean;
  quantity: number;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
}

export default function PosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch() as AppDispatch;

  // ─── Redux State ───
  const {
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    productsError,
    searchTerm,
    selectedCategory,
    selectedBrand,
    categories,
    brands,
    categoriesLoading,
    brandsLoading,
    productPage,
    hasMoreProducts,
    cartItems,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    successOrder,
    showOrderDetailsModal,
    brandOpen,
    promotionFilter,
    promotionOpen,
  } = usePOSPageState();

  // ─── Persistence Layer ───
  usePOSStatePersistence({
    enableUrlPersistence: true,      // Save filters to URL
    enableCartPersistence: true,     // Save cart to localStorage
    cartSaveDebounceMs: 1000,        // Debounce cart saves
    filterSaveDebounceMs: 800,       // Debounce filter saves
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const posPageRef = useRef<HTMLDivElement>(null);

  // ─── Debounce search ───
  const debouncedSearch = useDebounce(searchTerm, 400);
  // ─── Edit Cart Item for Price/Promotion ───
  const [editingItemForPrice, setEditingItemForPrice] = useState<PosCartItem | null>(null);

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

  // ─── Initialize Categories and Brands on Mount ───
  useEffect(() => {
    dispatch(fetchPOSPageCategoriesService());
    dispatch(fetchPOSPageBrandsService());
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
        brandId: selectedBrand?.id,
        hasPromotion: promotionFilter,
        reset: true,
      })
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, promotionFilter, dispatch]);

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      dispatch(
        fetchPOSPageProductsService({
          page: productPage + 1,
          search: debouncedSearch,
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
    (product: ProductDetailResponseModel, size?: ProductSize, editingId?: string, quantity: number = 1) => {
      const cartId = size ? `${product.id}-${size.id}` : product.id;
      const currentPrice = size
        ? size.price
        : parseFloat(String(product.displayOriginPrice || product.price || 0));
      const finalPrice = size
        ? size.finalPrice || size.price
        : product.displayPrice || parseFloat(String(product.price || 0));
      const hasPromo = size ? size.hasPromotion : product.hasActivePromotion;

      const newItem: PosPageCartItem = {
        id: cartId,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.mainImageUrl || "",
        productSizeId: size?.id || null,
        sizeName: size?.name || null,
        currentPrice,
        finalPrice,
        hasActivePromotion: hasPromo,
        quantity,
        promotionType: size?.promotionType || product.displayPromotionType || null,
        promotionValue: size?.promotionValue || product.displayPromotionValue || null,
        promotionFromDate: size?.promotionFromDate || product.displayPromotionFromDate || null,
        promotionToDate: size?.promotionToDate || product.displayPromotionToDate || null,
      };

      if (editingId) {
        const existingItem = cartItems.find((item) => item.id === editingId);
        if (existingItem) {
          dispatch(
            updateCartItem({
              ...newItem,
              quantity: existingItem.quantity,
            })
          );
        }
      } else {
        const existing = cartItems.find((item) => item.id === cartId);
        if (existing) {
          dispatch(
            updateCartItem({
              ...newItem,
              quantity: existing.quantity + 1,
            })
          );
        } else {
          dispatch(addCartItem(newItem));
        }
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
      } else {
        dispatch(
          updateCartItem({
            ...item,
            quantity: newQuantity,
          })
        );
      }
    },
    [cartItems, dispatch]
  );

  const removeItem = useCallback(
    (cartId: string) => {
      dispatch(removeCartItem(cartId));
    },
    [dispatch]
  );

  const clearCart = () => dispatch(clearCartItems());

  // ─── Cart Calculations ───
  const cartSummary = useMemo(() => {
    let totalItems = cartItems.length;
    let totalQuantity = 0;
    let subtotalBeforeDiscount = 0;
    let subtotal = 0;
    let totalDiscount = 0;
    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      const beforeDiscount = item.currentPrice * item.quantity;
      const afterDiscount = item.finalPrice * item.quantity;
      subtotalBeforeDiscount += beforeDiscount;
      subtotal += afterDiscount;
      totalDiscount += beforeDiscount - afterDiscount;
    });
    const deliveryFee = selectedDeliveryOption?.price || 0;
    const taxRate = 0;
    const taxAmount = (subtotal + deliveryFee) * taxRate;
    const finalTotal = Math.max(0, subtotal + deliveryFee + taxAmount);
    return {
      totalItems,
      totalQuantity,
      subtotalBeforeDiscount,
      subtotal,
      totalDiscount,
      deliveryFee,
      taxRate,
      taxAmount,
      finalTotal,
    };
  }, [cartItems, selectedDeliveryOption]);

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

  // ─── Edit Cart Item ───
  const handleEditCartItem = (cartItem: PosCartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (product) {
      dispatch(setSizePickerProduct(product));
      dispatch(setEditingCartItemId(cartItem.id));
    }
  };


  // ─── Handle Edit Cart Item for Price/Promotion ───
  const handleEditPriceItem = useCallback((item: PosCartItem) => {
    setEditingItemForPrice(item);
  }, []);

  // ─── Save Cart Item Price Changes ───
  const handleSaveItemChanges = useCallback((editData: any) => {
    // For now, just update the local item state
    // Backend integration will be done later
    dispatch(
      updateCartItem({
        ...editData,
        // Keep old values for history
        oldPrice: editData.originalPrice,
        oldQuantity: editData.originalQuantity,
        oldPromotion: editData.originalPromotion,
      })
    );
    showToast.success("Item updated (local changes only)");
  }, [dispatch]);
  // ─── Submit Order ───
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error("Please add items to cart");
      return;
    }

    const payload = {
      businessId: products[0]?.businessId || AppDefault.BUSINESS_ID,
      deliveryAddress: {
        village: "",
        commune: "",
        district: "",
        province: "",
        streetNumber: "",
        houseNumber: "",
        note: "",
        latitude: 0,
        longitude: 0,
      },
      deliveryOption: selectedDeliveryOption
        ? {
            name: selectedDeliveryOption.name,
            description: selectedDeliveryOption.description || "POS Order",
            imageUrl: selectedDeliveryOption.imageUrl || "",
            price: selectedDeliveryOption.price || 0,
          }
        : {
            name: "In-Store",
            description: "POS Order - In Store",
            imageUrl: "",
            price: 0,
          },
      cart: {
        businessId: products[0]?.businessId || AppDefault.BUSINESS_ID,
        businessName: products[0]?.businessName || "",
        items: cartItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          productSizeId: item.productSizeId,
          sizeName: item.sizeName || "",
          status: "ACTIVE",
          currentPrice: item.currentPrice,
          finalPrice: item.finalPrice,
          hasActivePromotion: item.hasActivePromotion,
          quantity: item.quantity,
          totalBeforeDiscount: item.currentPrice * item.quantity,
          discountAmount: (item.currentPrice - item.finalPrice) * item.quantity,
          totalPrice: item.finalPrice * item.quantity,
          promotionType: item.promotionType || "",
          promotionValue: item.promotionValue || 0,
          promotionFromDate: item.promotionFromDate || "",
          promotionToDate: item.promotionToDate || "",
        })),
        totalItems: cartSummary.totalItems,
        totalQuantity: cartSummary.totalQuantity,
        subtotalBeforeDiscount: cartSummary.subtotalBeforeDiscount,
        subtotal: cartSummary.subtotal,
        totalDiscount: cartSummary.totalDiscount,
        finalTotal: cartSummary.finalTotal,
      },
      payment: {
        paymentMethod: selectedPaymentOption?.paymentOptionType || "CASH",
        paymentStatus: "PAID" as const,
      },
      customerNote: customerNote || "",
      orderStatus: OrderStatus.CONFIRMED,
    };

    dispatch(setIsSubmitting(true));
    try {
      const result = await dispatch(createPOSPageOrderService(payload) as any);
      if (result.payload) {
        const order = result.payload;
        dispatch(setSuccessOrder({ orderNumber: order.orderNumber, total: cartSummary.finalTotal }));
        dispatch(clearCartItems());
        dispatch(setCustomerNote(""));
        showToast.success("Order created successfully");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Failed to create order");
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
        <div className="flex-1 flex flex-col overflow-hidden">
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
            {(searchTerm || selectedCategory || selectedBrand || promotionFilter !== undefined) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  dispatch(setSearchTerm(""));
                  dispatch(setSelectedCategory(null));
                  dispatch(setSelectedBrand(null));
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
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}
              {products.map((product, index) => (
                <POSProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  quantity={getProductCartQuantity(product.id)}
                  onAddClick={handleProductClick}
                  onQuantityChange={updateQuantity}
                />
              ))}
              {productsLoading && products.length > 0 &&
                Array.from({ length: 15 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}
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
                      hasPromotion={item.hasActivePromotion}
                      promotionType={item.promotionType}
                      promotionValue={item.promotionValue}
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
                  <span className="font-medium">{formatCurrency(cartSummary.subtotalBeforeDiscount)}</span>
                </div>
                {cartSummary.totalDiscount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500 font-medium">Discount</span>
                    <span className="text-red-500 font-semibold">-{formatCurrency(cartSummary.totalDiscount)}</span>
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
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-base font-bold text-primary">{formatCurrency(cartSummary.finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              <div className="rounded-xl overflow-hidden border border-border shadow-sm flex items-stretch">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-3 gap-2 text-xs font-semibold border-r border-border hover:bg-muted/50"
                  onClick={() => dispatch(setShowOrderDetailsModal(true))}
                >
                  <Tag className="w-3.5 h-3.5" />
                  More
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
      {/* Calculate initial quantities when opening modal - show current cart quantities */}
      {(() => {
        const initialQties = new Map<string, number>();
        if (sizePickerProduct && cartItems.length > 0) {
          // Get all cart items for this product and build a map of size -> quantity
          cartItems
            .filter((item) => item.productId === sizePickerProduct.id)
            .forEach((item) => {
              const sizeId = item.productSizeId || "no_size";
              initialQties.set(sizeId, item.quantity);
            });
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
            onSizeSelect={(product, size, qty) => {
              addToCart(product, size, editingCartItemId || undefined, qty || 1);
              dispatch(setSizePickerProduct(null));
              dispatch(setEditingCartItemId(null));
            }}
            isEditing={!!editingCartItemId}
            initialQuantities={initialQties}
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
            hasActivePromotion: editingItemForPrice.hasActivePromotion,
            promotionType: editingItemForPrice.promotionType,
            promotionValue: editingItemForPrice.promotionValue,
          } : null
        }
        onSave={handleSaveItemChanges}
      />
      <POSMoreOptionsModal
        open={showOrderDetailsModal}
        onOpenChange={(open) => dispatch(setShowOrderDetailsModal(open))}
        customerNote={customerNote}
        onNoteChange={(note) => dispatch(setCustomerNote(note))}
      />
    </div>
  );
}

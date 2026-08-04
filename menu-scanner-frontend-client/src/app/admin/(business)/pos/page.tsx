"use client";

import { Suspense } from "react";

import { Messages } from "@/constants/messages";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { CustomButton } from "@/components/shared/button/custom-button";
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
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";
import { applyDiscount, buildQuantityMap } from "@/utils/common/customization-utils";
import { POSCartItem } from "@/components/pos-custom/pos-cart-item";
import { POSHeaderFilters } from "@/components/pos-custom/pos-header-filters";
import { POSCategorySelector } from "@/components/pos-custom/pos-category-bar";
import { POSProductGrid } from "@/components/pos-custom/pos-product-grid";
import { POSCartSidebar } from "@/components/pos-custom/pos-cart-sidebar";
import { POSMoreOptionsModal } from "@/components/pos-custom/pos-more-options-modal";
import { POSOrderSuccessModal } from "@/components/pos-custom/pos-order-success-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { POSProductCard } from "@/components/shared/card/pos-product-card";
import { SizePickerModal } from "@/components/shared/modal/size-picker-modal";
import { POSEditCartItemModal } from "@/components/pos-custom/pos-edit-cart-item-modal";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useAppDispatch } from "@/store";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/features/business/store/models/response/product-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { cn } from "@/lib/utils";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";
import { AppDefault } from "@/constants/app-resource/default/default";

import { useLocalStorageSync } from "@/hooks/use-local-storage-sync";
import { useFilterURLSync } from "@/hooks/use-filter-url-sync";


import { usePOSPageState } from "@/features/business/store/state/pos-page-state";
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
  setPromotionFilter,
  setPromotionOpen,
} from "@/features/business/store/slice/pos-page-slice";
import {
  fetchPOSPageCategoriesService,
  fetchPOSPageBrandsService,
  fetchPOSPageProductsService,
  createPOSCheckoutOrderService,
} from "@/features/business/store/thunks/pos-page-thunks";
import { fetchAllDeliveryOptionsService } from "@/features/master-data/store/thunks/delivery-options-thunks";
import { fetchAllPaymentOptionsService } from "@/features/master-data/store/thunks/payment-options-thunks";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useAppSelector } from "@/store";


type CartItemEditData = {
  id: string;
  productName: string;
  productImageUrl: string;
  sizeName: string | null;
  originalPrice: number;
  originalQuantity: number;
  originalPromotion: { type: string | null; value: number | null };
  newPrice: number;
  newQuantity: number;
  newPromotion: { type: string | null; value: number | null };
  reason: string;
};


type OrderDiscountType = {
  type: "fixed" | "percentage";
  value: number;
  reason: string;
  beforeTotal: number;
  afterTotal: number;
  discountAmount: number;
  appliedAt: string;
} | null;

type POSCheckoutPayload = {
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  deliveryOption: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  };
  cart: {
    businessId: string;
    businessName: string;
    items: Array<{
      productId: string;
      productName: string;
      productImageUrl: string;
      productSizeId: string | null;
      sizeName: string | null;
      quantity: number;
      customizations: Array<{
        productCustomizationId: string;
        name: string;
        priceAdjustment: number;
      }>;
      finalPrice: number;
      totalPrice: number;
      sku: string;
      barcode: string;
    }>;
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    customizationTotal: number;
    finalTotal: number;
  };
  pricing: {
    subtotal: number;
    customizationTotal: number;
    deliveryFee: number;
    taxPercentage: number;
    taxAmount: number;
    discountAmount: number;
    discountType: "FIXED_AMOUNT" | "PERCENTAGE" | null;
    discountReason: string | null;
    finalTotal: number;
  };
  payment: {
    paymentMethod: string;
    paymentStatus: string;
  };
  customerNote: string;
  businessNote: string;
  orderStatus: string;
};

function PosPageInner() {
  const dispatch = useAppDispatch();


  const businessSettings = useAppSelector(selectBusinessSettings);


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
    categoryOpen,
    promotionFilter,
    promotionOpen,
    minPrice,
    maxPrice,
  } = usePOSPageState();


  useLocalStorageSync({
    storageKey: "pos:cart",
    debounceMs: 1000,
    enabled: true,
  });


  useFilterURLSync({
    enabled: true,
    debounceMs: 800,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const posPageRef = useRef<HTMLDivElement>(null);


  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedMinPrice = useDebounce(minPrice || "", 400);
  const debouncedMaxPrice = useDebounce(maxPrice || "", 400);

  const [editingItemForPrice, setEditingItemForPrice] = useState<PosPageCartItem | null>(null);
  const [orderDiscount, setOrderDiscount] = useState<OrderDiscountType>(null);








  useEffect(() => {
    dispatch(fetchPOSPageCategoriesService());
    dispatch(fetchPOSPageBrandsService());

    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch]);

  useEffect(() => {
    const initializeDefaults = async () => {
      try {
        const deliveryResult = await dispatch(
          fetchAllDeliveryOptionsService({
            pageNo: 1,
            pageSize: 100,
            businessId: AppDefault.BUSINESS_ID,
            statuses: ["ACTIVE"],
          })
        ).unwrap();

        const pickupOption = deliveryResult?.content?.find(
          (option: any) => option.name === "Pickup" && option.price === 0
        );
        if (pickupOption) {
          dispatch(setSelectedDeliveryOption(pickupOption as any));
        } else {
          // Use static fallback if not found in API
          dispatch(setSelectedDeliveryOption({
            id: "pickup-default",
            name: "Pickup",
            description: "Pickup from store",
            price: 0,
            imageUrl: ""
          } as any));
        }

        const paymentResult = await dispatch(
          fetchAllPaymentOptionsService({
            pageNo: 1,
            pageSize: 100,
            statuses: ["ACTIVE"],
          })
        ).unwrap();

        const cashOption = paymentResult?.content?.find(
          (option: any) => option.paymentOptionType === "CASH"
        );
        if (cashOption) {
          dispatch(setSelectedPaymentOption(cashOption));
        } else {
          // Use static fallback if not found in API
          dispatch(setSelectedPaymentOption({
            id: "cash-default",
            name: "Cash",
            paymentOptionType: "CASH"
          }));
        }
      } catch (error) {
        // Set static defaults on API error
        dispatch(setSelectedDeliveryOption({
          id: "pickup-default",
          name: "Pickup",
          description: "Pickup from store",
          price: 0,
          imageUrl: ""
        } as any));
        dispatch(setSelectedPaymentOption({
          id: "cash-default",
          name: "Cash",
          paymentOptionType: "CASH"
        }));
      }
    };

    initializeDefaults();
  }, [dispatch]);

  const skeletonCount = 4;


  useEffect(() => {
    dispatch(setProductPage(1));
    dispatch(setProducts([]));
    dispatch(setProductsLoading(true));
    const parsedMin = debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined;
    const parsedMax = debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined;
    dispatch(
      fetchPOSPageProductsService({
        page: 1,
        search: debouncedSearch,
        categoryId: selectedCategory?.id,
        brandId: selectedBrand?.id,
        hasPromotion: promotionFilter,
        minPrice: parsedMin,
        maxPrice: parsedMax,
        reset: true,
      })
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, promotionFilter, debouncedMinPrice, debouncedMaxPrice, dispatch]);

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      const nextPage = productPage + 1;
      const parsedMin = debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined;
      const parsedMax = debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined;

      dispatch(setProductPage(nextPage));
      dispatch(
        fetchPOSPageProductsService({
          page: nextPage,
          search: debouncedSearch,
          categoryId: selectedCategory?.id,
          brandId: selectedBrand?.id,
          hasPromotion: promotionFilter,
          minPrice: parsedMin,
          maxPrice: parsedMax,
        })
      );
    }
  };


  const { observerTarget } = useInfiniteScroll({
    onLoadMore: loadMoreProducts,
    hasMore: hasMoreProducts,
    isLoading: productsLoading,
  });


  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const viewport = productGridRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {

      setShowScrollToTop(viewport.scrollTop > 200);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);


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


  const addToCart = useCallback(
    (product: ProductDetailResponseModel, size?: ProductSize, editingId?: string | null, quantity: number = 1, customizationIds?: string[]) => {

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
        ? customizationIds.map((customId, index) => {
            const custom = product.customizations?.find((c) => c.id === customId);
            return {
              id: `${cartId}-custom-${index}`,
              productCustomizationId: customId,
              name: custom?.name || "",
              priceAdjustment: custom?.priceAdjustment || 0,
            };
          })
        : [];


      const customizationTotal = customizations.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0);


      finalPrice = finalPrice + customizationTotal;
      const newItem: PosPageCartItem = {
        id: cartId,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.mainImage?.sm || "",
        productSizeId: size?.id || null,
        sizeName: size?.name || null,
        quantity,
        sku: product.sku || "",
        barcode: product.barcode || "",
        customizations,
        currentPrice,
        finalPrice,
        totalPrice: finalPrice * quantity,
        hasPromotion: size ? size.hasPromotion : product.hasPromotion,
        promotionType: size ? size.promotionType : product.displayPromotionType,
        promotionValue: size ? size.promotionValue : product.displayPromotionValue,
        promotionFromDate: size ? size.promotionFromDate : product.displayPromotionFromDate,
        promotionToDate: size ? size.promotionToDate : product.displayPromotionToDate,
      };

      if (quantity <= 0) {
        if (editingId) {
          const existingItem = cartItems.find((item) => item.id === editingId);
          if (existingItem) {
            dispatch(removeCartItem(editingId));
            dispatch(clearProductCustomizations(existingItem.productId));
          }
        } else if (cartItems.some((item) => item.id === cartId)) {
          dispatch(removeCartItem(cartId));
          dispatch(clearProductCustomizations(product.id));
        }
        return;
      }

      if (editingId) {

        const existingItem = cartItems.find((item) => item.id === editingId);
        if (existingItem) {
          dispatch(updateCartItem({
            ...newItem,
            quantity: quantity,
            totalPrice: finalPrice * quantity,
          }));
        }
      } else if (cartItems.some((item) => item.id === cartId)) {

        dispatch(updateCartItem({
          ...newItem,
          quantity: quantity,
          totalPrice: finalPrice * quantity,
        }));
      } else {

        dispatch(addCartItem(newItem));
      }


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


  const cartSummary = useMemo(() => {
    let totalItems = cartItems.length;
    let totalQuantity = 0;
    let subtotal = 0;
    let customizationTotal = 0;
    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      const itemCustomizationTotal = item.customizations?.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0) || 0;
      const itemBasePrice = item.finalPrice - itemCustomizationTotal;
      subtotal += itemBasePrice * item.quantity;
      customizationTotal += itemCustomizationTotal * item.quantity;
    });
    const deliveryFee = selectedDeliveryOption?.price || 0;
    const taxPercentage = businessSettings?.taxPercentage || 0;
    const taxAmount = (subtotal + customizationTotal) * (taxPercentage / 100);
    const discountAmount = orderDiscount?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal + customizationTotal + deliveryFee + taxAmount - discountAmount);
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
  }, [cartItems, selectedDeliveryOption, businessSettings?.taxPercentage, orderDiscount]);


  const handleProductClick = useCallback((product: ProductDetailResponseModel) => {
    const hasCustomizations = product.customizations && product.customizations.length > 0;
    if (product.hasSizes || hasCustomizations) {
      dispatch(setSizePickerProduct(product));
      return;
    }
    addToCart(product, undefined, undefined, 1);
  }, [dispatch, addToCart]);


  const handleEditPriceItem = useCallback((item: PosPageCartItem) => {
    setEditingItemForPrice(item);
  }, []);


  const handleSaveItemChanges = useCallback((editData: CartItemEditData) => {
    if (!editingItemForPrice) return;

    const { newPrice, newQuantity, newPromotion } = editData;

    const promoDeduction = newPromotion.type && newPromotion.value && newPromotion.value > 0
      ? newPromotion.type === "PERCENTAGE"
        ? newPrice * (newPromotion.value / 100)
        : newPromotion.value
      : 0;

    const addonsTotal = editingItemForPrice.customizations?.reduce(
      (sum, c) => sum + (c.priceAdjustment || 0), 0
    ) ?? 0;

    const finalPrice = Math.max(0, newPrice - promoDeduction + addonsTotal);

    const updatedItem: PosPageCartItem = {
      ...editingItemForPrice,
      quantity: newQuantity,
      currentPrice: newPrice,
      finalPrice,
      totalPrice: finalPrice * newQuantity,
      hasPromotion: promoDeduction > 0,
      promotionType: newPromotion.type,
      promotionValue: newPromotion.value,
    };

    dispatch(updateCartItem(updatedItem));
    showToast.success(Messages.cart.itemUpdated);
    setEditingItemForPrice(null);
  }, [dispatch, editingItemForPrice]);

  const handleDiscountApply = (discount: Exclude<OrderDiscountType, null>) => {
    setOrderDiscount(discount);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error(Messages.cart.emptyCart);
      return;
    }

    if (!selectedDeliveryOption) {
      showToast.error(Messages.delivery.selectOption);
      return;
    }



    const payload: POSCheckoutPayload = {
      businessId: products[0]?.businessId || AppDefault.BUSINESS_ID,
      customerName: "Walk-in Customer",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",


      deliveryOption: {
        name: selectedDeliveryOption.name || "Delivery",
        description: selectedDeliveryOption.description || "POS Order",
        imageUrl: selectedDeliveryOption.image?.sm || selectedDeliveryOption.image?.md || "",
        price: selectedDeliveryOption.price || 0,
      },


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

          customizations: item.customizations || [],
          finalPrice: item.finalPrice,
          totalPrice: item.totalPrice,

          sku: item.sku || "",
          barcode: item.barcode || "",

          hasPromotion: item.hasPromotion || null,
          promotionType: item.promotionType || null,
          promotionValue: item.promotionValue || null,
          promotionFromDate: item.promotionFromDate || null,
          promotionToDate: item.promotionToDate || null,
        })),
        totalItems: cartSummary.totalItems,
        totalQuantity: cartSummary.totalQuantity,
        subtotal: cartSummary.subtotal,
        customizationTotal: cartSummary.customizationTotal,
        finalTotal: cartSummary.finalTotal,
      },

      pricing: {
        subtotal: cartSummary.subtotal,
        customizationTotal: cartSummary.customizationTotal,
        deliveryFee: selectedDeliveryOption?.price || 0,
        taxPercentage: cartSummary.taxPercentage,
        taxAmount: cartSummary.taxAmount,
        discountAmount: orderDiscount?.discountAmount || 0,
        discountType: orderDiscount?.type === "fixed" ? "FIXED_AMOUNT" : orderDiscount?.type === "percentage" ? "PERCENTAGE" : null,
        discountReason: orderDiscount?.reason || null,
        finalTotal: cartSummary.finalTotal,
      },


      payment: {
        paymentMethod: "CASH",
        paymentStatus: "PAID",
      },


      customerNote: customerNote || "",
      businessNote: "Created via POS System",
      orderStatus: OrderStatus.PENDING,
    };

    dispatch(setIsSubmitting(true));
    try {
      const result = await dispatch(createPOSCheckoutOrderService(payload));
      if (result.payload) {
        dispatch(setSuccessOrder(result.payload as OrderResponse));
        dispatch(clearCartItems());
        dispatch(setCartPricing(null));
        dispatch(setCustomerNote(""));
        setOrderDiscount(null);
        showToast.success(Messages.orders.created);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.orders.createFailed);
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };


  return (
    <div
      ref={posPageRef}
      className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden bg-background"
    >
      <div className="flex max-md:flex-col md:flex-row flex-1 h-full min-h-0 overflow-hidden relative">
        {/* Main Product Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative border-r border-border/60">
          <POSHeaderFilters
            searchInputRef={searchInputRef}
            searchTerm={searchTerm}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            categories={categories}
            brands={brands}
            brandOpen={brandOpen}
            categoryOpen={categoryOpen}
            promotionOpen={promotionOpen}
            promotionFilter={promotionFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <POSProductGrid
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
            hasMoreProducts={hasMoreProducts}
            skeletonCount={skeletonCount}
            showScrollToTop={showScrollToTop}
            debouncedSearch={debouncedSearch}
            selectedCategoryId={selectedCategory?.id}
            selectedBrandId={selectedBrand?.id}
            promotionFilter={promotionFilter}
            productGridRef={productGridRef}
            observerTarget={observerTarget}
            handleProductClick={handleProductClick}
            updateQuantity={updateQuantity}
            scrollProductsToTop={scrollProductsToTop}
          />

          {/* Mobile Floating Cart Summary Button */}
          {cartItems.length > 0 && !showCart && (
            <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
              <CustomButton
                onClick={() => dispatch(setShowCart(true))}
                className="w-full h-12 bg-primary text-primary-foreground rounded-[12px] shadow-xl flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span className="text-xs sm:text-sm font-bold">
                    View Order ({cartSummary.totalQuantity})
                  </span>
                </div>
                <span className="text-sm sm:text-base font-black">
                  {formatCurrency(cartSummary.finalTotal)}
                </span>
              </CustomButton>
            </div>
          )}
        </div>

        {/* Right Cart Sidebar / Checkout Section */}
        <POSCartSidebar
          showCart={showCart}
          cartItems={cartItems}
          cartSummary={cartSummary}
          selectedDeliveryOption={selectedDeliveryOption}
          selectedPaymentOption={selectedPaymentOption}
          isSubmitting={isSubmitting}
          clearCart={clearCart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          handleEditPriceItem={handleEditPriceItem}
          handleSubmitOrder={handleSubmitOrder}
        />
      </div>
      {sizePickerProduct && (
        <SizePickerModal
          product={sizePickerProduct}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              dispatch(setSizePickerProduct(null));
              dispatch(setEditingCartItemId(null));
            }
          }}
          onSizeSelect={(product, size, qty, customizationIds) => {
            addToCart(product, size, editingCartItemId, qty ?? 0, customizationIds);
            dispatch(setSizePickerProduct(null));
            dispatch(setEditingCartItemId(null));
          }}
          isEditing={!!editingCartItemId}
          cartItems={cartItems}
          initialQuantities={
            sizePickerProduct ? buildQuantityMap(cartItems, sizePickerProduct.id) : new Map()
          }
          initialCustomizations={
            editingCartItemId
              ? cartItems
                  .find((item) => item.id === editingCartItemId)
                  ?.customizations?.map((c) => c.productCustomizationId) || []
              : []
          }
        />
      )}

      <POSOrderSuccessModal
        open={!!successOrder}
        onClose={() => dispatch(setSuccessOrder(null))}
        order={successOrder}
      />


      {}
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
            hasPromotion: editingItemForPrice.hasPromotion ?? false,
            promotionType: editingItemForPrice.promotionType ?? null,
            promotionValue: editingItemForPrice.promotionValue ?? null,
            customizations: editingItemForPrice.customizations?.map(c => ({
              name: c.name,
              priceAdjustment: c.priceAdjustment,
            })) || [],
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

export default function PosPage() {
  return (
    <Suspense>
      <PosPageInner />
    </Suspense>
  );
}

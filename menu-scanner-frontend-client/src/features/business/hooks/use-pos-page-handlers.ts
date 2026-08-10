"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Messages } from "@/constants/messages";
import { showToast } from "@/components/shared/common/show-toast";
import { applyDiscount, buildQuantityMap } from "@/utils/common/customization-utils";
import { useDebounce } from "@/utils/debounce/debounce";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/features/business/store/models/response/product-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { AppDefault } from "@/constants/app-resource/default/default";
import { PromotionType } from "@/constants/status/status";
import { formatCurrency } from "@/utils/common/currency-format";

import { useLocalStorageSync } from "@/hooks/use-local-storage-sync";
import { useFilterURLSync } from "@/hooks/use-filter-url-sync";
import { usePOSPageState } from "@/features/business/store/state/pos-page-state";
import {
  setSelectedDeliveryOption,
  setSelectedPaymentOption,
  setProducts,
  setProductsLoading,
  setSearchTerm,
  setSelectedCategory,
  setSelectedBrand,
  setProductPage,
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
  setMinPrice,
  setMaxPrice,
  setPromotionFilter,
} from "@/features/business/store/slice/pos-page-slice";
import {
  fetchPOSPageProductsService,
  createPOSCheckoutOrderService,
} from "@/features/business/store/thunks/pos-page-thunks";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";

export type CartItemEditData = {
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

export type OrderDiscountType = {
  type: "fixed" | "percentage";
  value: number;
  reason: string;
  beforeTotal: number;
  afterTotal: number;
  discountAmount: number;
  appliedAt: string;
} | null;

export type POSCheckoutPayload = {
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

export function usePOSPageHandlers() {
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
    promotionFilter,
    promotionOpen,
    minPrice,
    maxPrice,
  } = usePOSPageState();

  // Local Storage & URL Sync
  useLocalStorageSync({
    storageKey: "pos:cart",
    debounceMs: 1000,
    enabled: true,
  });

  useFilterURLSync({
    enabled: true,
    debounceMs: 800,
  });

  // DOM Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const posPageRef = useRef<HTMLDivElement>(null);

  // Debounced filters
  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedMinPrice = useDebounce(minPrice || "", 400);
  const debouncedMaxPrice = useDebounce(maxPrice || "", 400);

  const lastFetchedParamsRef = useRef<string>("");
  const [editingItemForPrice, setEditingItemForPrice] = useState<PosPageCartItem | null>(null);
  const [orderDiscount, setOrderDiscount] = useState<OrderDiscountType>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);


  // Read delivery default from combobox cache once it loads (avoids duplicate fetch)
  const deliveryCache = useAppSelector(
    (state: any) => state.comboboxCache.caches[`deliveryOptions-${AppDefault.BUSINESS_ID}`]
  );
  const paymentCache = useAppSelector(
    (state: any) => state.comboboxCache.caches["paymentOptions"]
  );

  // Set default delivery option (Pickup) once the combobox cache is populated
  useEffect(() => {
    if (!selectedDeliveryOption && deliveryCache?.content?.length) {
      const pickupOption = deliveryCache.content.find(
        (o: any) => o.name === "Pickup" && o.price === 0
      ) ?? deliveryCache.content[0];
      dispatch(setSelectedDeliveryOption(pickupOption ?? {
        id: "pickup-default",
        name: "Pickup",
        description: "Pickup from store",
        price: 0,
        imageUrl: "",
      }));
    }
  }, [deliveryCache, selectedDeliveryOption, dispatch]);

  // Set default payment option (Cash) once the combobox cache is populated
  useEffect(() => {
    if (!selectedPaymentOption && paymentCache?.content?.length) {
      const cashOption = paymentCache.content.find(
        (o: any) => o.paymentOptionType === "CASH"
      ) ?? paymentCache.content[0];
      dispatch(setSelectedPaymentOption(cashOption ?? {
        id: "cash-default",
        name: "Cash",
        paymentOptionType: "CASH",
      }));
    }
  }, [paymentCache, selectedPaymentOption, dispatch]);

  // Fetch products on filter change
  useEffect(() => {
    const parsedMin = debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined;
    const parsedMax = debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined;

    const paramsKey = JSON.stringify({
      search: debouncedSearch,
      categoryId: selectedCategory?.id,
      brandId: selectedBrand?.id,
      hasPromotion: promotionFilter,
      minPrice: parsedMin,
      maxPrice: parsedMax,
    });

    if (lastFetchedParamsRef.current === paramsKey) {
      return;
    }
    lastFetchedParamsRef.current = paramsKey;

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
        minPrice: parsedMin,
        maxPrice: parsedMax,
        reset: true,
      })
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, promotionFilter, debouncedMinPrice, debouncedMaxPrice, dispatch]);

  const loadMoreProducts = useCallback(() => {
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
  }, [hasMoreProducts, productsLoading, productPage, debouncedMinPrice, debouncedMaxPrice, debouncedSearch, selectedCategory?.id, selectedBrand?.id, promotionFilter, dispatch]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: loadMoreProducts,
    hasMore: hasMoreProducts,
    isLoading: productsLoading,
  });

  // Scroll to top listener
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

  // F2 Shortcut for search focus
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

  // Cart operations
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

  const clearCart = useCallback(() => dispatch(clearCartItems()), [dispatch]);

  // Pricing calculations
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
      ? newPromotion.type === PromotionType.PERCENTAGE
        ? newPrice * (newPromotion.value / 100)
        : newPromotion.value
      : 0;

    const unitFinalPrice = Math.max(0, newPrice - promoDeduction);

    const addonsTotal = editingItemForPrice.customizations?.reduce(
      (sum, c) => sum + (c.priceAdjustment || 0), 0
    ) ?? 0;

    const finalPriceWithAddons = unitFinalPrice + addonsTotal;

    const updatedItem: PosPageCartItem = {
      ...editingItemForPrice,
      quantity: newQuantity,
      currentPrice: newPrice,
      finalPrice: unitFinalPrice,
      totalPrice: finalPriceWithAddons * newQuantity,
      hasPromotion: promoDeduction > 0,
      promotionType: newPromotion.type,
      promotionValue: newPromotion.value,
      editReason: editData.reason || undefined,
    };

    dispatch(updateCartItem(updatedItem));
    showToast.success(Messages.cart.itemUpdated);
    setEditingItemForPrice(null);
  }, [dispatch, editingItemForPrice]);

  const handleDiscountApply = useCallback((discount: Exclude<OrderDiscountType, null>) => {
    setOrderDiscount(discount);
  }, []);

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error(Messages.cart.emptyCart);
      return;
    }

    if (!selectedDeliveryOption) {
      showToast.error(Messages.delivery.selectOption);
      return;
    }

    const itemReasons = cartItems
      .map((item) => (item.editReason ? `${item.productName}: ${item.editReason}` : null))
      .filter(Boolean);

    const remarksParts: string[] = ["Created via POS System"];
    if (customerNote && customerNote.trim()) {
      remarksParts.push(customerNote.trim());
    }
    if (itemReasons.length > 0) {
      remarksParts.push(itemReasons.join("; "));
    }
    if (orderDiscount && orderDiscount.discountAmount > 0) {
      const discountLabel = orderDiscount.type === "percentage"
        ? `Discount Applied: ${orderDiscount.value}% (-${formatCurrency(orderDiscount.discountAmount)})`
        : `Discount Applied: Fixed -${formatCurrency(orderDiscount.discountAmount)}`;
      remarksParts.push(discountLabel);
    }

    const finalBusinessNote = remarksParts.join(" | ");

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
          hasPromotion: Boolean(item.hasPromotion === "ACTIVE" || item.hasPromotion === "FUTURE_PROMOTION" || item.hasPromotion === true),
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
      customerNote: "",
      businessNote: finalBusinessNote,
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

  return {
    dispatch,
    // State
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    productsError,
    searchTerm,
    selectedCategory,
    selectedBrand,
    hasMoreProducts,
    cartItems,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    successOrder,
    showOrderDetailsModal,
    promotionFilter,
    promotionOpen,
    minPrice,
    maxPrice,
    editingItemForPrice,
    setEditingItemForPrice,
    showScrollToTop,
    cartSummary,
    // Refs
    searchInputRef,
    productGridRef,
    categoryScrollRef,
    posPageRef,
    observerTarget,
    debouncedSearch,
    skeletonCount: 4,
    // Handlers
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    handleProductClick,
    handleEditPriceItem,
    handleSaveItemChanges,
    handleDiscountApply,
    handleSubmitOrder,
    scrollProductsToTop,
  };
}

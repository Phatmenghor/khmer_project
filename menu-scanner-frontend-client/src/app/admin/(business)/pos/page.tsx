"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CheckCircle2,
  Loader2,
  ChevronsUpDown,
  Check,
  Pencil,
  Truck,
  Tag,
  Percent,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useAppDispatch } from "@/redux/store";
import { axiosClientWithAuth } from "@/utils/axios";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { cn } from "@/lib/utils";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";

// ─── Local Cart Types ───
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
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const posPageRef = useRef<HTMLDivElement>(null);

  // Mobile responsive zoom
  useEffect(() => {
    const applyResponsiveZoom = () => {
      if (posPageRef.current) {
        if (window.innerWidth < 768) {
          // Mobile: no zoom
          posPageRef.current.style.zoom = "1";
        } else {
          // Tablet & Desktop: 0.8 zoom
          posPageRef.current.style.zoom = "0.8";
        }
      }
    };

    applyResponsiveZoom();
    window.addEventListener("resize", applyResponsiveZoom);
    return () => window.removeEventListener("resize", applyResponsiveZoom);
  }, []);

  // ─── Payment & Delivery Options State ───
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOptionsResponseModel | null>(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<any>(null);

  // ─── Product & Filter State ───
  const [products, setProducts] = useState<ProductDetailResponseModel[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesResponseModel | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null
  );
  const [categories, setCategories] = useState<CategoriesResponseModel[]>([]);
  const [brands, setBrands] = useState<BrandResponseModel[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // ─── Cart State ───
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [showCart, setShowCart] = useState(true);

  // ─── Order State ───
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Size Picker Modal ───
  const [sizePickerProduct, setSizePickerProduct] =
    useState<ProductDetailResponseModel | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

  // ─── Success Modal ───
  const [successOrder, setSuccessOrder] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  // ─── Brand Popover ───
  const [brandOpen, setBrandOpen] = useState(false);

  // ─── More Options Modal State ───
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  // ─── Promotion Filter State ───
  const [promotionFilter, setPromotionFilter] = useState<boolean | undefined>(undefined);
  const [promotionOpen, setPromotionOpen] = useState(false);

  // ─── Fetch Categories ───
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await axiosClientWithAuth.post(
        "/api/v1/categories/my-business/all",
        {
          pageNo: 1,
          pageSize: 100,
          status: "ACTIVE",
        }
      );
      setCategories(response.data.data?.content || []);
    } catch {
      showToast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ─── Fetch Brands ───
  const fetchBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      const response = await axiosClientWithAuth.post(
        "/api/v1/brands/my-business/all",
        {
          pageNo: 1,
          pageSize: 100,
          status: "ACTIVE",
        }
      );
      setBrands(response.data.data?.content || []);
    } catch {
      showToast.error("Failed to load brands");
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  // ─── Fetch Products ───
  const fetchProducts = useCallback(
    async (
      page: number,
      search: string,
      categoryId?: string,
      brandId?: string,
      hasPromotion: boolean | undefined = undefined,
      reset = false
    ) => {
      try {
        // Clear products immediately on reset for skeleton to show
        if (reset) {
          setProducts([]);
        }
        setProductsLoading(true);
        const response = await axiosClientWithAuth.post(
          "/api/v1/products/admin/all",
          {
            search: search || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            hasPromotion: hasPromotion,
            pageNo: page,
            pageSize: 30,
            status: "ACTIVE",
          }
        );
        const data = response.data.data;
        if (reset || page === 1) {
          setProducts(data.content || []);
        } else {
          setProducts((prev) => [...prev, ...(data.content || [])]);
        }
        setHasMoreProducts(!data.last);
        setProductPage(data.pageNo);
      } catch {
        showToast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    },
    []
  );

  // ─── Initialize Categories and Brands on Mount ───
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  useEffect(() => {
    fetchProducts(
      1,
      debouncedSearch,
      selectedCategory?.id,
      selectedBrand?.id,
      promotionFilter,
      true
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, promotionFilter, fetchProducts]);

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      fetchProducts(productPage + 1, debouncedSearch, selectedCategory?.id, selectedBrand?.id, promotionFilter);
    }
  };

  // ─── Infinite Scroll Setup ───
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

    // Use native scrollBy with smooth behavior
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

    // Ensure container and viewport are properly sized for horizontal-only scrolling
    Object.assign(categoryContainer.style, {
      overflow: "hidden",
      height: "40px", // h-10 = 2.5rem = 40px
    });

    // Configure viewport for smooth horizontal scrolling
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
        : product.displayPrice ||
          parseFloat(String(product.price || 0));
      const hasPromo = size ? size.hasPromotion : product.hasActivePromotion;

      setCartItems((prev) => {
        // If editing existing item, replace it
        if (editingId) {
          const existingItem = prev.find((item) => item.id === editingId);
          if (existingItem) {
            return prev.map((item) =>
              item.id === editingId
                ? {
                    id: cartId,
                    productId: product.id,
                    productName: product.name,
                    productImageUrl: product.mainImageUrl || "",
                    productSizeId: size?.id || null,
                    sizeName: size?.name || null,
                    currentPrice,
                    finalPrice,
                    hasActivePromotion: hasPromo,
                    quantity: existingItem.quantity,
                    promotionType:
                      size?.promotionType || product.displayPromotionType || null,
                    promotionValue:
                      size?.promotionValue || product.displayPromotionValue || null,
                    promotionFromDate:
                      size?.promotionFromDate ||
                      product.displayPromotionFromDate ||
                      null,
                    promotionToDate:
                      size?.promotionToDate ||
                      product.displayPromotionToDate ||
                      null,
                  }
                : item
            );
          }
        }

        // Check if same product/size combo already exists
        const existing = prev.find((item) => item.id === cartId);
        if (existing) {
          return prev.map((item) =>
            item.id === cartId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        // Add new item
        return [
          ...prev,
          {
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
            promotionType:
              size?.promotionType || product.displayPromotionType || null,
            promotionValue:
              size?.promotionValue || product.displayPromotionValue || null,
            promotionFromDate:
              size?.promotionFromDate ||
              product.displayPromotionFromDate ||
              null,
            promotionToDate:
              size?.promotionToDate ||
              product.displayPromotionToDate ||
              null,
          },
        ];
      });

      if (!showCart && window.innerWidth < 1024) {
        setShowCart(true);
      }

      setEditingCartItemId(null);
    },
    [showCart]
  );

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === cartId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartId));
  }, []);

  const clearCart = () => setCartItems([]);

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
    const taxRate = 0; // 0% tax for now
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
  // ─── Handle Product Click - Show size modal for sized products ───
  const handleProductClick = useCallback((product: ProductDetailResponseModel) => {
    // For sized products, always open the size picker modal first
    // The modal will fetch full product details if sizes are not loaded
    if (product.hasSizes) {
      setSizePickerProduct(product);
      return;
    }
    // For non-sized products, directly add to cart with quantity 1
    addToCart(product, undefined, undefined, 1);
  }, []);

  // ─── Get quantity in cart for a product ───
  const getProductCartQuantity = useCallback(
    (productId: string) => {
      return cartItems
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [cartItems]
  );

  // ─── Edit Cart Item Handler ───
  const handleEditCartItem = (cartItem: PosCartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (product) {
      setSizePickerProduct(product);
      setEditingCartItemId(cartItem.id);
    }
  };

  // ─── Submit Order ───
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error("Please add items to cart");
      return;
    }

    setIsSubmitting(true);
    try {
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
            discountAmount:
              (item.currentPrice - item.finalPrice) * item.quantity,
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

      const response = await axiosClientWithAuth.post(
        "/api/v1/orders/checkout",
        payload
      );
      const order = response.data.data;

      setSuccessOrder({
        orderNumber: order.orderNumber,
        total: cartSummary.finalTotal,
      });
      clearCart();
      setCustomerNote("");
    } catch (error: any) {
      showToast.error(
        error?.response?.data?.message || "Failed to create order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Current time display ───
  return (
    <div
      ref={posPageRef}
      className="flex flex-col h-full w-full max-md:p-1"
      style={{
        zoom: "0.8", // Default, will be adjusted by useEffect for mobile
      }}
    >
      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Brand Filter */}
            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
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
                          setSelectedBrand(null);
                          setBrandOpen(false);
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
                            setSelectedBrand(brand);
                            setBrandOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBrand?.id === brand.id
                                ? "opacity-100"
                                : "opacity-0"
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
            <Popover open={promotionOpen} onOpenChange={setPromotionOpen}>
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
                          setPromotionFilter(undefined);
                          setPromotionOpen(false);
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
                          setPromotionFilter(true);
                          setPromotionOpen(false);
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

            {/* Clear All Filter Button - Only visible when filters are active */}
            {(searchTerm || selectedCategory || selectedBrand || promotionFilter !== undefined) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setPromotionFilter(undefined);
                  fetchProducts(1, "", undefined, undefined, undefined, true);
                }}
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="shrink-0 border-b bg-muted/10 flex items-center gap-2 px-2 h-10 mt-2">
            {/* Left Arrow Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 hover:bg-primary/10"
              onClick={() => scrollCategories("left")}
              title="Scroll left"
            >
              <ChevronRight className="h-5 w-5 transform rotate-180" />
            </Button>

            {/* Categories Scroll Area - Horizontal only scrolling */}
            <ScrollArea className="flex-1 h-10 overflow-hidden" ref={categoryScrollRef}>
              <div className="flex gap-3 px-2 h-10 items-center">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer h-10 flex items-center",
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-border text-foreground hover:bg-muted"
                  )}
                >
                  All
                </button>

                {/* Category Buttons */}
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 px-3 h-10">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
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

            {/* Right Arrow Button */}
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
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}
            >
              {/* Full Page Skeleton on Initial Load */}
              {productsLoading && products.length === 0 &&
                Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}

              {/* Show all products (always visible, even while loading more) */}
              {products.map((product) => (
                <POSProductCard
                  key={product.id}
                  product={product}
                  quantity={getProductCartQuantity(product.id)}
                  onAddClick={handleProductClick}
                  onQuantityChange={updateQuantity}
                />
              ))}

              {/* Skeleton Loaders while loading more - when scrolling */}
              {productsLoading && products.length > 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}

              {/* Loading Icon Button for more products - INSIDE grid */}
              {productsLoading && products.length > 0 && (
                <div className="col-span-full flex items-center justify-center py-4">
                  <Button disabled className="bg-primary hover:bg-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                </div>
              )}
            </div>

            {/* Infinite Scroll Sentinel - OUTSIDE grid */}
            {hasMoreProducts && !productsLoading && (
              <div ref={observerTarget} className="h-1" />
            )}

            {/* Empty State - OUTSIDE grid */}
            {!productsLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Package className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {/* Initial Loading - OUTSIDE grid for better UX */}
            {productsLoading && products.length === 0 && (
              <div className="w-full p-3 sm:p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <ProductCardSkeleton key={`initial-skeleton-${i}`} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ─── RIGHT: Cart & Checkout Panel ─── */}
        <div
          className={`${
            showCart ? "flex" : "hidden"
          } lg:flex w-full lg:w-[380px] xl:w-[420px] h-full flex-col bg-card border-l shrink-0 overflow-hidden ${
            showCart && "fixed inset-0 z-50 lg:relative lg:z-auto"
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div>
              <h2 className="font-semibold text-sm">Current Order</h2>
              {cartItems.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} • {cartSummary.totalQuantity} total quantity
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
              {/* Close button on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => setShowCart(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cart Items - scrollable with max height to show checkout */}
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
                      onEdit={() => handleEditCartItem(item)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* ─── Checkout Section (always visible, never scrolls) ─── */}
          <div className="border-t bg-card shrink-0">
            <div className="p-3 space-y-2">

              {/* Delivery + Payment — same row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 min-w-0">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Truck className="w-3 h-3 shrink-0" />
                    Delivery
                  </Label>
                  <ComboboxSelectDelivery
                    dataSelect={selectedDeliveryOption as any}
                    onChangeSelected={(item) => setSelectedDeliveryOption(item as any)}
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
                    onChangeSelected={(item) => setSelectedPaymentOption(item as any)}
                    placeholder="Payment..."
                    label=""
                    businessId={AppDefault.BUSINESS_ID}
                    statuses={["ACTIVE"]}
                  />
                </div>
              </div>

              {/* Order Summary — inline, no extra header card */}
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
                    Tax
                    <span className="text-[9px] bg-muted px-1 py-0.5 rounded font-medium">0%</span>
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

            {/* Place Order — left info / right action card */}
            <div className="px-3 pb-3">
              <div className="rounded-xl overflow-hidden border border-border shadow-sm flex items-stretch">
                {/* Left: More Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-3 gap-2 text-xs font-semibold border-r border-border hover:bg-muted/50"
                  onClick={() => setShowOrderDetailsModal(true)}
                >
                  <Tag className="w-3.5 h-3.5" />
                  More
                </Button>

                {/* Middle: summary */}
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

                {/* Right: button */}
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

      {/* ─── Size Picker Modal ─── */}
      <SizePickerModal
        product={sizePickerProduct}
        open={!!sizePickerProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSizePickerProduct(null);
            setEditingCartItemId(null);
          }
        }}
        onSizeSelect={(product, size, qty) => {
          addToCart(product, size, editingCartItemId || undefined, qty || 1);
          setSizePickerProduct(null);
          setEditingCartItemId(null);
        }}
        isEditing={!!editingCartItemId}
      />

      {/* ─── Order Success Modal ─── */}
      <POSOrderSuccessModal
        open={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        orderNumber={successOrder?.orderNumber || ""}
        totalAmount={successOrder?.total || 0}
      />

      {/* ─── More Options Modal ─── */}
      <POSMoreOptionsModal
        open={showOrderDetailsModal}
        onOpenChange={setShowOrderDetailsModal}
        customerNote={customerNote}
        onNoteChange={setCustomerNote}
      />
    </div>
  );
}

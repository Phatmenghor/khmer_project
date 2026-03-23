"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  X,
  ReceiptText,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Package,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ChevronsUpDown,
  Check,
  Ruler,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useDebounce } from "@/utils/debounce/debounce";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { POSProductCard } from "@/components/shared/card/pos-product-card";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useAppDispatch } from "@/redux/store";
import { axiosClientWithAuth } from "@/utils/axios";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { OrderStatus } from "@/enums/order-status.enum";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

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

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: CreditCard },
  { value: "ONLINE", label: "Online", icon: Smartphone },
  { value: "OTHER", label: "Other", icon: MoreHorizontal },
];

export default function PosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);


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
  const [paymentMethod, setPaymentMethod] = useState("CASH");
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

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // ─── Fetch Products ───
  const fetchProducts = useCallback(
    async (
      page: number,
      search: string,
      categoryId?: string,
      brandId?: string,
      reset = false
    ) => {
      try {
        setProductsLoading(true);
        const response = await axiosClientWithAuth.post(
          "/api/v1/products/admin/all",
          {
            search: search || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
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

  useEffect(() => {
    fetchProducts(
      1,
      debouncedSearch,
      selectedCategory?.id,
      selectedBrand?.id,
      true
    );
  }, [debouncedSearch, selectedCategory, selectedBrand, fetchProducts]);

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      fetchProducts(
        productPage + 1,
        debouncedSearch,
        selectedCategory?.id,
        selectedBrand?.id
      );
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
    (product: ProductDetailResponseModel, size?: ProductSize, editingId?: string) => {
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
            quantity: 1,
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

    return {
      totalItems,
      totalQuantity,
      subtotalBeforeDiscount,
      subtotal,
      totalDiscount,
      finalTotal: subtotal,
    };
  }, [cartItems]);

  // ─── Product Click Handler ───
  const handleProductClick = (product: ProductDetailResponseModel) => {
    const activeSizes = product.sizes?.filter((s) => s.id) || [];
    if (product.hasSizes && activeSizes.length > 0) {
      setSizePickerProduct(product);
    } else {
      addToCart(product);
    }
  };

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
        businessId: products[0]?.businessId || "",
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
        deliveryOption: {
          name: "In-Store",
          description: "POS Order - In Store",
          imageUrl: "",
          price: 0,
        },
        cart: {
          businessId: products[0]?.businessId || "",
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
          paymentMethod: paymentMethod,
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
    <div className="flex flex-col h-screen -m-2 md:-m-4">
      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Product Section ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Brand Filter Bar */}
          <div className="flex flex-wrap items-end gap-2 p-3 border-b bg-muted/20 shrink-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search products..."
                className="pl-10 h-9"
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
                  className="w-[200px] justify-between h-9 text-sm"
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
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="shrink-0 border-b bg-muted/10 flex items-center gap-2 px-2 h-10 mt-8">
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
          <ScrollArea className="flex-1 w-full" ref={productGridRef}>
            <div className="w-full p-3 sm:p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {products.map((product) => (
                <POSProductCard
                  key={product.id}
                  product={product}
                  quantity={getProductCartQuantity(product.id)}
                  onAddClick={handleProductClick}
                  onQuantityChange={updateQuantity}
                />
              ))}

              {/* Skeleton Loaders while loading more - INSIDE grid */}
              {productsLoading && products.length > 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}

              {/* Loading Button for more products - INSIDE grid */}
              {productsLoading && products.length > 0 && (
                <div className="col-span-full flex items-center justify-center py-4">
                  <Button disabled className="gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more products...
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
          } lg:flex w-full lg:w-[380px] xl:w-[420px] h-full flex-col bg-card border-l shrink-0 ${
            showCart && "fixed inset-0 z-50 lg:relative lg:z-auto"
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20 shrink-0">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Current Order
              {cartSummary.totalQuantity > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {cartSummary.totalQuantity} items
                </Badge>
              )}
            </h2>
            <div className="flex items-center gap-1">
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-destructive hover:text-destructive h-7"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              {/* Close button on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 lg:hidden"
                onClick={() => setShowCart(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-15" />
                <p className="text-sm font-medium">No items yet</p>
                <p className="text-xs mt-1 text-center px-4">
                  Click on products to add them to the order
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Index */}
                    <span className="text-[10px] text-muted-foreground w-4 text-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Product Image */}
                    <CustomAvatar
                      imageUrl={item.productImageUrl}
                      name={item.productName}
                      size="sm"
                      enableImagePreview={false}
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.productName}
                      </p>
                      {item.sizeName && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                          {item.sizeName}
                        </span>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] font-semibold text-primary">
                          {formatCurrency(item.finalPrice)}
                        </span>
                        {item.hasActivePromotion && (
                          <span className="text-[9px] line-through text-muted-foreground">
                            {formatCurrency(item.currentPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-bold w-7 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[55px] shrink-0">
                      <p className="text-xs font-bold">
                        {formatCurrency(item.finalPrice * item.quantity)}
                      </p>
                    </div>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0"
                      onClick={() => handleEditCartItem(item)}
                      title="Edit size"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* ─── Checkout Section ─── */}
          <div className="border-t bg-muted/10 shrink-0">
            {/* Payment Method - Quick Select */}
            <div className="px-3 pt-3 pb-2">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Payment Method
              </Label>
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                        paymentMethod === m.value
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] leading-none">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="px-3 pb-2">
              <Textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Add order note..."
                rows={2}
                className="text-xs resize-none bg-background"
              />
            </div>

            {/* Totals */}
            <div className="px-3 py-2 space-y-1 bg-muted/30 mx-3 rounded-lg mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Subtotal ({cartSummary.totalQuantity} items)
                </span>
                <span className="font-medium">
                  {formatCurrency(cartSummary.subtotalBeforeDiscount)}
                </span>
              </div>
              {cartSummary.totalDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500 font-medium">
                    -{formatCurrency(cartSummary.totalDiscount)}
                  </span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(cartSummary.finalTotal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-3 pb-3">
              <Button
                className="w-full font-bold h-12 text-base shadow-lg"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ReceiptText className="w-5 h-5 mr-2" />
                )}
                Place Order
                {cartSummary.finalTotal > 0 && (
                  <span className="ml-2">
                    ({formatCurrency(cartSummary.finalTotal)})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Size Picker Modal ─── */}
      <Dialog
        open={!!sizePickerProduct}
        onOpenChange={() => {
          setSizePickerProduct(null);
          setEditingCartItemId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              {editingCartItemId ? "Edit Size" : "Select Size"} - {sizePickerProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {/* Option: Add base product without size */}
            {sizePickerProduct &&
              parseFloat(String(sizePickerProduct.price || 0)) > 0 && (
                <button
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
                  onClick={() => {
                    if (sizePickerProduct) {
                      addToCart(sizePickerProduct, undefined, editingCartItemId || undefined);
                      setSizePickerProduct(null);
                    }
                  }}
                >
                  <span className="text-sm font-medium">Regular</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {formatCurrency(
                        sizePickerProduct.displayPrice ||
                          parseFloat(String(sizePickerProduct.price || 0))
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              )}
            {/* Size options */}
            {sizePickerProduct?.sizes
              ?.filter((s) => s.id)
              .map((size) => (
                <button
                  key={size.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
                  onClick={() => {
                    if (sizePickerProduct) {
                      addToCart(sizePickerProduct, size, editingCartItemId || undefined);
                      setSizePickerProduct(null);
                    }
                  }}
                >
                  <span className="text-sm font-medium">{size.name}</span>
                  <div className="flex items-center gap-2">
                    {size.hasPromotion ? (
                      <>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(size.finalPrice)}
                        </span>
                        <span className="text-xs line-through text-muted-foreground">
                          {formatCurrency(size.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold">
                        {formatCurrency(size.price)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Order Success Modal ─── */}
      <Dialog
        open={!!successOrder}
        onOpenChange={() => setSuccessOrder(null)}
      >
        <DialogContent className="max-w-xs text-center">
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-600 mb-1">
              Order Created!
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Order #{successOrder?.orderNumber}
            </p>
            <p className="text-2xl font-bold mb-6">
              {successOrder && formatCurrency(successOrder.total)}
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSuccessOrder(null);
                  router.push(ROUTES.ADMIN.ORDERS);
                }}
              >
                View Orders
              </Button>
              <Button
                className="flex-1"
                onClick={() => setSuccessOrder(null)}
              >
                New Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

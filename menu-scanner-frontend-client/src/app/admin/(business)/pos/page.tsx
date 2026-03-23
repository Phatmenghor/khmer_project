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
  Maximize2,
  Minimize2,
  ReceiptText,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronsUpDown,
  Check,
  Ruler,
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

  // ─── Fullscreen State ───
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // ─── Cart Logic ───
  const addToCart = useCallback(
    (product: ProductDetailResponseModel, size?: ProductSize) => {
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
        const existing = prev.find((item) => item.id === cartId);
        if (existing) {
          return prev.map((item) =>
            item.id === cartId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
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
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const containerClass = isFullscreen
    ? "fixed inset-0 z-[100] bg-background flex flex-col"
    : "flex flex-col h-[calc(100vh-64px)] -m-2 md:-m-4";

  return (
    <div className={containerClass}>
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ReceiptText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">POS Terminal</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cart toggle for mobile */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden relative"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="w-4 h-4" />
            {cartSummary.totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartSummary.totalQuantity}
              </span>
            )}
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen (F11)" : "Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Categories Sidebar ─── */}
        <div className="hidden md:flex md:w-[140px] flex-col border-r bg-muted/30 shrink-0">
          {/* Search Bar */}
          <div className="relative p-3 border-b shrink-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search..."
              className="pl-10 h-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories List */}
          <ScrollArea className="flex-1">
            <div className="px-2 py-3 space-y-1">
              {/* All Categories */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                All Categories
              </button>

              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2 text-center">
                  No categories
                </p>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory?.id === category.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    title={category.name}
                  >
                    <span className="line-clamp-1">{category.name}</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ─── CENTER: Product Section ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Brand Filter Bar */}
          <div className="flex flex-wrap items-end gap-2 p-3 border-b bg-muted/20 shrink-0 md:hidden">
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
          </div>

          {/* Brand Filter & Search for Desktop */}
          <div className="flex items-end gap-2 p-3 border-b bg-muted/20 shrink-0 hidden md:flex">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">
                Search Products
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="pl-10 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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

          {/* Product Grid */}
          <ScrollArea className="flex-1" ref={productGridRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
              {products.map((product) => {
                const qtyInCart = getProductCartQuantity(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={cn(
                      "group relative bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer",
                      qtyInCart > 0 && "ring-1 ring-primary/30 border-primary/50",
                      product.hasActivePromotion && "ring-1 ring-amber-500/20"
                    )}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-8 h-8 opacity-30" />
                        </div>
                      )}

                      {/* Promotion Badge - Top Left */}
                      {product.hasActivePromotion && (
                        <div className="absolute top-2 left-2 z-10 pointer-events-none">
                          <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5 shadow-md">
                            {product.displayPromotionType === "PERCENTAGE"
                              ? `-${product.displayPromotionValue}%`
                              : `-${formatCurrency(product.displayPromotionValue)}`}
                          </Badge>
                        </div>
                      )}

                      {/* Sizes Badge - Bottom Left */}
                      {product.hasSizes && (
                        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                          <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
                            <Ruler className="h-3 w-3" />
                            Sizes
                          </Badge>
                        </div>
                      )}

                      {/* Quantity Badge - Top Right */}
                      {qtyInCart > 0 && (
                        <div className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-md">
                          {qtyInCart}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug min-h-[40px]">
                        {product.name}
                      </h3>

                      <div className="mt-auto">
                        {/* Prices */}
                        <div className="flex flex-col mb-2.5">
                          <span className={cn("text-xs text-muted-foreground line-through", !product.hasActivePromotion && "invisible")}>
                            {formatCurrency(product.displayOriginPrice)}
                          </span>
                          <span className="text-base font-bold text-primary">
                            {formatCurrency(product.displayPrice || parseFloat(String(product.price || 0)))}
                          </span>
                        </div>

                        {/* Add/Cart Controls */}
                        {qtyInCart > 0 ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(`${product.id}`, -1);
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center">
                              {qtyInCart}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(`${product.id}`, 1);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full gap-1.5 h-8 text-xs font-semibold"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            size="sm"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Load More */}
            {hasMoreProducts && (
              <div className="flex justify-center p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreProducts}
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Load More Products
                </Button>
              </div>
            )}

            {!productsLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Package className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {productsLoading && products.length === 0 && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ─── RIGHT: Cart & Checkout Panel ─── */}
        <div
          className={`${
            showCart ? "flex" : "hidden"
          } lg:flex w-full lg:w-[380px] xl:w-[420px] flex-col bg-card border-l shrink-0 ${
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

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem(item.id)}
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
        onOpenChange={() => setSizePickerProduct(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Select Size - {sizePickerProduct?.name}
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
                      addToCart(sizePickerProduct);
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
                      addToCart(sizePickerProduct, size);
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

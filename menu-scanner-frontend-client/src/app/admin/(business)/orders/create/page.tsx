"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Trash2, ShoppingCart, X, ArrowLeft } from "lucide-react";
import { OrderFromEnum } from "@/enums/order.enum";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ActionButton } from "@/components/shared/button/action-button";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

// ─── Local Cart Types ───
interface PosCartItem {
  id: string; // unique key: productId or productId-sizeId
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
  { value: "CASH", label: "Cash" },
];

export default function PosOrderPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ─── Product State ───
  const [products, setProducts] = useState<ProductDetailResponseModel[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoriesResponseModel | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // ─── Cart State ───
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);

  // ─── Order State ───
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Size Picker Modal ───
  const [sizePickerProduct, setSizePickerProduct] = useState<ProductDetailResponseModel | null>(null);

  // ─── Fetch Products ───
  const fetchProducts = useCallback(
    async (page: number, search: string, categoryId?: string, reset = false) => {
      try {
        setProductsLoading(true);
        const response = await axiosClientWithAuth.post("/api/v1/products/admin/all", {
          search: search || undefined,
          categoryId: categoryId || undefined,
          pageNo: page,
          pageSize: 20,
          status: "ACTIVE",
        });
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
    fetchProducts(1, debouncedSearch, selectedCategory?.id, true);
  }, [debouncedSearch, selectedCategory, fetchProducts]);

  const loadMoreProducts = () => {
    if (hasMoreProducts && !productsLoading) {
      fetchProducts(productPage + 1, debouncedSearch, selectedCategory?.id);
    }
  };

  // ─── Cart Logic ───
  const addToCart = useCallback(
    (product: ProductDetailResponseModel, size?: ProductSize) => {
      const cartId = size ? `${product.id}-${size.id}` : product.id;
      const currentPrice = size ? size.price : parseFloat(String(product.displayOriginPrice || product.price || 0));
      const finalPrice = size
        ? size.finalPrice || size.price
        : product.displayPrice || parseFloat(String(product.price || 0));
      const hasPromo = size ? size.hasPromotion : product.hasActivePromotion;

      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === cartId);
        if (existing) {
          return prev.map((item) =>
            item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
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
            promotionType: size?.promotionType || product.displayPromotionType || null,
            promotionValue: size?.promotionValue || product.displayPromotionValue || null,
            promotionFromDate: size?.promotionFromDate || product.displayPromotionFromDate || null,
            promotionToDate: size?.promotionToDate || product.displayPromotionToDate || null,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
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
    let discountAmount = 0;

    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      const beforeDiscount = item.currentPrice * item.quantity;
      const afterDiscount = item.finalPrice * item.quantity;
      subtotalBeforeDiscount += beforeDiscount;
      subtotal += afterDiscount;
      discountAmount += beforeDiscount - afterDiscount;
    });

    return {
      totalItems,
      totalQuantity,
      subtotalBeforeDiscount,
      subtotal,
      discountAmount,
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
          discountAmount: cartSummary.discountAmount,
          finalTotal: cartSummary.finalTotal,
        },
        payment: {
          paymentMethod: paymentMethod,
          paymentStatus: "PAID" as const,
        },
        customerNote: customerNote || "",
        orderFrom: OrderFromEnum.BUSINESS,
        orderStatus: OrderStatus.CONFIRMED,
      };

      const response = await axiosClientWithAuth.post("/api/v1/orders/checkout", payload);
      const order = response.data.data;

      showToast.success(`Order #${order.orderNumber} created successfully!`);
      clearCart();
      setCustomerNote("");
      router.push(ROUTES.ADMIN.ORDERS);
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <ActionButton
          size="icon"
          icon={<ArrowLeft className="w-5 h-5" />}
          tooltip="Back to Orders"
          onClick={() => router.push(ROUTES.ADMIN.ORDERS)}
          variant="ghost"
        />
        <h1 className="text-lg font-bold">POS - Create Order</h1>
        <Badge variant="outline" className="ml-2">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {cartSummary.totalQuantity} items
        </Badge>
      </div>

      {/* Main Content: Products Left, Cart Right */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Product Grid ─── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-end gap-2 p-3 border-b bg-muted/30">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-auto flex-shrink-0 [&_.space-y-2]:!w-auto [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]">
              <ComboboxSelectCategories
                dataSelect={selectedCategory}
                onChangeSelected={setSelectedCategory}
                placeholder="All Categories"
                showAllOption={true}
                label=""
              />
            </div>
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="flex flex-col items-center p-2 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all duration-150 text-left group cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-md overflow-hidden bg-muted mb-2">
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 w-full text-center">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {product.hasActivePromotion ? (
                      <>
                        <span className="text-xs font-bold text-green-600">
                          {formatCurrency(product.displayPrice)}
                        </span>
                        <span className="text-[10px] line-through text-muted-foreground">
                          {formatCurrency(product.displayOriginPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold">
                        {formatCurrency(product.displayPrice || parseFloat(String(product.price || 0)))}
                      </span>
                    )}
                  </div>
                  {product.hasSizes && (
                    <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                      Sizes
                    </Badge>
                  )}
                </button>
              ))}
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
                  Load More
                </Button>
              </div>
            )}

            {!productsLoading && products.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No products found
              </div>
            )}

            {productsLoading && products.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ─── RIGHT: Cart & Checkout ─── */}
        <div className="w-[380px] flex flex-col bg-card border-l shrink-0">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cartSummary.totalQuantity})
            </h2>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-destructive">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No items in cart</p>
                <p className="text-xs mt-1">Click products to add</p>
              </div>
            ) : (
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-3">
                    {/* Product Image */}
                    <CustomAvatar
                      imageUrl={item.productImageUrl}
                      name={item.productName}
                      size="sm"
                      enableImagePreview={false}
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.productName}</p>
                      {item.sizeName && (
                        <span className="text-[10px] text-muted-foreground">{item.sizeName}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-green-600">
                          {formatCurrency(item.finalPrice)}
                        </span>
                        {item.hasActivePromotion && (
                          <span className="text-[10px] line-through text-muted-foreground">
                            {formatCurrency(item.currentPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs font-semibold">
                        {formatCurrency(item.finalPrice * item.quantity)}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Checkout Section */}
          <div className="border-t bg-muted/30">
            {/* Payment Method */}
            <div className="px-4 pt-3 pb-2">
              <Label className="text-xs">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="px-4 pb-2">
              <Label className="text-xs">Note</Label>
              <Textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Order note..."
                rows={2}
                className="text-xs mt-1 resize-none"
              />
            </div>

            {/* Totals */}
            <div className="px-4 py-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cartSummary.subtotalBeforeDiscount)}</span>
              </div>
              {cartSummary.discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500">-{formatCurrency(cartSummary.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(cartSummary.finalTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-4 pb-4 pt-1">
              <Button
                className="w-full font-semibold"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                Place Order ({formatCurrency(cartSummary.finalTotal)})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Size Picker Modal ─── */}
      <Dialog open={!!sizePickerProduct} onOpenChange={() => setSizePickerProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Select Size - {sizePickerProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {/* Option: Add base product without size */}
            {sizePickerProduct && parseFloat(String(sizePickerProduct.price || 0)) > 0 && (
              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                onClick={() => {
                  if (sizePickerProduct) {
                    addToCart(sizePickerProduct);
                    setSizePickerProduct(null);
                  }
                }}
              >
                <span className="text-sm font-medium">Regular</span>
                <span className="text-sm font-bold">
                  {formatCurrency(
                    sizePickerProduct.displayPrice || parseFloat(String(sizePickerProduct.price || 0))
                  )}
                </span>
              </button>
            )}
            {/* Size options */}
            {sizePickerProduct?.sizes
              ?.filter((s) => s.id)
              .map((size) => (
                <button
                  key={size.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
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
                      <span className="text-sm font-bold">{formatCurrency(size.price)}</span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

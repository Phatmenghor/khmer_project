"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { TextField } from "@/components/shared/form-field/text-field";

import { Edit } from "lucide-react";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import {
  createProductStockService,
  getProductStockHistoryService,
  deleteProductStockService,
  updateProductStockService,
} from "../store/thunks/stock-management-thunks";
import {
  clearError,
  clearSuccess,
} from "../store/slice/stock-management-slice";
import { fetchProductByIdService } from "../store/thunks/product-thunks";
import { ProductDetailResponseModel, ProductSize } from "../store/models/response/product-response";
import { ProductStockDto } from "../store/models/response/stock-response";
import { createStockHistoryColumns } from "../table/product-stock-history-table";
import { createSizeStockHistoryColumns } from "../table/size-stock-history-table";

const stockFormSchema = z.object({
  quantityOnHand: z.string({ required_error: "Quantity is required" })
    .min(1, "Quantity is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a valid number >= 0"),
  priceIn: z.string({ required_error: "Price is required" })
    .min(1, "Price is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be greater than 0"),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
});

type StockFormData = z.infer<typeof stockFormSchema>;

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductDetailResponseModel | null;
  productId?: string;
  initialSizeId?: string;
  hideSizeSelector?: boolean;
}

export function StockManagementModal({
  isOpen,
  onClose,
  product,
  productId,
  initialSizeId,
  hideSizeSelector = false,
}: StockManagementModalProps) {
  const dispatch = useAppDispatch();
  const { history, isLoading, isCreating, isUpdating, isDeleting, error, successMessage } =
    useAppSelector((state) => state.stockManagement);
  
  const [fetchedProduct, setFetchedProduct] = useState<ProductDetailResponseModel | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [historyPageNo, setHistoryPageNo] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [editingStock, setEditingStock] = useState<ProductStockDto | null>(null);
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    stock: null as ProductStockDto | null,
  });
  const formSectionRef = useRef<HTMLDivElement>(null);

  const effectiveProductId = product?.id || productId;

  useEffect(() => {
    if (isOpen && productId && (!product || product.id !== productId)) {
      dispatch(fetchProductByIdService(productId))
        .unwrap()
        .then((res: ProductDetailResponseModel) => {
          setFetchedProduct(res);
        })
        .catch(() => {});
    } else if (!isOpen) {
      setFetchedProduct(null);
    }
  }, [isOpen, productId, product, dispatch]);

  const activeProduct = product || fetchedProduct;
  const hasSizes = Boolean(activeProduct?.sizes && activeProduct.sizes.length > 0);

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockFormSchema),
    mode: "onChange",
    defaultValues: {
      quantityOnHand: "",
      priceIn: "",
      expiryDate: "",
      location: "",
    },
  });

  // Sync selected size based on activeProduct and initialSizeId
  useEffect(() => {
    if (isOpen && activeProduct?.sizes && activeProduct.sizes.length > 0) {
      if (initialSizeId) {
        const matchSize = activeProduct.sizes.find((s) => s.id === initialSizeId);
        if (matchSize) {
          setSelectedSize(matchSize);
          return;
        }
      }
      if (!selectedSize || !activeProduct.sizes.some((s) => s.id === selectedSize.id)) {
        setSelectedSize(activeProduct.sizes[0]);
      }
    } else if (!hasSizes) {
      setSelectedSize(null);
    }
  }, [isOpen, activeProduct, hasSizes, initialSizeId]);

  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      dispatch(clearSuccess());
      setEditingStock(null);
      form.reset({
        quantityOnHand: "",
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    }
  }, [successMessage, dispatch, form]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isOpen && effectiveProductId) {
      dispatch(
        getProductStockHistoryService({
          pageNo: historyPageNo,
          pageSize: historyPageSize,
          productId: effectiveProductId,
        })
      );
    }
  }, [isOpen, effectiveProductId, dispatch, historyPageNo, historyPageSize]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantityOnHand: "",
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    } else {
      setEditingStock(null);
      setSelectedSize(null);
      form.reset({
        quantityOnHand: "",
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    }
  }, [isOpen, form]);

  const handleCreateStock = async (data: StockFormData) => {
    if (editingStock) return handleUpdateStock(data);
    if (!activeProduct?.id) return;
    if (hasSizes && !selectedSize) {
      showToast.error("Please select a size first");
      return;
    }

    const formattedExpiryDate = data.expiryDate
      ? (data.expiryDate.length === 10 ? `${data.expiryDate}T00:00:00` : data.expiryDate)
      : undefined;

    dispatch(
      createProductStockService({
        productId: activeProduct.id,
        productSizeId: hasSizes ? selectedSize?.id : undefined,
        quantityOnHand: parseFloat(data.quantityOnHand),
        priceIn: parseFloat(data.priceIn),
        expiryDate: formattedExpiryDate,
        location: data.location || undefined,
      })
    );
  };

  const handleDeleteStock = (stock: ProductStockDto) => {
    setDeleteState({
      isOpen: true,
      stock,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      stock: null,
    });
  };

  const confirmDelete = async () => {
    if (deleteState.stock?.id) {
      await dispatch(deleteProductStockService(deleteState.stock.id));
      closeDeleteModal();
    }
  };

  const handleEditStock = (stock: ProductStockDto) => {
    setEditingStock(stock);

    // If stock history record is tied to a specific size, sync selectedSize
    if (stock.productSizeId && activeProduct?.sizes) {
      const matchSize = activeProduct.sizes.find((s) => s.id === stock.productSizeId);
      if (matchSize) setSelectedSize(matchSize);
    }

    form.reset({
      quantityOnHand: stock.quantityOnHand?.toString() || "",
      priceIn: stock.priceIn?.toString() || "",
      expiryDate: stock.expiryDate || "",
      location: stock.location || "",
    });

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleUpdateStock = async (data: StockFormData) => {
    if (!editingStock) return;
    const formattedExpiryDate = data.expiryDate
      ? (data.expiryDate.length === 10 ? `${data.expiryDate}T00:00:00` : data.expiryDate)
      : undefined;

    dispatch(
      updateProductStockService({
        stockId: editingStock.id,
        request: {
          quantityOnHand: parseFloat(data.quantityOnHand),
          priceIn: parseFloat(data.priceIn),
          expiryDate: formattedExpiryDate,
          location: data.location || undefined,
        },
      })
    );
  };

  const stockHistoryColumns = hasSizes
    ? createSizeStockHistoryColumns(handleEditStock, handleDeleteStock, isDeleting)
    : createStockHistoryColumns(handleEditStock, handleDeleteStock, isDeleting);

  // Selling price & revenue preview calculations
  const previewSellingPrice = hasSizes && selectedSize
    ? (selectedSize.hasPromotion ? selectedSize.finalPrice : selectedSize.price)
    : (activeProduct?.hasPromotion === true ? (activeProduct.displayPrice || 0) : ((activeProduct?.price as unknown as number) || 0));

  const previewOriginalPrice = hasSizes && selectedSize
    ? selectedSize.price
    : ((activeProduct?.price as unknown as number) || 0);

  const previewHasPromotion = hasSizes && selectedSize
    ? selectedSize.hasPromotion
    : Boolean(activeProduct?.hasPromotion === true);

  const watchQuantity = parseFloat(form.watch("quantityOnHand") || "0") || 0;
  const watchPriceIn = parseFloat(form.watch("priceIn") || "0") || 0;

  const totalCost = watchQuantity * watchPriceIn;
  const totalRevenue = watchQuantity * previewSellingPrice;
  const netProfit = totalRevenue - totalCost;
  const unitProfit = previewSellingPrice - watchPriceIn;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="7xl">
      <FormHeader
        title="Stock Management"
        description={
          activeProduct?.name
            ? hasSizes && selectedSize
              ? `${activeProduct.name} — Size: ${selectedSize.name}`
              : activeProduct.name
            : "---"
        }
        showAvatar={true}
        avatarName={activeProduct?.name || "Product"}
        avatarImageUrl={activeProduct?.mainImage?.md || activeProduct?.mainImage?.sm}
        isCreate={!editingStock}
      />

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* Group 1: Stock Entry Form */}
          <Card ref={formSectionRef} className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{editingStock ? "Update Stock" : "Add New Stock"}</span>
                  {hasSizes && selectedSize && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Variant: {selectedSize.name}
                    </span>
                  )}
                </CardTitle>
                {editingStock && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                    Editing STK-{editingStock.createdAt ? editingStock.createdAt.slice(0, 10).replace(/-/g, "") : "BATCH"}-{editingStock.id?.slice(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form id="stock-form" onSubmit={form.handleSubmit(handleCreateStock)}>
                {/* Fixed Size Variant Summary Banner when opened from item row */}
                {hasSizes && selectedSize && (hideSizeSelector || (initialSizeId && !editingStock)) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Selected Variant:</span>
                      <span className="text-xs font-bold text-primary">{selectedSize.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">Selling: <span className="font-semibold text-foreground">${selectedSize.finalPrice}</span></span>
                      <span className="text-muted-foreground">Current Stock: <span className="font-bold text-emerald-600">{selectedSize.totalStock ?? 0} items</span></span>
                    </div>
                  </div>
                )}

                {/* Interactive Size selector when opened from product level */}
                {hasSizes && activeProduct?.sizes && !hideSizeSelector && (!initialSizeId || editingStock) && (
                  <div className="space-y-1.5 mb-3.5">
                    <label className="text-xs font-semibold text-foreground flex items-center min-h-[16px]">
                      <span>Select Size</span>
                      <span className="text-destructive ml-0.5">*</span>
                    </label>
                    <Select
                      value={selectedSize?.id || ""}
                      onValueChange={(id) => {
                        const size = activeProduct.sizes?.find((s) => s.id === id);
                        if (size) setSelectedSize(size);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs w-full rounded-[10px] bg-background border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Choose a size variant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProduct.sizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            <div className="flex items-center justify-between gap-3 w-full text-xs py-0.5">
                              <span className="font-bold text-foreground">{size.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">(${size.finalPrice})</span>
                                <span className="text-[11px] font-bold text-emerald-600">
                                  Stock: {size.totalStock ?? 0}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    control={form.control}
                    name="quantityOnHand"
                    label="Quantity On Hand"
                    placeholder="Enter quantity on hand"
                    required
                    error={form.formState.errors.quantityOnHand}
                    inputClassName="h-9 text-xs"
                  />

                  <TextField
                    control={form.control}
                    name="priceIn"
                    label="Unit Price ($)"
                    placeholder="Enter unit price"
                    required
                    error={form.formState.errors.priceIn}
                    inputClassName="h-9 text-xs"
                  />

                  <DateTimePickerField
                    control={form.control}
                    name="expiryDate"
                    label="Expiry Date"
                    mode="date"
                    placeholder="Select expiry date"
                    error={form.formState.errors.expiryDate}
                    inputClassName="h-9 text-xs"
                  />

                  <TextField
                    control={form.control}
                    name="location"
                    label="Storage Location"
                    placeholder="Enter storage location"
                    error={form.formState.errors.location}
                    inputClassName="h-9 text-xs"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Group 2: Sales Preview & Financial Calculator */}
          <Card className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">
                Sales Preview & Financial Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Left Card: Unit Pricing & Profit Margin */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Pricing & Unit Economics</span>
                    {previewHasPromotion && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        On Sale
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Selling Price</span>
                      <span className="font-bold text-foreground">${previewOriginalPrice.toFixed(2)}</span>
                    </div>

                    {previewHasPromotion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Discounted Price</span>
                        <span className="font-bold text-emerald-600">${previewSellingPrice.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Unit Cost (Price In)</span>
                      <span className="font-semibold text-foreground">${watchPriceIn.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Est. Unit Profit</span>
                    <span className={`font-extrabold ${unitProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {unitProfit >= 0 ? `+$${unitProfit.toFixed(2)}` : `-$${Math.abs(unitProfit).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Right Card: Total Stock Revenue & Gross Profit Calculator */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Revenue & Profit Forecast</span>
                    {watchQuantity > 0 && totalRevenue > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        profitMarginPercent >= 0
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}>
                        {profitMarginPercent.toFixed(1)}% Margin
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Quantity On Hand</span>
                      <span className="font-bold text-foreground">{watchQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Unit Selling Price</span>
                      <span className="font-bold text-foreground">${previewSellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Total Stock Cost</span>
                      <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Est. Total Revenue</span>
                      <span className="font-extrabold text-foreground">${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Est. Net Profit</span>
                      <span className={`font-black text-sm ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group 3: Stock History Table */}
          <Card className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">
                Stock History Log {hasSizes && selectedSize ? `— ${selectedSize.name}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <DataTableWithPagination
                  data={history?.content || []}
                  columns={stockHistoryColumns}
                  loading={isLoading}
                  emptyMessage="No stock history found"
                  currentPage={historyPageNo}
                  totalPages={history?.totalPages || 1}
                  totalElements={history?.totalElements || 0}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPageNo}
                  onPageSizeChange={setHistoryPageSize}
                  pageSizeOptions={[10, 20, 50]}
                  showPageSizeSelector={true}
                  showPagination={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 border-t border-border/70 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          {!editingStock && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {(isCreating || isUpdating) && (
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
              {form.formState.isDirty && !isCreating && !isUpdating && (
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
              <span className="font-medium">
                {isCreating || isUpdating
                  ? "Creating stock..."
                  : form.formState.isDirty
                  ? "You have unsaved changes"
                  : "Fill in the form to create stock"}
              </span>
            </div>
          )}

          {editingStock && (
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingStock(null);
                form.reset({
                  quantityOnHand: "",
                  priceIn: "",
                  expiryDate: "",
                  location: "",
                });
                setTimeout(() => {
                  formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }}
              disabled={isCreating || isUpdating}
              className="gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all text-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              Switch to Add
            </CustomButton>
          )}
          <div className="flex-1" />

          {editingStock && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {isUpdating && (
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
              {form.formState.isDirty && !isUpdating && (
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
              <span className="font-medium">
                {isUpdating
                  ? "Updating stock..."
                  : form.formState.isDirty
                  ? "You have unsaved changes"
                  : "All changes saved"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <CancelButton
              onClick={() => {
                if (editingStock) {
                  setEditingStock(null);
                  form.reset({
                    quantityOnHand: "",
                    priceIn: "",
                    expiryDate: "",
                    location: "",
                  });
                } else {
                  onClose();
                }
              }}
              disabled={isCreating || isUpdating}
              text={editingStock ? "Cancel" : "Close"}
            />
            <SubmitButton
              isSubmitting={isCreating || isUpdating}
              isDirty={form.formState.isDirty}
              isCreate={!editingStock}
              createText="Create Stock"
              updateText="Update Stock"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
              onClick={() => form.handleSubmit(handleCreateStock)()}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={confirmDelete}
        title="Delete Stock Entry"
        description="Are you sure you want to delete this stock record? This action cannot be undone."
        itemName={`${deleteState.stock?.quantityOnHand} items @ $${deleteState.stock?.priceIn}`}
        isSubmitting={isDeleting}
        variant="critical"
      />
    </CustomModal>
  );
}

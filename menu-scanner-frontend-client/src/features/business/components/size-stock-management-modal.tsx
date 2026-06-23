"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/components/shared/common/show-toast";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { TextField } from "@/components/shared/form-field/text-field";


import { Package, Edit } from "lucide-react";
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
import { ProductDetailResponseModel, ProductSize } from "../store/models/response/product-response";
import { ProductStockDto } from "../store/models/response/stock-response";
import { createSizeStockHistoryColumns } from "../table/size-stock-history-table";

const stockFormSchema = z.object({
  quantityOnHand: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Quantity is required",
  }).min(0, "Must be >= 0"),
  priceIn: z.string({ required_error: "Price is required" })
    .min(1, "Price is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be greater than 0"),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
});

type StockFormData = z.infer<typeof stockFormSchema>;

interface SizeStockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailResponseModel | null;
}

export function SizeStockManagementModal({
  isOpen,
  onClose,
  product,
}: SizeStockManagementModalProps) {
  const dispatch = useAppDispatch();
  const { history, isLoading, isCreating, isUpdating, isDeleting, error, successMessage } =
    useAppSelector((state) => state.stockManagement);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [historyPageNo, setHistoryPageNo] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [editingStock, setEditingStock] = useState<ProductStockDto | null>(null);
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    stock: null as ProductStockDto | null,
  });
  const formSectionRef = useRef<HTMLDivElement>(null);

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockFormSchema),
    mode: "onChange",
    defaultValues: {
      quantityOnHand: undefined as unknown as number,
      priceIn: "",
      expiryDate: "",
      location: "",
    },
  });


  useEffect(() => {
    if (isOpen && product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [isOpen, product, selectedSize]);


  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      dispatch(clearSuccess());
      setEditingStock(null);
      form.reset({
        quantityOnHand: undefined as unknown as number,
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
    if (isOpen && product) {
      dispatch(
        getProductStockHistoryService({
          pageNo: historyPageNo,
          pageSize: historyPageSize,
          productId: product.id,
        })
      );
    }
  }, [isOpen, product, dispatch, historyPageNo, historyPageSize]);


  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantityOnHand: undefined as unknown as number,
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    } else {
      setEditingStock(null);
      setSelectedSize(null);
      form.reset({
        quantityOnHand: undefined as unknown as number,
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    }
  }, [isOpen, form]);

  const handleCreateStock = async (data: StockFormData) => {
    if (editingStock) return handleUpdateStock(data);
    if (!product || !selectedSize) return;
    const formattedExpiryDate = data.expiryDate
      ? (data.expiryDate.length === 10 ? `${data.expiryDate}T00:00:00` : data.expiryDate)
      : undefined;
    dispatch(createProductStockService({
      productId: product.id || "",
      productSizeId: selectedSize.id,
      quantityOnHand: data.quantityOnHand,
      priceIn: parseFloat(data.priceIn),
      expiryDate: formattedExpiryDate,
      location: data.location || undefined,
    }));
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
    form.reset({
      quantityOnHand: stock.quantityOnHand,
      priceIn: stock.priceIn?.toString(),
      expiryDate: stock.expiryDate,
      location: stock.location,
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
    dispatch(updateProductStockService({
      stockId: editingStock.id,
      request: {
        quantityOnHand: data.quantityOnHand,
        priceIn: parseFloat(data.priceIn),
        expiryDate: formattedExpiryDate,
        location: data.location || undefined,
      },
    }));
  };

  const stockHistoryColumns = createSizeStockHistoryColumns(
    handleEditStock,
    handleDeleteStock,
    isDeleting
  );

  if (!product || !product.sizes || product.sizes.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">
        Size Stock Management - {product?.name}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden border bg-muted">
              {(product?.mainImage?.md || product?.mainImage?.sm) ? (
                <img
                  src={product.mainImage?.md || product.mainImage?.sm}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                Size Stock Management
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {product.name}
              </p>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  SKU: {product.sku || "---"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Total Sizes: {product.sizes?.length || 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">

            {selectedSize && (
              <Card ref={formSectionRef}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-sm">
                      <Package className="w-3.5 h-3.5" />
                      {editingStock ? "Update Stock" : "Add New Stock"} — {selectedSize.name}
                    </CardTitle>
                    {editingStock && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Editing
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <form id="size-stock-form" onSubmit={form.handleSubmit(handleCreateStock)}>
                    {/* Size selector */}
                    <div className="space-y-1.5 mb-3">
                      <label className="text-xs font-semibold text-foreground">
                        Select Size <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={selectedSize?.id}
                        onValueChange={(id) => {
                          const size = product.sizes?.find((s) => s.id === id);
                          if (size) setSelectedSize(size);
                        }}
                      >
                        <SelectTrigger className="h-[26px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.sizes?.map((size) => (
                            <SelectItem key={size.id} value={size.id}>
                              <div className="flex items-center gap-1">
                                <span>{size.name}</span>
                                <span className="text-xs text-muted-foreground">${size.finalPrice}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField
                        control={form.control}
                        name="quantityOnHand"
                        label="Quantity On Hand"
                        type="number"
                        placeholder="Enter quantity"
                        required
                        min={0}
                        step="1"
                        valueAsNumber={true}
                        allowZero={true}
                        error={form.formState.errors.quantityOnHand}
                      />

                      <TextField
                        control={form.control}
                        name="priceIn"
                        label="Unit Price ($)"
                        placeholder="0.00"
                        required
                        error={form.formState.errors.priceIn}
                      />

                      <DateTimePickerField
                        control={form.control}
                        name="expiryDate"
                        label="Expiry Date"
                        mode="date"
                        error={form.formState.errors.expiryDate}
                        inputClassName="h-[26px]"
                      />

                      <TextField
                        control={form.control}
                        name="location"
                        label="Storage Location"
                        placeholder="e.g., Warehouse A, Shelf 3"
                        error={form.formState.errors.location}
                      />
                    </div>

                    {/* Sales Preview */}
                    {selectedSize && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-xs font-semibold text-foreground mb-2">Sales Preview</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="rounded border border-border/50 bg-muted/30 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Selling Price</span>
                              {selectedSize.hasPromotion && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">On Sale</span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-foreground">${selectedSize.price.toFixed(2)}</p>
                            {selectedSize.hasPromotion && (
                              <div className="pt-1.5 border-t border-border/40 space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Type</span>
                                  <span className="font-medium">{selectedSize.promotionType === "PERCENTAGE" ? "Percentage" : "Fixed"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Discount</span>
                                  <span className="font-medium text-red-600">
                                    {selectedSize.promotionType === "PERCENTAGE"
                                      ? `${selectedSize.promotionValue}%`
                                      : `$${(selectedSize.promotionValue || 0).toFixed(2)}`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Final</span>
                                  <span className="font-bold text-green-600">${selectedSize.finalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="rounded border border-border/50 bg-muted/30 p-2.5 space-y-1.5">
                            <span className="text-xs text-muted-foreground">Revenue Estimate</span>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qty</span>
                                <span className="font-medium">{form.watch("quantityOnHand") || 0} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price / unit</span>
                                <span className="font-medium">${(selectedSize.hasPromotion ? selectedSize.finalPrice : selectedSize.price).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost total</span>
                                <span className="font-medium">${((form.watch("quantityOnHand") || 0) * (parseFloat(form.watch("priceIn") || "0") || 0)).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-border/40 flex justify-between text-xs">
                              <span className="font-semibold">Total Revenue</span>
                              <span className="font-bold text-green-600">
                                ${((form.watch("quantityOnHand") || 0) * (selectedSize.hasPromotion ? selectedSize.finalPrice : selectedSize.price)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {}
            {selectedSize && (
              <Card>
                <CardHeader>
                  <CardTitle>Stock History - {selectedSize.name}</CardTitle>
                </CardHeader>
                <CardContent>
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
            )}
          </div>
        </div>

        {}
        <div className="px-4 py-3 border-t bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            {!editingStock && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {(isCreating || isUpdating) && (
                  <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                )}
                {form.formState.isDirty && !isCreating && !isUpdating && (
                  <div className="h-1 w-1 rounded-full bg-orange-500" />
                )}
                <span>
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
                    quantityOnHand: undefined,
                    priceIn: "",
                    expiryDate: "",
                    location: "",
                  });
                  setTimeout(() => {
                    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 0);
                }}
                disabled={isCreating || isUpdating}
                className="gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
              >
                <Edit className="w-3 h-3" />
                Switch to Add
              </CustomButton>
            )}
            <div className="flex-1" />

            {editingStock && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {isUpdating && (
                  <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                )}
                {form.formState.isDirty && !isUpdating && (
                  <div className="h-1 w-1 rounded-full bg-orange-500" />
                )}
                <span>
                  {isUpdating
                    ? "Updating stock..."
                    : form.formState.isDirty
                    ? "You have unsaved changes"
                    : "All changes saved"}
                </span>
              </div>
            )}

            <div className="flex gap-1">
                <CancelButton
                  onClick={() => {
                    if (editingStock) {
                      setEditingStock(null);
                      form.reset({
                        quantityOnHand: undefined as unknown as number,
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

        {}
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
      </DialogContent>
    </Dialog>
  );
}

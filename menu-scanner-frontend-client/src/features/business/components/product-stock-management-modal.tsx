"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/shared/common/show-toast";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { ActionButton } from "@/components/shared/button/action-button";
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
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { ProductStockDto, ProductStockItemDto } from "../store/models/response/stock-response";
import { createStockHistoryColumns } from "../table/product-stock-history-table";

interface StockFormData {
  quantityOnHand?: number;
  priceIn?: string;
  expiryDate?: string;
  location?: string;
}

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductDetailResponseModel | null;
}

export function StockManagementModal({
  isOpen,
  onClose,
  product,
}: StockManagementModalProps) {
  const dispatch = useAppDispatch();
  const { history, isLoading, isCreating, isUpdating, isDeleting, error, successMessage } =
    useAppSelector((state) => state.stockManagement);
  const [historyPageNo, setHistoryPageNo] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [editingStock, setEditingStock] = useState<ProductStockDto | null>(null);
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    stock: null as ProductStockDto | null,
  });
  const formSectionRef = useRef<HTMLDivElement>(null);

  const form = useForm<StockFormData>({
    mode: "onChange",
  });


  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      dispatch(clearSuccess());
      setEditingStock(null);
      form.reset({
        quantityOnHand: undefined,
        priceIn: undefined,
        expiryDate: undefined,
        location: undefined,
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
    if (isOpen && product?.id) {
      dispatch(
        getProductStockHistoryService({
          pageNo: historyPageNo,
          pageSize: historyPageSize,
          productId: product.id,
        })
      );
    }
  }, [isOpen, product?.id, dispatch, historyPageNo, historyPageSize]);


  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantityOnHand: undefined,
        priceIn: undefined,
        expiryDate: undefined,
        location: undefined,
      });
    } else {

      setEditingStock(null);
      form.reset({
        quantityOnHand: undefined,
        priceIn: undefined,
        expiryDate: undefined,
        location: undefined,
      });
    }
  }, [isOpen, form]);

  const handleCreateStock = async (data: StockFormData) => {

    if (editingStock) {
      return handleUpdateStock(data);
    }

    if (!product?.id) return;

    const quantity = Number(data.quantityOnHand);
    if (isNaN(quantity) || quantity < 0) {
      showToast.error(Messages.product.invalidQuantity);
      return;
    }


    const price = parseFloat(data.priceIn || "");
    if (isNaN(price) || price <= 0) {
      showToast.error(Messages.product.invalidPrice);
      return;
    }


    let formattedExpiryDate: string | undefined;
    if (data.expiryDate) {

      if (data.expiryDate.length === 10) {
        formattedExpiryDate = `${data.expiryDate}T00:00:00`;
      } else {
        formattedExpiryDate = data.expiryDate;
      }
    }

    dispatch(
      createProductStockService({
        productId: product.id,
        quantityOnHand: quantity,
        priceIn: price,
        expiryDate: formattedExpiryDate || undefined,
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

    const quantity = Number(data.quantityOnHand);
    if (isNaN(quantity) || quantity < 0) {
      showToast.error(Messages.product.invalidQuantity);
      return;
    }

    const price = parseFloat(data.priceIn || "");
    if (isNaN(price) || price <= 0) {
      showToast.error(Messages.product.invalidPrice);
      return;
    }


    let formattedExpiryDate: string | undefined;
    if (data.expiryDate) {
      if (data.expiryDate.length === 10) {
        formattedExpiryDate = `${data.expiryDate}T00:00:00`;
      } else {
        formattedExpiryDate = data.expiryDate;
      }
    }

    dispatch(
      updateProductStockService({
        stockId: editingStock.id,
        request: {
          quantityOnHand: quantity,
          priceIn: price,
          expiryDate: formattedExpiryDate || undefined,
          location: data.location || undefined,
        },
      })
    );
  };

  const stockHistoryColumns = createStockHistoryColumns(
    handleEditStock,
    handleDeleteStock,
    isDeleting
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">
        Stock Management - {product?.name}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden border bg-muted">
              {product?.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product?.name}
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
                Stock Management
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {product?.name}
              </p>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  SKU: {product?.sku || "---"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Barcode: {product?.barcode || "---"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">
            <Card ref={formSectionRef}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <Package className="w-3.5 h-3.5" />
                    {editingStock ? "Update Stock" : "Add New Stock"}
                  </CardTitle>
                  {editingStock && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Editing
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form id="stock-form" onSubmit={form.handleSubmit(handleCreateStock)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Quantity On Hand <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter quantity"
                        {...form.register("quantityOnHand", {
                          required: "Quantity is required",
                          validate: (value) => {
                            if (value === undefined || value === null) return "Quantity is required";
                            if (value < 0) return "Quantity must be >= 0";
                            return true;
                          },
                        })}
                      />
                      {form.formState.errors.quantityOnHand && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.quantityOnHand.message}
                        </p>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Unit Price (Cost) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                          $
                        </span>
                        <Input
                          type="text"
                          placeholder="0.00"
                          inputMode="decimal"
                          className="pl-6"
                          {...form.register("priceIn", {
                            required: "Price is required",
                            validate: (value) => {
                              if (!value) return "Price is required";
                              const num = parseFloat(value);
                              if (isNaN(num)) return "Must be a valid number";
                              if (num <= 0) return "Price must be greater than 0";
                              return true;
                            },
                          })}
                        />
                      </div>
                      {form.formState.errors.priceIn && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.priceIn.message}
                        </p>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <DateTimePickerField
                      control={form.control}
                      name="expiryDate"
                      label="Expiry Date"
                      mode="date"
                      error={form.formState.errors.expiryDate}
                      inputClassName="h-9"
                    />

                    {/* Location */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Storage Location
                      </Label>
                      <Input
                        placeholder="e.g., Warehouse A, Shelf 3"
                        {...form.register("location")}
                      />
                    </div>
                  </div>

                  {/* Sales Preview */}
                  {product && product.displayPrice && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs font-semibold text-foreground mb-2">Sales Preview</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Selling price / promotion */}
                        <div className="rounded border border-border/50 bg-muted/30 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Selling Price</span>
                            {product.hasPromotion === true && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">On Sale</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            ${(product.price as unknown as number).toFixed(2)}
                          </p>
                          {product.hasPromotion === true && (
                            <div className="pt-1.5 border-t border-border/40 space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium">
                                  {product.displayPromotionType === "PERCENTAGE" ? "Percentage" : "Fixed"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-red-600">
                                  {product.displayPromotionType === "PERCENTAGE"
                                    ? `${product.displayPromotionValue}%`
                                    : `$${(product.displayPromotionValue || 0).toFixed(2)}`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Final</span>
                                <span className="font-bold text-green-600">
                                  ${product.displayPrice?.toFixed(2)}
                                </span>
                              </div>
                              {product.displayPromotionFromDate && product.displayPromotionToDate && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Period</span>
                                  <span className="text-right">
                                    {dateTimeFormat(product.displayPromotionFromDate)} → {dateTimeFormat(product.displayPromotionToDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Revenue estimate */}
                        <div className="rounded border border-border/50 bg-muted/30 p-2.5 space-y-1.5">
                          <span className="text-xs text-muted-foreground">Revenue Estimate</span>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Qty</span>
                              <span className="font-medium">{form.watch("quantityOnHand") || 0} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price / unit</span>
                              <span className="font-medium">
                                ${(product.hasPromotion === true ? product.displayPrice : (product.price as unknown as number)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cost total</span>
                              <span className="font-medium">
                                ${((form.watch("quantityOnHand") || 0) * (parseFloat(form.watch("priceIn") || "0") || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-border/40 flex justify-between text-xs">
                            <span className="font-semibold">Total Revenue</span>
                            <span className="font-bold text-green-600">
                              ${(
                                (form.watch("quantityOnHand") || 0) *
                                (product.hasPromotion === true
                                  ? product.displayPrice
                                  : (product.price as unknown as number))
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>Stock History</CardTitle>
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
          </div>
        </div>

        {}
        <div className="px-4 py-3 border-t bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            {}
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

            {}
            {editingStock && (
              <Button
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
              </Button>
            )}
            <div className="flex-1" />

            {}
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

            {}
            <div className="flex gap-1">
                <CancelButton
                  onClick={() => {
                    setEditingStock(null);
                    form.reset({
                      quantityOnHand: undefined,
                      priceIn: "",
                      expiryDate: "",
                      location: "",
                    });
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

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
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
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
import { ProductStockItemDto, ProductStockDto } from "../store/models/response/stock-response";
import { createStockHistoryColumns } from "../table/product-stock-history-table";

interface StockFormData {
  quantityOnHand?: number;
  priceIn?: string;
  expiryDate?: string;
  location?: string;
}

interface StockItemManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem?: ProductStockItemDto;
}

export function StockItemManagementModal({
  isOpen,
  onClose,
  stockItem,
}: StockItemManagementModalProps) {
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


  const getTitle = () => {
    if (!stockItem) return "";
    if (stockItem.type === "SIZE") {
      return `${stockItem.productName} - ${stockItem.sizeName}`;
    }
    return stockItem.productName || "";
  };


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
    if (isOpen && stockItem) {
      dispatch(
        getProductStockHistoryService({
          pageNo: historyPageNo,
          pageSize: historyPageSize,
          productId: stockItem.productId,
          productSizeId: stockItem.type === "SIZE" ? stockItem.productSizeId : undefined,
        })
      );
    }
  }, [isOpen, stockItem, dispatch, historyPageNo, historyPageSize]);


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

    if (!stockItem) return;

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
        productId: stockItem.productId,
        productSizeId: stockItem.type === "SIZE" ? stockItem.productSizeId : undefined,
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

  if (!stockItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">
        Stock Management - {getTitle()}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden border bg-muted">
              {stockItem?.mainImageUrl ? (
                <img
                  src={stockItem.mainImageUrl}
                  alt={getTitle()}
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
                {getTitle()}
              </p>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  SKU: {stockItem?.sku || "---"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Barcode: {stockItem?.barcode || "---"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">
            {}
            <Card ref={formSectionRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {editingStock ? "Update Stock" : "Add New Stock"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleCreateStock)} className="space-y-2">
                  {}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">
                        Quantity On Hand <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter quantity"
                        className="h-6"
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
                      <p className="text-xs text-muted-foreground">
                        Total quantity available in stock
                      </p>
                    </div>

                    {}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">
                        Unit Price (Cost) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground">$</span>
                        <Input
                          type="text"
                          placeholder="0.00"
                          className="h-6 flex-1"
                          inputMode="decimal"
                          {...form.register("priceIn", {
                            required: "Price is required",
                            validate: (value) => {
                              if (!value) return "Price is required";
                              const num = parseFloat(value);
                              if (isNaN(num)) return "Price must be a valid number";
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
                      <p className="text-xs text-muted-foreground">
                        Cost per unit for inventory tracking
                      </p>
                    </div>

                    {}
                    <DateTimePickerField
                      control={form.control}
                      className="h-6"
                      name="expiryDate"
                      label="Expiry Date"
                      mode="date"
                      error={form.formState.errors.expiryDate}
                    />

                    {}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">
                        Storage Location
                      </Label>
                      <Input
                        placeholder="e.g., Warehouse A, Shelf 3"
                        className="h-6"
                        {...form.register("location")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Physical location in your warehouse/storage
                      </p>
                    </div>
                  </div>

                  {}
                  {stockItem && stockItem.price && (
                    <div className="border-t pt-4">
                      <h3 className="text-xs font-semibold mb-2">Sales Preview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {}
                        <div className="bg-muted/50 p-3 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-xs text-muted-foreground">Product Selling Price</p>
                              <p className="text-xs font-semibold text-foreground">
                                ${parseFloat(stockItem.price).toFixed(2)}
                              </p>
                            </div>
                            {stockItem.hasPromotion === true && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                On Sale
                              </Badge>
                            )}
                          </div>

                          {}
                          {stockItem.hasPromotion === true && (
                            <div className="mt-2 pt-2 border-t border-muted space-y-1 text-xs">
                              <div>
                                <p className="text-muted-foreground">Promotion Type:</p>
                                <p className="font-medium">
                                  {stockItem.displayPromotionType === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Discount:</p>
                                <p className="font-medium">
                                  {stockItem.displayPromotionType === "PERCENTAGE"
                                    ? `${stockItem.displayPromotionValue}%`
                                    : `$${parseFloat(stockItem.displayPromotionValue?.toString() || "0").toFixed(2)}`}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Valid Period:</p>
                                <p className="font-medium text-xs">
                                  {stockItem.displayPromotionFromDate && stockItem.displayPromotionToDate && (
                                    <>
                                      {dateTimeFormat(stockItem.displayPromotionFromDate)} →{" "}
                                      {dateTimeFormat(stockItem.displayPromotionToDate)}
                                    </>
                                  )}
                                </p>
                              </div>
                              <div className="pt-1 border-t">
                                <p className="text-muted-foreground">Final Price:</p>
                                <p className="text-xs font-semibold text-green-600">
                                  ${stockItem.displayPrice?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {}
                        <div className="bg-muted/50 p-3 rounded">
                          <p className="text-xs text-muted-foreground mb-2">Total Revenue (if sold all)</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="font-medium">
                                {form.watch("quantityOnHand") || 0} units
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Selling Price (each):</span>
                              <span className="font-medium">
                                ${(stockItem.hasPromotion === true ? (stockItem.displayPrice || 0) : parseFloat(stockItem.price)).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-muted flex justify-between">
                              <span className="font-semibold">Total Revenue:</span>
                              <span className="text-xs font-bold text-green-600">
                                ${(
                                  (form.watch("quantityOnHand") || 0) *
                                  (stockItem.hasPromotion === true ? (stockItem.displayPrice || 0) : parseFloat(stockItem.price))
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-1 flex justify-between text-xs text-muted-foreground">
                              <span>Cost Total:</span>
                              <span>
                                ${(
                                  (form.watch("quantityOnHand") || 0) *
                                  (parseFloat(form.watch("priceIn") || "0") || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
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

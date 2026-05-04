"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
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
import { ProductStockDto, ProductStockItemDto } from "../store/models/response/stock-response";
import { createStockHistoryColumns } from "../table/product-stock-history-table";

interface StockFormData {
  quantityOnHand?: number;
  priceIn?: string;
  expiryDate?: string;
  location?: string;
}

interface ProductStockItemManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem?: ProductStockItemDto;
}

export function ProductStockItemManagementModal({
  isOpen,
  onClose,
  stockItem,
}: ProductStockItemManagementModalProps) {
  const dispatch = useAppDispatch();
  const { history, isLoading, isCreating, isUpdating, isDeleting, error, successMessage } =
    useSelector((state: any) => state.stockManagement);
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

  // Handle success/error messages
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

  // Load history when modal opens or pagination changes
  useEffect(() => {
    if (isOpen && stockItem) {
      dispatch(
        getProductStockHistoryService({
          pageNo: historyPageNo,
          pageSize: historyPageSize,
          productId: stockItem.productId,
        })
      );
    }
  }, [isOpen, stockItem, dispatch, historyPageNo, historyPageSize]);

  // Reset form when modal opens or closes
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
      showToast.error("Quantity must be greater than or equal to 0");
      return;
    }

    const price = parseFloat(data.priceIn || "");
    if (isNaN(price) || price <= 0) {
      showToast.error("Price must be a valid number greater than 0");
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
        productId: stockItem.productId || "",
        productSizeId: stockItem.productSizeId || undefined,
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
      showToast.error("Quantity must be greater than or equal to 0");
      return;
    }

    const price = parseFloat(data.priceIn || "");
    if (isNaN(price) || price <= 0) {
      showToast.error("Price must be a valid number greater than 0");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">
        Stock Management - {stockItem?.productName}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              {stockItem?.mainImageUrl ? (
                <img
                  src={stockItem.mainImageUrl}
                  alt={stockItem?.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Stock Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stockItem?.productName}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  SKU: {stockItem?.sku || "---"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Barcode: {stockItem?.barcode || "---"}
                </Badge>
                {stockItem?.sizeName && (
                  <Badge variant="outline" className="text-xs">
                    Size: {stockItem.sizeName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Add/Update Stock Form */}
            <Card ref={formSectionRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {editingStock ? "Update Stock" : "Add New Stock"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleCreateStock)} className="space-y-6">
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity On Hand */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Quantity On Hand <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter quantity"
                        className="h-10"
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

                    {/* Price In */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Unit Price (Cost) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">$</span>
                        <Input
                          type="text"
                          placeholder="0.00"
                          className="h-10 flex-1"
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

                    {/* Expiry Date */}
                    <DateTimePickerField
                      control={form.control}
                      className="h-10"
                      name="expiryDate"
                      label="Expiry Date"
                      mode="date"
                      error={form.formState.errors.expiryDate}
                    />

                    {/* Location */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Storage Location
                      </Label>
                      <Input
                        placeholder="e.g., Warehouse A, Shelf 3"
                        className="h-10"
                        {...form.register("location")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Physical location in your warehouse/storage
                      </p>
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>

            {/* Form Footer */}
            <div className="flex gap-2 justify-end">
              <CancelButton
                onClick={onClose}
                disabled={isCreating || isUpdating}
                text="Close"
              />
              <Button
                onClick={form.handleSubmit(handleCreateStock)}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <span className="animate-pulse">
                      {editingStock ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : editingStock ? (
                  "Update Stock"
                ) : (
                  "Create Stock"
                )}
              </Button>
            </div>

            {/* Stock History Table */}
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

        {/* Delete Confirmation Modal */}
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

"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/redux/store";
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
import { Package, Trash2, Edit, RotateCcw } from "lucide-react";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import {
  createProductStockService,
  getProductStockHistoryService,
  deleteProductStockService,
} from "../store/thunks/stock-management-thunks";
import {
  clearError,
  clearSuccess,
} from "../store/slice/stock-management-slice";
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { dateTimeFormat } from "@/utils/date/date-time-format";

/**
 * Get expiry date color and variant based on status
 * Green: Not expired, more than 10 days away
 * Yellow: Expiring within 10 days
 * Red: Already expired
 */
function getExpiryDateVariant(expiryDate: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  if (!expiryDate) {
    return { variant: "secondary", color: "text-muted-foreground" };
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if expired
  if (expiry < today) {
    return { variant: "destructive", color: "text-red-600" };
  }

  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Yellow if expiring within 10 days
  if (daysUntilExpiry <= 10) {
    return { variant: "secondary", color: "text-yellow-600" };
  }

  // Green if more than 10 days away
  return { variant: "secondary", color: "text-green-600" };
}

interface StockFormData {
  quantityOnHand?: number;
  priceIn?: string;
  expiryDate?: string;
  location?: string;
}

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailResponseModel | null;
}

export function StockManagementModal({
  isOpen,
  onClose,
  product,
}: StockManagementModalProps) {
  const dispatch = useAppDispatch();
  const { history, isLoading, isCreating, isDeleting, error, successMessage } =
    useSelector((state: any) => state.stockManagement);
  const [historyPageNo, setHistoryPageNo] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    stock: null as any,
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
      form.reset({
        quantityOnHand: undefined,
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

  // Load history when modal opens or pagination changes
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

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantityOnHand: undefined,
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    } else {
      // Reset edit state when modal closes
      setEditingStock(null);
      form.reset({
        quantityOnHand: undefined,
        priceIn: "",
        expiryDate: "",
        location: "",
      });
    }
  }, [isOpen, form]);

  const handleCreateStock = async (data: StockFormData) => {
    // If editing, use update handler
    if (editingStock) {
      return handleUpdateStock(data);
    }

    if (!product) return;

    const quantity = Number(data.quantityOnHand);
    if (isNaN(quantity) || quantity < 0) {
      showToast.error("Quantity must be greater than or equal to 0");
      return;
    }

    // Validate price is a valid number
    const price = parseFloat(data.priceIn || "");
    if (isNaN(price) || price <= 0) {
      showToast.error("Price must be a valid number greater than 0");
      return;
    }

    // Format expiryDate if provided - add time component if only date is provided
    let formattedExpiryDate: string | undefined;
    if (data.expiryDate) {
      // If it's a date string without time, add midnight time
      if (data.expiryDate.length === 10) {
        formattedExpiryDate = `${data.expiryDate}T00:00:00`;
      } else {
        formattedExpiryDate = data.expiryDate;
      }
    }

    dispatch(
      createProductStockService({
        productId: product.id || "",
        quantityOnHand: quantity,
        priceIn: price,
        expiryDate: formattedExpiryDate || undefined,
        location: data.location || undefined,
      })
    );
  };

  const handleDeleteStock = (stock: any) => {
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

  const handleEditStock = (stock: any) => {
    setEditingStock(stock);
    form.reset({
      quantityOnHand: stock.quantityOnHand,
      priceIn: stock.priceIn?.toString(),
      expiryDate: stock.expiryDate,
      location: stock.location,
    });
    // Scroll to top of form
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

    // TODO: Call updateProductStockService with editingStock.id and data
    showToast.info("Update feature coming soon");
    setEditingStock(null);
    form.reset();
  };

  const stockHistoryColumns: TableColumn[] = [
    {
      key: "quantityOnHand",
      label: "Quantity",
      render: (stock) => (
        <Badge variant="secondary" className="text-sm">
          {stock.quantityOnHand} Items
        </Badge>
      ),
    },
    {
      key: "priceIn",
      label: "Unit Price",
      render: (stock) => <span className="text-sm">${stock.priceIn.toFixed(2)}</span>,
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (stock) =>
        stock.expiryDate ? (
          (() => {
            const { variant, color } = getExpiryDateVariant(stock.expiryDate);
            return (
              <Badge variant={variant} className={`text-xs ${color} font-medium`}>
                {dateTimeFormat(stock.expiryDate)}
              </Badge>
            );
          })()
        ) : (
          <span className="text-muted-foreground">---</span>
        ),
    },
    {
      key: "location",
      label: "Location",
      render: (stock) => (
        <span className="text-sm text-muted-foreground">{stock.location || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (stock) => <span className="text-xs text-muted-foreground">{dateTimeFormat(stock.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (stock) => (
        <div className="flex gap-1">
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Stock"
            onClick={() => handleEditStock(stock)}
          />
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            tooltip="Delete Stock"
            onClick={() => handleDeleteStock(stock)}
            disabled={isDeleting}
            variant="destructive"
          />
        </div>
      ),
    },
  ];

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">
        Stock Management - {product?.name}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              {product.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
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
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  SKU: {product.sku || "---"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Barcode: {product.barcode || "---"}
                </Badge>
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
                        Cost per unit for inventory tracking (e.g., 0.25, 10.50, 0.323)
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

                  {/* Preview Section */}
                  {product && (
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold mb-4">Sales Preview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selling Price */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Product Selling Price</p>
                              <p className="text-lg font-semibold text-foreground">
                                ${(product.price as unknown as number).toFixed(2)}
                              </p>
                            </div>
                            {product.hasPromotion && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                On Sale
                              </Badge>
                            )}
                          </div>

                          {/* Promotion Info */}
                          {product.hasPromotion && (
                            <div className="mt-3 pt-3 border-t border-muted space-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Promotion Type:</p>
                                <p className="font-medium">
                                  {product.promotionType === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Discount:</p>
                                <p className="font-medium">
                                  {product.promotionType === "PERCENTAGE"
                                    ? `${product.promotionValue}%`
                                    : `$${product.promotionValue.toFixed(2)}`}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Valid Period:</p>
                                <p className="font-medium text-xs">
                                  {new Date(product.promotionFromDate).toLocaleDateString()} →{" "}
                                  {new Date(product.promotionToDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="pt-2 border-t">
                                <p className="text-muted-foreground">Final Price:</p>
                                <p className="text-base font-semibold text-green-600">
                                  ${product.displayPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Revenue Calculation */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-3">Total Revenue (if sold all)</p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="font-medium">
                                {form.watch("quantityOnHand") || 0} units
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Selling Price (each):</span>
                              <span className="font-medium">
                                ${(product.hasPromotion ? product.displayPrice : (product.price as unknown as number)).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-3 border-t border-muted flex justify-between">
                              <span className="font-semibold">Total Revenue:</span>
                              <span className="text-lg font-bold text-green-600">
                                ${(
                                  (form.watch("quantityOnHand") || 0) *
                                  (product.hasPromotion
                                    ? product.displayPrice
                                    : (product.price as unknown as number))
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-2 flex justify-between text-xs text-muted-foreground">
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

        {/* Form Footer with Action Buttons */}
        <div className="px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Switch to Add Button */}
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
                }}
                disabled={isCreating}
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Switch to Add
              </Button>
            )}
            <div className="flex-1" />

            {/* Right: Status Message and Action Buttons */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {isCreating && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
                {form.formState.isDirty && !isCreating && (
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                )}
                <span>
                  {isCreating
                    ? editingStock
                      ? "Updating stock..."
                      : "Creating stock..."
                    : form.formState.isDirty
                    ? "You have unsaved changes"
                    : editingStock
                    ? "All changes saved"
                    : "Fill in the form to create stock"}
                </span>
              </div>

              <div className="flex gap-2">
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
                  disabled={isCreating}
                  text={editingStock ? "Cancel" : "Close"}
                />
                <SubmitButton
                  isSubmitting={isCreating}
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

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showToast } from "@/components/shared/common/show-toast";
import { Package, Trash2 } from "lucide-react";
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
  const dispatch = useDispatch();
  const { history, isLoading, isCreating, isDeleting, error, successMessage } =
    useSelector((state: any) => state.stockManagement);

  const [formData, setFormData] = useState({
    quantityOnHand: 0,
    priceIn: 0.01,
    expiryDate: "",
    location: "",
  });

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      dispatch(clearSuccess());
      setFormData({
        quantityOnHand: 0,
        priceIn: 0.01,
        expiryDate: "",
        location: "",
      });
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Load history when modal opens
  useEffect(() => {
    if (isOpen && product) {
      dispatch(
        getProductStockHistoryService({
          pageNo: 1,
          pageSize: 10,
          productId: product.id,
        } as any)
      );
    }
  }, [isOpen, product, dispatch]);

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    if (formData.quantityOnHand < 0) {
      showToast.error("Quantity must be greater than or equal to 0");
      return;
    }

    if (formData.priceIn <= 0) {
      showToast.error("Price must be greater than 0");
      return;
    }

    dispatch(
      createProductStockService({
        businessId: product.businessId || "",
        productId: product.id || "",
        quantityOnHand: formData.quantityOnHand,
        priceIn: formData.priceIn,
        expiryDate: formData.expiryDate || undefined,
        location: formData.location || undefined,
      } as any)
    );
  };

  const handleDeleteStock = (stockId: string) => {
    if (confirm("Are you sure you want to delete this stock record?")) {
      dispatch(deleteProductStockService(stockId));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value =
      field === "quantityOnHand" || field === "priceIn"
        ? parseFloat(e.target.value) || 0
        : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            {/* Add Stock Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Add New Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStock} className="space-y-6">
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity On Hand */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity On Hand <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.quantityOnHand}
                        onChange={(e) => handleInputChange(e, "quantityOnHand")}
                        placeholder="Enter quantity"
                        required
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Total quantity available in stock
                      </p>
                    </div>

                    {/* Price In */}
                    <div className="space-y-2">
                      <Label htmlFor="priceIn" className="text-sm font-medium">
                        Unit Price (Cost) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">$</span>
                        <Input
                          id="priceIn"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formData.priceIn}
                          onChange={(e) => handleInputChange(e, "priceIn")}
                          placeholder="0.00"
                          required
                          className="h-10 flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cost per unit for inventory tracking
                      </p>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate" className="text-sm font-medium">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange(e, "expiryDate")}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional - leave empty if product does not expire
                      </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">
                        Storage Location
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange(e, "location")}
                        placeholder="e.g., Warehouse A, Shelf 3"
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Physical location in your warehouse/storage
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isCreating}
                      size="lg"
                      className="flex-1"
                    >
                      {isCreating ? "Creating..." : "Create Stock Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={onClose}
                      disabled={isCreating}
                    >
                      Close
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Stock History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Stock History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading stock history...</p>
                  </div>
                ) : history?.content && history.content.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold">Quantity</TableHead>
                          <TableHead className="text-xs font-semibold">Unit Price</TableHead>
                          <TableHead className="text-xs font-semibold">Expiry Date</TableHead>
                          <TableHead className="text-xs font-semibold">Location</TableHead>
                          <TableHead className="text-xs font-semibold">Created</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.content.map((stock) => (
                          <TableRow key={stock.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <Badge variant="secondary" className="text-sm">
                                {stock.quantityOnHand}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              ${stock.priceIn.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {stock.expiryDate ? (
                                <Badge variant="destructive" className="text-xs">
                                  {dateTimeFormat(stock.expiryDate)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">---</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {stock.location || "---"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {dateTimeFormat(stock.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteStock(stock.id)}
                                disabled={isDeleting}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">No stock history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

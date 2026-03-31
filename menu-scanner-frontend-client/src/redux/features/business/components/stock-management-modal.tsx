"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Package, History, Plus, Trash2 } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState("create");

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      dispatch(clearSuccess());
      if (activeTab === "create") {
        setFormData({
          quantityOnHand: 0,
          priceIn: 0.01,
          expiryDate: "",
          location: "",
        });
      }
    }
  }, [successMessage, dispatch, activeTab]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Load history when modal opens or tab changes
  useEffect(() => {
    if (isOpen && product && activeTab === "history") {
      dispatch(
        getProductStockHistoryService({
          pageNo: 1,
          pageSize: 10,
          productId: product.id,
        } as any)
      );
    }
  }, [isOpen, product, activeTab, dispatch]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manage Stock - {product?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Stock
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Create Stock Tab */}
          <TabsContent value="create" className="space-y-6 mt-6">
            <form onSubmit={handleCreateStock} className="space-y-4">
              {/* Quantity On Hand */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity On Hand *
                  <span className="text-red-500 ml-1">*</span>
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
                />
                <p className="text-xs text-muted-foreground">
                  Current quantity available in stock
                </p>
              </div>

              {/* Price In */}
              <div className="space-y-2">
                <Label htmlFor="priceIn">
                  Unit Price (Cost) *
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">$</span>
                  <Input
                    id="priceIn"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.priceIn}
                    onChange={(e) => handleInputChange(e, "priceIn")}
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost per unit for this stock entry
                </p>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange(e, "expiryDate")}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if product does not expire
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange(e, "location")}
                  placeholder="e.g., Warehouse A, Shelf 3"
                />
                <p className="text-xs text-muted-foreground">
                  Physical location of the stock in your storage
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create Stock"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Stock History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading stock history...</p>
              </div>
            ) : history?.content && history.content.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.content.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            Qty: {stock.quantityOnHand}
                          </Badge>
                          <Badge variant="outline">
                            ${stock.priceIn.toFixed(2)}
                          </Badge>
                          {stock.expiryDate && (
                            <Badge variant="destructive" className="text-xs">
                              Expires: {dateTimeFormat(stock.expiryDate)}
                            </Badge>
                          )}
                        </div>
                        {stock.location && (
                          <p className="text-sm text-muted-foreground">
                            📍 Location: {stock.location}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created: {dateTimeFormat(stock.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteStock(stock.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No stock history found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

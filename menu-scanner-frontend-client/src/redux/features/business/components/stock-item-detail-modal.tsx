"use client";

import React from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedProduct,
} from "../store/selectors/product-selector";
import { fetchProductByIdService } from "../store/thunks/product-thunks";
import { clearSelectedProduct } from "../store/slice/product-slice";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Loading } from "@/components/shared/common/loading";
import { Badge } from "@/components/ui/badge";
import { ProductStockItemDto } from "../store/models/response/stock-response";

interface StockItemDetailModalProps {
  item?: ProductStockItemDto;
  isOpen: boolean;
  onClose: () => void;
}

export function StockItemDetailModal({
  item,
  isOpen,
  onClose,
}: StockItemDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const productData = useAppSelector(selectSelectedProduct);

  // Fetch product details to get image and more info
  React.useEffect(() => {
    const fetchProductData = async () => {
      if (!item?.productId || !isOpen) return;
      try {
        await dispatch(fetchProductByIdService(item.productId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [item?.productId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProduct());
    onClose();
  };

  if (!item) {
    return null;
  }

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Stock Item Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Stock Item Details - {item.productName}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header with Product Image */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              {productData?.mainImageUrl ? (
                <img
                  src={productData.mainImageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    No image
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                {item.productName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {item.categoryName} • {item.brandName}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                  {formatEnumValue(item.status)}
                </Badge>
                <Badge variant={item.stockStatus === "ENABLED" ? "default" : "destructive"}>
                  {formatEnumValue(item.stockStatus)}
                </Badge>
                <Badge variant="outline">{item.type}</Badge>
                {item.sizeName && <Badge variant="outline">{item.sizeName}</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Product Identification */}
            <Card>
              <CardHeader>
                <CardTitle>Product Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Product Name" value={item.productName} />
                  <DisplayField label="Category" value={item.categoryName} />
                  <DisplayField label="Brand" value={item.brandName} />
                  <DisplayField label="SKU" value={item.sku || "---"} />
                  <DisplayField label="Barcode" value={item.barcode || "---"} />
                  {item.sizeName && (
                    <DisplayField label="Size" value={item.sizeName} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Total Stock"
                    value={
                      <span className={
                        item.totalStock === 0
                          ? "font-medium text-red-600"
                          : item.totalStock < 10
                            ? "font-medium text-yellow-600"
                            : "font-medium text-green-600"
                      }>
                        {item.totalStock} Items
                      </span>
                    }
                  />
                  <DisplayField
                    label="Product Status"
                    value={
                      <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                        {formatEnumValue(item.status)}
                      </Badge>
                    }
                  />
                  <DisplayField
                    label="Stock Status"
                    value={
                      <Badge variant={item.stockStatus === "ENABLED" ? "default" : "destructive"}>
                        {formatEnumValue(item.stockStatus)}
                      </Badge>
                    }
                  />
                  <DisplayField
                    label="Type"
                    value={
                      <Badge variant="outline">{item.type}</Badge>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Created Date"
                    value={dateTimeFormat(item.createdAt)}
                  />
                  <DisplayField
                    label="Last Updated"
                    value={dateTimeFormat(item.updatedAt)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

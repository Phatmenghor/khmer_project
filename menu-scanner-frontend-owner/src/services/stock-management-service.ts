import { axiosClientWithAuth } from "@/utils/axios";

export interface StockDeductionItem {
  productId: string;
  quantity: number;
  productSizeId?: string;
}

export interface StockDeductionRequest {
  orderId: string;
  items: StockDeductionItem[];
  reason?: string;
}

export interface StockDeductionResponse {
  success: boolean;
  message: string;
  deductedItems?: {
    productId: string;
    quantityDeducted: number;
    remainingStock: number;
  }[];
}


export const deductOrderStock = async (
  request: StockDeductionRequest
): Promise<StockDeductionResponse> => {
  try {
    const response = await axiosClientWithAuth.post<{
      data: StockDeductionResponse;
    }>("/api/v1/inventory/deduct-order-stock", request);

    return response.data.data;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to deduct stock"
    );
  }
};


export const checkStockManagementEnabled = (enableStock?: string): boolean => {
  return enableStock === "ENABLED";
};


export const formatStockDeductionItems = (
  orderItems: any[]
): StockDeductionItem[] => {
  return orderItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    productSizeId: item.productSizeId,
  }));
};

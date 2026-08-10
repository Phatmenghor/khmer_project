"use client";

import { useState } from "react";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { axiosClientWithAuth } from "@/utils/axios";

export function useDownloadReceipt() {
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const handleDownloadReceipt = async (
    order: OrderResponse,
    format: "pdf" | "png" = "pdf"
  ) => {
    if (!order.id) return;
    setDownloadingOrderId(order.id);

    try {
      const response = await axiosClientWithAuth.get(`/api/v1/orders/${order.id}/receipt/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order.orderNumber || order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Failed to download receipt from backend server:", error);
      showToast.error("Failed to download receipt from server");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handlePrintReceipt = async (order: OrderResponse) => {
    if (!order.id) return;
    setPrintingOrderId(order.id);

    try {
      const response = await axiosClientWithAuth.get(`/api/v1/orders/${order.id}/receipt/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    } catch (error) {
      console.error("Failed to open print receipt:", error);
      showToast.error("Failed to print receipt");
    } finally {
      setPrintingOrderId(null);
    }
  };

  return {
    handleDownloadReceipt,
    handlePrintReceipt,
    downloadingOrderId,
    printingOrderId,
  };
}

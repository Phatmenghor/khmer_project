"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateReceiptHTML } from "@/utils/receipt/receipt-template";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/features/main/store/models/response/order-response";

export function useDownloadReceipt() {
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  const handleDownloadReceipt = async (
    order: OrderResponse,
    format: "pdf" | "png" = "pdf"
  ) => {
    if (!order.id) return;
    setDownloadingOrderId(order.id);

    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "305px";
      element.style.margin = "0";
      element.style.padding = "0";
      element.innerHTML = generateReceiptHTML(order);
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 305,
        windowWidth: 305,
        windowHeight: element.scrollHeight,
        logging: false,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              font-family: 'Courier New', monospace !important;
              box-sizing: border-box;
            }
            body {
              background: white !important;
              margin: 0;
              padding: 0;
            }
            #receipt-wrapper {
              font-size: 10px !important;
              line-height: 1.3 !important;
              color: black !important;
              background: white !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              background: transparent !important;
              background-color: transparent !important;
              border-color: #000 !important;
              color: black !important;
            }
            tr {
              background: transparent !important;
              background-color: transparent !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      if (format === "pdf") {
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
        });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${order.orderNumber}.pdf`);
        showToast.success("Receipt downloaded as PDF");
      } else {
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(); return; }
            const dlUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = dlUrl;
            a.download = `receipt-${order.orderNumber}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(dlUrl);
            showToast.success("Receipt downloaded as PNG");
            resolve();
          }, "image/png");
        });
      }

      document.body.removeChild(element);
    } catch (error) {
      console.error("Receipt download error:", error);
      showToast.error("Failed to generate receipt");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  return { handleDownloadReceipt, downloadingOrderId };
}

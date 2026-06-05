"use client";

import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { Receipt, orderResponseToReceiptProps } from "@/components/shared/receipt/receipt";

export function useDownloadReceipt() {
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const buildHTML = (order: OrderResponse) =>
    renderToStaticMarkup(createElement(Receipt, orderResponseToReceiptProps(order)));

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
      element.style.width = "380px";
      element.innerHTML = buildHTML(order);
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 380,
        windowWidth: 380,
        windowHeight: element.scrollHeight,
        logging: false,
      });

      if (format === "pdf") {
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfWidth, pdfHeight] });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${order.orderNumber}.pdf`);
        showToast.success("Receipt downloaded as PDF");
      } else {
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `receipt-${order.orderNumber}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

  const handlePrintReceipt = (order: OrderResponse) => {
    if (!order.id) return;
    setPrintingOrderId(order.id);

    try {
      const win = window.open("", "", "width=420,height=650");
      if (win) {
        win.document.write(`
          <html>
            <head><style>* { font-family: 'Courier New', monospace; box-sizing: border-box; } body { margin:0; padding:0; background:white; }</style></head>
            <body>${buildHTML(order)}</body>
          </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
      }
    } catch (error) {
      console.error("Receipt print error:", error);
      showToast.error("Failed to print receipt");
    } finally {
      setPrintingOrderId(null);
    }
  };

  return { handleDownloadReceipt, handlePrintReceipt, downloadingOrderId, printingOrderId };
}

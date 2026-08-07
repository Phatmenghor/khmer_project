"use client";

import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import {
  Receipt,
  orderResponseToReceiptProps,
} from "@/components/shared/receipt/receipt";
import { useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { ReceiptSize } from "@/enums/receipt-size.enum";
import { fetchBusinessSettingsByBusinessId } from "@/features/business/store/services/business-settings-service";

export function useDownloadReceipt() {
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(
    null
  );
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const businessSettings = useAppSelector(selectBusinessSettings);
  const receiptSize = businessSettings?.receiptSize || ReceiptSize.SIZE_58MM;

  let elementWidth = "270px";
  let canvasWidth = 270;
  let pdfWidth = 58;

  if (receiptSize === ReceiptSize.SIZE_80MM) {
    elementWidth = "380px";
    canvasWidth = 380;
    pdfWidth = 80;
  } else if (receiptSize === ReceiptSize.SIZE_112MM) {
    elementWidth = "530px";
    canvasWidth = 530;
    pdfWidth = 112;
  }

  const getSettingsForOrder = async (order: OrderResponse) => {
    let settings = businessSettings;
    if (!settings || settings.businessId !== order.businessId) {
      try {
        const fetched = await fetchBusinessSettingsByBusinessId(order.businessId);
        if (fetched) {
          settings = fetched;
        }
      } catch (error) {
        console.error("Failed to fetch business settings for receipt", error);
      }
    }
    return settings;
  };

  const buildHTML = (order: OrderResponse, settings?: any) =>
    renderToStaticMarkup(
      createElement(Receipt, {
        ...orderResponseToReceiptProps(order),
        businessLogo: settings?.logoBusiness?.sm,
        businessAddress: settings?.contactAddress,
        businessPhone: settings?.contactPhone,
        businessEmail: settings?.contactEmail,
        wifiName: settings?.wifiName,
        wifiPassword: settings?.wifiPassword,
      })
    );

  const handleDownloadReceipt = async (
    order: OrderResponse,
    format: "pdf" | "png" = "pdf"
  ) => {
    if (!order.id) return;
    setDownloadingOrderId(order.id);

    try {
      const settings = await getSettingsForOrder(order);

      // Dynamic imports keep html2canvas (~200 KB gz) and jspdf (~80 KB gz)
      // out of the main + public route bundles. They are only fetched when
      // a user actually clicks "Download receipt".
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = elementWidth;
      element.innerHTML = buildHTML(order, settings);
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: canvasWidth,
        windowWidth: canvasWidth,
        windowHeight: element.scrollHeight,
        logging: false,
      });

      if (format === "pdf") {
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
        });
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          pdfWidth,
          pdfHeight
        );
        pdf.save(`receipt-${order.orderNumber}.pdf`);
        showToast.success("Receipt downloaded as PDF");
      } else {
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve();
              return;
            }
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
    } catch {
      showToast.error("Failed to generate receipt");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handlePrintReceipt = async (order: OrderResponse) => {
    if (!order.id) return;
    setPrintingOrderId(order.id);

    try {
      const settings = await getSettingsForOrder(order);
      const win = window.open("", "", "width=420,height=650");
      if (win) {
        win.document.write(`
          <html>
            <head><style>* { font-family: 'Courier New', monospace; box-sizing: border-box; } body { margin:0; padding:0; background:white; }</style></head>
            <body>${buildHTML(order, settings)}</body>
          </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
      }
    } catch {
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

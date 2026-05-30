"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { useOrderAdminState } from "@/features/business/store/state/order-admin-state";
import {
  deleteOrderAdminService,
  fetchAllOrderAdminService,
} from "@/features/business/store/thunks/order-admin-thunks";
import {
  setPageNo,
  setSearchFilter,
  setOrderStatusFilter,
  setPaymentStatusFilter,
  resetState,
} from "@/features/business/store/slice/order-admin-slice";
import { orderAdminTableColumns } from "@/features/business/table/order-admin-table";
import { OrderDetailModal } from "@/features/business/components/order-detail-modal";
import { OrderUpdateModal } from "@/features/business/components/order-update-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { useDebounce } from "@/utils/debounce/debounce";
import { PAYMENT_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { OrderReceipt } from "@/components/shared/receipt/order-receipt";

export default function PendingOrdersAdminPage() {
  useAdminCleanup(resetState);

  const {
    orderState,
    orderData,
    orderContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useOrderAdminState();

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderId: "",
  });

  const [updateModalState, setUpdateModalState] = useState({
    isOpen: false,
    orderId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    order: null as OrderResponse | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.ORDERS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!filters.orderStatus || filters.orderStatus === "ALL") {
      dispatch(setOrderStatusFilter("PENDING"));
    }
  }, []);

  useEffect(() => {
    const requestParams: Record<string, unknown> = {
      search: debouncedSearch,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      orderStatus: filters.orderStatus || "PENDING",
    };

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      requestParams.paymentStatus = filters.paymentStatus;
    }

    dispatch(fetchAllOrderAdminService(requestParams));
  }, [
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.orderStatus,
    filters.paymentStatus,
    globalPageSize,
  ]);

  const handleViewOrder = (order: OrderResponse) => {
    setDetailModalState({ isOpen: true, orderId: order.id });
  };

  const handleEditOrder = (order: OrderResponse) => {
    setUpdateModalState({ isOpen: true, orderId: order.id });
  };

  const handleDeleteOrder = (order: OrderResponse) => {
    setDeleteState({ isOpen: true, order });
  };

  const handleDownloadReceipt = async (order: OrderResponse) => {
    if (!order.id || !order.items) return;
    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "100%";
      element.style.maxWidth = "900px";
      element.style.background = "white";
      element.style.padding = "24px";
      element.style.fontFamily = "monospace";

      const date = new Date(order.createdAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const subtotal = order.pricing?.subtotal || 0;
      const discount = order.pricing?.discountAmount || 0;
      const subtotalAfterDiscount = subtotal - discount;
      const tax = order.pricing?.taxAmount || 0;
      const delivery = order.pricing?.deliveryFee || 0;
      const total = order.pricing?.finalTotal || 0;
      const customizationTotal = order.pricing?.customizationTotal || 0;

      // Build items HTML with proper fallbacks
      const itemsHTML = order.items.map((item, idx) => {
        const itemTotal = (item.finalPrice || 0) * item.quantity;
        const productName = item.product?.name || item.productName || "Product";
        const sizeName = item.product?.sizeName || item.sizeName || null;
        const hasPromo = item.hasPromotion && item.promotionType;
        const promoLabel = hasPromo ? 
          (item.promotionType === "PERCENTAGE" 
            ? `${item.promotionValue}% OFF` 
            : `$${item.promotionValue} OFF`) 
          : null;

        return `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="flex: 1; font-weight: bold;">${idx + 1}. ${productName}${sizeName ? ' (Size: ' + sizeName + ')' : ''}</span>
              <span style="width: 40px; text-align: center;">${item.quantity}</span>
              <span style="width: 50px; text-align: right;">$${item.finalPrice?.toFixed(2) || '0.00'}</span>
              <span style="width: 60px; text-align: right; font-weight: bold;">$${itemTotal.toFixed(2)}</span>
            </div>
            ${promoLabel ? `<div style="color: #27ae60; font-weight: bold; font-size: 10px; margin-left: 8px;">✓ PROMOTION: ${promoLabel}</div>` : ''}
            ${item.customizations && item.customizations.length > 0 ? `
              <div style="margin-left: 16px; font-size: 10px; color: #666;">
                ${item.customizations.map(c => `<div>• ${c.name}: +$${c.priceAdjustment?.toFixed(2) || '0.00'}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      // Promotions summary
      const promotionalItems = order.items.filter(i => i.hasPromotion && i.promotionType);
      const promoSummary = promotionalItems.length > 0 ? `
        <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 8px; margin: 8px 0; font-size: 11px;">
          <div style="font-weight: bold; color: #16a34a; margin-bottom: 6px;">🎉 PROMOTIONS APPLIED</div>
          ${promotionalItems.map(item => {
            const prodName = item.product?.name || item.productName || "Product";
            const promoText = item.promotionType === "PERCENTAGE" 
              ? `-${item.promotionValue}%` 
              : `-$${item.promotionValue}`;
            return `<div style="display: flex; justify-content: space-between; color: #16a34a;"><span>${prodName}</span><span style="font-weight: bold;">${promoText}</span></div>`;
          }).join('')}
        </div>
      ` : '';

      element.innerHTML = `
        <div style="width: 100%; max-width: 900px; background: white; font-family: monospace; font-size: 12px;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-weight: bold; font-size: 16px; letter-spacing: 2px;">RECEIPT</div>
            <div style="font-size: 10px; color: #666; margin-top: 4px;">Professional Receipt Document</div>
          </div>

          <!-- Order Info -->
          <div style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #666;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${order.businessName || 'Business'}</div>
            <div style="font-size: 11px;">Order #: <strong>${order.orderNumber}</strong></div>
            <div style="font-size: 11px;">Date: ${formattedDate} • ${formattedTime}</div>
            ${order.customerName ? `<div style="font-size: 11px;">Customer: ${order.customerName}</div>` : ''}
          </div>

          <!-- Items Section -->
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #666;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">ITEMS (${order.items.length})</div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 2px solid #000;">
              <span style="flex: 1;">DESCRIPTION</span>
              <span style="width: 40px; text-align: center;">QTY</span>
              <span style="width: 50px; text-align: right;">PRICE</span>
              <span style="width: 60px; text-align: right;">TOTAL</span>
            </div>
            ${itemsHTML}
          </div>

          <!-- Promotions -->
          ${promoSummary}

          <!-- Pricing Summary -->
          <div style="margin-bottom: 12px; padding: 8px; background: #f9f9f9; border: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Subtotal</span>
              <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
            </div>
            ${customizationTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Add-ons</span>
                <span style="font-weight: bold;">+$${customizationTotal.toFixed(2)}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; background: #ffe0e0; padding: 4px;">
                <span style="color: #d32f2f; font-weight: bold;">Discount</span>
                <span style="color: #d32f2f; font-weight: bold;">-$${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${tax > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Tax</span>
                <span style="font-weight: bold;">+$${tax.toFixed(2)}</span>
              </div>
            ` : ''}
            ${delivery > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Delivery Fee</span>
                <span style="font-weight: bold;">+$${delivery.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Total -->
          <div style="background: #000; color: white; padding: 12px; text-align: center; margin-bottom: 12px; font-weight: bold;">
            <div style="font-size: 11px; margin-bottom: 4px;">FINAL AMOUNT DUE</div>
            <div style="font-size: 18px;">TOTAL: $${total.toFixed(2)}</div>
          </div>

          <!-- Payment -->
          <div style="margin-bottom: 12px; padding: 8px; border: 1px solid #666;">
            <div style="font-weight: bold;">Payment Method: ${order.payment?.paymentMethod || 'N/A'}</div>
            <div style="font-size: 11px;">Status: ${order.payment?.paymentStatus || 'N/A'}</div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 8px; border-top: 3px solid #000;">
            <div style="font-weight: bold; margin-bottom: 4px;">✓ Thank You For Your Order!</div>
            <div style="font-size: 10px; color: #666;">Please keep this receipt for your records</div>
            <div style="font-size: 9px; color: #999; margin-top: 4px;">Generated: ${formattedDate} at ${formattedTime}</div>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 900,
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`receipt-${order.orderNumber}.pdf`);

      document.body.removeChild(element);
      showToast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Receipt download error:", error);
      showToast.error("Failed to generate receipt");
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewOrder,
      handleEditOrder,
      handleDeleteOrder,
      handleDownloadReceipt,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      orderAdminTableColumns({
        data: orderData,
        handlers: tableHandlers,
      }),
    [orderState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleDelete = async () => {
    if (!deleteState.order?.id) return;

    try {
      await dispatch(deleteOrderAdminService(deleteState.order.id)).unwrap();
      showToast.success(
        `Order #${deleteState.order.orderNumber ?? ""} deleted successfully`,
      );
      closeDeleteModal();

      if (orderContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || "Failed to delete order",
      );
    }
  };

  const closeDetailModal = () => {
    setDetailModalState({ isOpen: false, orderId: "" });
  };

  const closeUpdateModal = () => {
    setUpdateModalState({ isOpen: false, orderId: "" });
  };

  const closeDeleteModal = () => {
    setDeleteState({ isOpen: false, order: null });
  };

  const handlePaymentStatusChange = (value: string) => {
    dispatch(setPaymentStatusFilter(value));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Pending Orders"
          searchValue={filters.search}
          searchPlaceholder="Search order..."
          onSearchChange={handleSearchChange}
          buttonText="New Order"
          buttonIcon={<Plus className="h-4 w-4" />}
          buttonHref={ROUTES.ADMIN.POS}
          buttonTooltip="Create a new POS order"
        >
          <CustomSelect
            options={PAYMENT_STATUS_ADMIN_FILTER}
            value={filters.paymentStatus || "ALL"}
            placeholder="All Payment"
            onValueChange={handlePaymentStatusChange}
            label="Payment Status"
          />
        </CardHeaderSection>

        <DataTableWithPagination
          data={orderContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No pending orders found"
          getRowKey={(order) => order.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <OrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      <OrderUpdateModal
        orderId={updateModalState.orderId}
        isOpen={updateModalState.isOpen}
        onClose={closeUpdateModal}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order #${
          deleteState.order?.orderNumber || ""
        }?`}
        itemName={deleteState.order?.orderNumber || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

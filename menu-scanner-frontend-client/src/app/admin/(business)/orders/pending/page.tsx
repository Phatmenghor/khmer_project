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
      element.style.width = "80mm";
      element.style.height = "auto";
      element.style.fontFamily = "monospace";
      element.style.fontSize = "11px";
      element.style.backgroundColor = "#fff";
      element.style.padding = "4mm";

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

      const itemsHTML = order.items.map(item => {
        const itemTotal = (item.finalPrice || 0) * item.quantity;
        return `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
            <span style="flex: 1;">${item.productName}</span>
            <span style="width: 16px; text-align: center;">${item.quantity}</span>
            <span style="width: 30px; text-align: right;">—</span>
            <span style="width: 50px; text-align: right;">$${itemTotal.toFixed(2)}</span>
          </div>
        `;
      }).join('');

      element.innerHTML = `
        <div style="width: 80mm; background: white;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px;">
            <div style="font-weight: bold; font-size: 13px; letter-spacing: 1px;">RECEIPT</div>
          </div>

          <!-- Order Info -->
          <div style="text-align: center; font-size: 10px; margin-bottom: 6px; border-bottom: 1px solid #666; padding-bottom: 4px;">
            <div>Order #: ${order.orderNumber}</div>
            <div>Date: ${formattedDate} • ${formattedTime}</div>
            <div style="font-weight: bold;">${order.businessName || 'Restaurant'}</div>
          </div>

          <!-- Items Section -->
          <div style="margin-bottom: 6px; border-bottom: 1px solid #666; padding-bottom: 4px;">
            <div style="text-align: center; font-weight: bold; font-size: 10px; border-bottom: 1px solid #666; padding-bottom: 2px; margin-bottom: 4px;">ITEMS</div>
            <div style="margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; margin-bottom: 2px;">
                <span style="flex: 1;">NAME</span>
                <span style="width: 16px; text-align: center;">QTY</span>
                <span style="width: 30px; text-align: right;">DSC</span>
                <span style="width: 50px; text-align: right;">TOTAL</span>
              </div>
              <div style="border-bottom: 1px solid #ccc; margin-bottom: 2px;"></div>
              ${itemsHTML}
            </div>
          </div>

          <!-- Order Summary -->
          <div style="margin-bottom: 6px; border-bottom: 2px solid #000; padding-bottom: 6px;">
            <div style="text-align: center; font-weight: bold; font-size: 10px; margin-bottom: 4px;">ORDER SUMMARY</div>
            <div style="font-size: 10px; line-height: 1.6;">
              <div style="display: flex; justify-content: space-between;">
                <span>Payment Method</span>
                <span style="font-weight: bold;">${order.payment?.paymentStatus || 'CASH'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal w/ Add-ons</span>
                <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: #d32f2f;">
                <span>Discount (Promotions)</span>
                <span style="font-weight: bold;">-$${discount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal After Discount</span>
                <span style="font-weight: bold;">$${subtotalAfterDiscount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between;">
                <span>Tax</span>
                <span style="font-weight: bold;">+$${tax.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Delivery Fee</span>
                <span style="font-weight: bold;">${delivery > 0 ? `+$${delivery.toFixed(2)}` : 'Free'}</span>
              </div>
              <div style="border-top: 1px solid #666; padding-top: 3px; margin-top: 3px; display: flex; justify-content: space-between; font-weight: bold; font-size: 11px;">
                <span>TOTAL AMOUNT</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 10px; padding-top: 4px;">
            <div>Thank you for your order!</div>
            <div>Please visit again</div>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 250],
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * 80) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, 80, imgHeight);
      pdf.save(`receipt-${order.orderNumber}.pdf`);

      document.body.removeChild(element);
      showToast.success("Receipt downloaded successfully");
    } catch (error) {
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

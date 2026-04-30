"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/redux/store/use-pagination";
import { useOrderAdminState } from "@/redux/features/business/store/state/order-admin-state";
import {
  deleteOrderAdminService,
  fetchAllOrderAdminService,
} from "@/redux/features/business/store/thunks/order-admin-thunks";
import {
  setPageNo,
  setSearchFilter,
  setOrderStatusFilter,
  setPaymentStatusFilter,
  setStartDateFilter,
  setEndDateFilter,
  resetState,
} from "@/redux/features/business/store/slice/order-admin-slice";
import { orderAdminTableColumns } from "@/redux/features/business/table/order-admin-table";
import { OrderDetailModal } from "@/redux/features/business/components/order-detail-modal";
import { OrderUpdateModal } from "@/redux/features/business/components/order-update-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  ORDER_STATUS_ADMIN_FILTER,
  PAYMENT_STATUS_ADMIN_FILTER,
} from "@/constants/status/filter-status";

export default function OrdersAdminPage() {
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
    debouncedSearch,
    filters.pageNo,
    filters.orderStatus,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    globalPageSize,
        orderStatus:
          filters.orderStatus === "ALL" ? undefined : filters.orderStatus,
        paymentStatus:
          filters.paymentStatus === "ALL" ? undefined : filters.paymentStatus,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.orderStatus,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
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

  const tableHandlers = useMemo(
    () => ({
      handleViewOrder,
      handleEditOrder,
      handleDeleteOrder,
    }),
    []
  );

  const columns = useMemo(
    () =>
      orderAdminTableColumns({
        data: orderData,
        handlers: tableHandlers,
      }),
    [orderState, tableHandlers]
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
        `Order #${deleteState.order.orderNumber ?? ""} deleted successfully`
      );
      closeDeleteModal();

      if (orderContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete order");
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

  const handleOrderStatusChange = (value: string) => {
    dispatch(setOrderStatusFilter(value));
  };

  const handlePaymentStatusChange = (value: string) => {

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setStartDateFilter(date.toISOString()));
    } else {
      dispatch(setStartDateFilter(undefined));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setEndDateFilter(date.toISOString()));
    } else {
      dispatch(setEndDateFilter(undefined));
    }
  };
    dispatch(setPaymentStatusFilter(value));

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setStartDateFilter(date.toISOString()));
    } else {
      dispatch(setStartDateFilter(undefined));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setEndDateFilter(date.toISOString()));
    } else {
      dispatch(setEndDateFilter(undefined));
    }
  };
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setStartDateFilter(date.toISOString()));
    } else {
      dispatch(setStartDateFilter(undefined));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(setEndDateFilter(date.toISOString()));
    } else {
      dispatch(setEndDateFilter(undefined));
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Orders", href: "" },
          ]}
          title="Order Management"
          searchValue={filters.search}
          searchPlaceholder="Search order..."
          onSearchChange={handleSearchChange}
          buttonText="New Order"
          buttonIcon={<Plus className="h-4 w-4" />}
          buttonHref={ROUTES.ADMIN.POS}
          buttonTooltip="Create a new POS order"
        >
          <CustomSelect
            options={ORDER_STATUS_ADMIN_FILTER}
            value={filters.orderStatus || "ALL"}
            placeholder="All Status"
            onValueChange={handleOrderStatusChange}
            label="Order Status"
          />

          <CustomSelect
            options={PAYMENT_STATUS_ADMIN_FILTER}
            value={filters.paymentStatus || "ALL"}
            placeholder="All Payment"
            onValueChange={handlePaymentStatusChange}
            label="Payment Status"
          />
          <div className="flex gap-2">
            <CustomDatePicker
              label="From Date"
              value={filters.startDate ? new Date(filters.startDate) : undefined}
              onChange={handleStartDateChange}
              placeholder="Start date"
            />
            <CustomDatePicker
              label="To Date"
              value={filters.endDate ? new Date(filters.endDate) : undefined}
              onChange={handleEndDateChange}
              placeholder="End date"
            />
          </div>
        </CardHeaderSection>

        <DataTableWithPagination
          data={orderContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No orders found"
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

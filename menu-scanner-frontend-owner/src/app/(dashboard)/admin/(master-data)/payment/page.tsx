"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { ModalMode } from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/redux/store/use-pagination";
import { usePaymentState } from "@/redux/features/master-data/store/state/payment-state";
import { PaymentResponseModel } from "@/redux/features/master-data/store/models/response/payment-response";
import {
  deletePaymentService,
  fetchAllPaymentService,
} from "@/redux/features/master-data/store/thunks/payment-thunks";
import { paymentTableColumns } from "@/redux/features/master-data/table/payment-table";
import {
  setPageNo,
  setSearchFilter,
} from "@/redux/features/master-data/store/slice/payment-slice";
import { PaymentDetailModal } from "@/redux/features/master-data/components/payment-detail-modal";
import PaymentModal from "@/redux/features/master-data/components/payment-modal";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const {
    paymentState,
    paymentData,
    paymentContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = usePaymentState();

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    paymentId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    paymentId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    payment: null as PaymentResponseModel | null,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.PAYMENT,
    defaultPageSize: 15,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, pagination.currentPage, dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllPaymentService({
        search: debouncedSearch,
        pageNo: pagination.currentPage,
      })
    );
  }, [dispatch, debouncedSearch, pagination.currentPage]);

  const handleEditPayment = (payment: PaymentResponseModel) => {
    setModalState({ isOpen: true, mode: ModalMode.UPDATE_MODE, paymentId: payment?.id || "" });
  };

  const handlePaymentViewDetail = (payment: PaymentResponseModel) => {
    setDetailModalState({ isOpen: true, paymentId: payment.id || "" });
  };

  const handleDeletePayment = (payment: PaymentResponseModel) => {
    setDeleteState({ isOpen: true, payment });
  };

  const tableHandlers = useMemo(
    () => ({ handleEditPayment, handlePaymentViewDetail, handleDeletePayment }),
    []
  );

  const columns = useMemo(
    () => paymentTableColumns({ data: paymentData, handlers: tableHandlers }),
    [paymentState, tableHandlers]
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handleDelete = async () => {
    if (!deleteState.payment?.id) return;
    try {
      await dispatch(deletePaymentService(deleteState.payment.id)).unwrap();
      showToast.success(`Payment deleted successfully`);
      setDeleteState({ isOpen: false, payment: null });
      if (paymentContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete payment");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Payment"
          searchValue={filters.search}
          searchPlaceholder="Search payment..."
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={(e) => dispatch(setSearchFilter(e.target.value))}
          openModal={() => setModalState({ isOpen: true, mode: ModalMode.CREATE_MODE, paymentId: "" })}
        />

        <DataTableWithPagination
          data={paymentContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No payments found"
          getRowKey={(p) => p.id}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
        />
      </div>

      <PaymentModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: ModalMode.CREATE_MODE, paymentId: "" })}
        paymentId={modalState.paymentId}
        mode={modalState.mode}
      />

      <PaymentDetailModal
        paymentId={detailModalState.paymentId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, paymentId: "" })}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, payment: null })}
        onDelete={handleDelete}
        title="Delete Payment"
        description={`Are you sure you want to delete this payment?`}
        itemName={deleteState.payment?.amount?.toString() || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

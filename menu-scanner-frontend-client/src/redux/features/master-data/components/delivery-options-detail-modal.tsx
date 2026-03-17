"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  selectIsFetchingDetail,
  selectSelectedOrderStatus,
} from "../store/selectors/order-status-selector";
import { fetchOrderStatusByIdService } from "../store/thunks/order-status-thunks";
import { clearSelectedOrderStatus } from "../store/slice/order-status-slice";

interface OrderStatusDetailModalProps {
  orderStatusId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderStatusDetailModal({
  orderStatusId,
  isOpen,
  onClose,
}: OrderStatusDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const orderStatusData = useAppSelector(selectSelectedOrderStatus);

  useEffect(() => {
    const fetchOrderStatusData = async () => {
      if (!orderStatusId || !isOpen) return;
      try {
        await dispatch(fetchOrderStatusByIdService(orderStatusId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching order status data:", error);
      }
    };

    fetchOrderStatusData();
  }, [orderStatusId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrderStatus());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Order Status Information Details"}
      description={
        orderStatusData?.name || "Loading order status information..."
      }
    >
      {orderStatusData ? (
        <div className="space-y-6">
          {/* Order Status Information */}
          <DetailSection title="Personal Information">
            <DetailRow
              label="Order Status Name"
              value={orderStatusData?.name || "---"}
            />

            <DetailRow
              label="Status"
              value={orderStatusData?.status || "---"}
            />

            <DetailRow
              label="description"
              value={orderStatusData?.description || "---"}
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Order Status ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {orderStatusData?.id}
                </span>
              }
            />
            <DetailRow
              label="Business Name"
              value={orderStatusData?.businessName || "---"}
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(orderStatusData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={orderStatusData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(orderStatusData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={orderStatusData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No order status data available
          </p>
        </div>
      )}
    </DetailModal>
  );
}

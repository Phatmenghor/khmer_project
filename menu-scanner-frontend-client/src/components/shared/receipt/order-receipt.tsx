"use client";

import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { Receipt, orderResponseToReceiptProps } from "./receipt";

export function OrderReceipt({ order }: { order: OrderResponse }) {
  if (!order) return null;
  return <Receipt {...orderResponseToReceiptProps(order)} />;
}

"use client";

import { TableColumn } from "@/components/shared/common/data-table";
import { PlatformBankResponseModel } from "../store/models/response/platform-bank-response";
import { SmartImage } from "@/components/shared/image/smart-image";
import { ActionButton } from "@/components/button/action-button";
import { Edit2, Trash2, Building2 } from "lucide-react";
import { formatDate } from "@/utils/date/date-time-format";
import { indexDisplay } from "@/utils/common/common";

interface PlatformBankTableOptions {
  pageNo?: number;
  pageSize?: number;
  onEdit: (bank: PlatformBankResponseModel) => void;
  onDelete: (bank: PlatformBankResponseModel) => void;
}

export function platformBankTableColumns(
  options: PlatformBankTableOptions
): TableColumn<PlatformBankResponseModel>[] {
  const { pageNo = 1, pageSize = 10, onEdit, onDelete } = options;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "50px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground font-bold">
          {indexDisplay(pageNo, pageSize, index + 1)}
        </span>
      ),
    },
    {
      key: "name",
      label: "Bank Name",
      render: (item) => {
        const imageUrl = item.image?.sm || item.image?.md || item.image?.o;
        return (
          <div className="flex items-center gap-2.5 font-bold text-foreground">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {imageUrl ? (
                <SmartImage src={imageUrl} alt={item.name} width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <Building2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-black">{item.name}</span>
          </div>
        );
      },
    },
    {
      key: "accountName",
      label: "Account Name",
      render: (item) => (
        <span className="text-xs font-bold text-foreground">{item.accountName}</span>
      ),
    },
    {
      key: "accountNumber",
      label: "Account Number",
      render: (item) => (
        <span className="text-xs font-black text-primary tracking-wider font-mono">
          {item.accountNumber}
        </span>
      ),
    },
    {
      key: "displayOrder",
      label: "Order",
      render: (item) => (
        <span className="text-xs font-semibold text-muted-foreground">
          #{item.displayOrder ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${
            item.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          }`}
        >
          {item.status || "ACTIVE"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (item) => (
        <span className="text-xs text-muted-foreground font-semibold">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <ActionButton
            icon={<Edit2 className="w-3.5 h-3.5 text-primary" />}
            tooltip="Edit Bank Account"
            onClick={() => options.onEdit(item)}
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            tooltip="Delete Bank Account"
            onClick={() => options.onDelete(item)}
          />
        </div>
      ),
    },
  ];
}

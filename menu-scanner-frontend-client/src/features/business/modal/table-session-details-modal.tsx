"use client";

import React from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TableSession, TableSessionItem } from "@/features/business/store/models/type/table-session-type";
import { formatCurrency } from "@/utils/common/currency-format";
import { getProductImageUrl } from "@/utils/common/common";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { dateFormatLocal, dateTimeFormat } from "@/utils/date/date-time-format";
import {
  Utensils,
  Copy,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
  selectedRound?: number;
  onSettleSession?: (session: TableSession) => void;
  onResetTableSession?: (session: TableSession) => void;
}

export function TableSessionDetailsModal({
  isOpen,
  onClose,
  session,
  onSettleSession,
  onResetTableSession,
}: TableSessionDetailsModalProps) {
  if (!session) return null;

  // Clean session code (remove legacy SESS- / Session prefix for display)
  const cleanSessionNumber = session.sessionNumber.replace(/^(SESS-?|Session\s*)/i, "");
  const tableTitle = session.tableNumber.startsWith("Table ") ? session.tableNumber : `Table ${session.tableNumber}`;

  // Filter items with customer notes for sidebar summary
  const itemsWithNotes = session.items?.filter((i) => i.customerNote && i.customerNote.trim().length > 0) || [];

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="5xl" className="rounded-[28px] overflow-hidden">
      <DialogTitle className="sr-only">
        Table Details - {tableTitle} ({cleanSessionNumber})
      </DialogTitle>

      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3 pr-12">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground font-mono truncate">
                {tableTitle}
              </p>
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={() => {
                  navigator.clipboard.writeText(cleanSessionNumber);
                  showToast.success(Messages.clipboard.addressCopied || "Copied session code!");
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copy session code"
              >
                <Copy className="h-3 w-3" />
              </CustomButton>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Code: <span className="font-semibold text-foreground">{cleanSessionNumber}</span> • POS Table Session
            </p>
          </div>
        </div>
      </div>

      {/* ── Body Grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3.5 grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* ── Left Column (Order Items & Pricing) ── */}
          <div className="lg:col-span-2 space-y-3.5">
            {/* Order Items Header */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex items-center justify-between shadow-2xs">
              <SectionTitle className="mt-0 mb-0 pb-0 border-0">
                Order Items ({session.totalItems || 0})
              </SectionTitle>
            </div>

            {/* Items Content List (All Items) */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs space-y-2.5">
              {session.items && session.items.length > 0 ? (
                session.items.map((item) => (
                  <ItemCard key={item.id || `${item.productName}-${item.orderRound}`} item={item} showRoundBadge />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 font-medium">
                  No items ordered yet for this session.
                </p>
              )}
            </div>

            {/* Pricing Summary Card */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>Pricing Summary</SectionTitle>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Items Subtotal ({session.totalItems || 0} {session.totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(session.subtotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Add-ons / Customizations
                  </span>
                  <span className={cn("font-semibold", (session.customizationTotal || 0) > 0 ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
                    {(session.customizationTotal || 0) > 0 ? `+${formatCurrency(session.customizationTotal)}` : formatCurrency(0)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Tax / VAT ({session.taxRate ?? 0}%)
                  </span>
                  <span className="font-semibold text-foreground">
                    +{formatCurrency(session.taxAmount ?? 0)}
                  </span>
                </div>

                {(session.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Discount
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      -{formatCurrency(session.discountAmount || 0)}
                    </span>
                  </div>
                )}

                <div className="pt-2.5 mt-1 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-black text-foreground uppercase tracking-wide">
                    Grand Total
                  </span>
                  <span className="text-base font-black text-primary">
                    {formatCurrency(session.grandTotal ?? session.totalAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar (Order Info & System Info) ── */}
          <div className="space-y-3.5">
            {/* Table Session Info */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>Order Info</SectionTitle>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <InfoRow label="Date" value={dateFormatLocal(session.startedAt)} />
                <InfoRow label="Time" value={dateTimeFormat(session.startedAt)} />
                <InfoRow label="Type" value="POS Table Session" />
                <InfoRow label="Table" value={tableTitle} />
                <InfoRow label="Session Code" value={cleanSessionNumber} />
                <InfoRow
                  label="Status"
                  value={
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {session.status}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Special Customer Notes Summary Card */}
            {itemsWithNotes.length > 0 && (
              <div className="rounded-[18px] border border-amber-500/30 bg-amber-500/5 p-3.5 shadow-2xs space-y-2.5">
                <SectionTitle className="text-amber-700 dark:text-amber-400 border-amber-500/20">
                  <MessageSquare className="w-4 h-4 inline mr-1.5 text-amber-600 dark:text-amber-400" />
                  Special Order Notes
                </SectionTitle>
                <div className="space-y-1.5">
                  {Array.from(
                    new Set(
                      itemsWithNotes
                        .map((i) => i.customerNote?.trim())
                        .filter((note): note is string => Boolean(note && note.length > 0))
                    )
                  ).map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-background/90 border border-amber-500/20 text-xs">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold italic">
                        &quot;{note}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>System Info</SectionTitle>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <InfoRow label="Started At" value={dateTimeFormat(session.startedAt)} />
                <InfoRow label="Total Rounds" value={session.rounds?.length || 0} />
                <InfoRow label="Total Items" value={session.totalItems} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex gap-2 justify-end border-t pt-3 px-4 pb-3 bg-background sticky bottom-0 border-border/80">
        <CustomButton
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Close
        </CustomButton>

        {onResetTableSession && (
          <CustomButton
            type="button"
            variant="destructive"
            onClick={() => {
              onResetTableSession(session);
              onClose();
            }}
          >
            Reset Table
          </CustomButton>
        )}

        {onSettleSession && session.status !== "PAID" && (
          <CustomButton
            type="button"
            variant="default"
            onClick={() => onSettleSession(session)}
          >
            Settle Bill
          </CustomButton>
        )}
      </div>
    </CustomModal>
  );
}

function ItemCard({ item, showRoundBadge = false }: { item: TableSessionItem; showRoundBadge?: boolean }) {
  return (
    <div className="flex gap-3 p-3 rounded-[16px] border border-border/70 bg-card hover:bg-muted/30 transition-all shadow-2xs">
      {/* Image */}
      <CustomImagePreview
        src={getProductImageUrl(item.imageUrl)}
        alt={item.productName}
        fallbackText={item.productName}
        className="h-12 w-12 rounded-xl object-cover border border-border/40 shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-xs font-bold text-foreground leading-tight truncate">
              {item.productName}
            </p>
            {item.quantity > 1 && (
              <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-black">
                Qty: {item.quantity}
              </span>
            )}
          </div>
          {showRoundBadge && item.orderRound && (
            <span className="shrink-0 px-2 py-0.5 bg-muted text-muted-foreground border border-border/60 rounded-md text-[10px] font-bold leading-none">
              Round {item.orderRound}
            </span>
          )}
        </div>

        {/* Size & Customizations */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.sizeName && item.sizeName !== "Standard" && (
            <span className="text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
              {item.sizeName}
            </span>
          )}

          {item.customizations && item.customizations.length > 0 && (
            <>
              {item.customizations.map((c, idx) => (
                <span
                  key={c.productCustomizationId || idx}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md text-[11px] font-semibold"
                >
                  +{c.name}
                  {(c.priceAdjustment ?? 0) > 0 && (
                    <span className="font-bold">
                      &nbsp;+{formatCurrency(c.priceAdjustment)}
                    </span>
                  )}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Price × qty → total */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/40">
          <span className="text-muted-foreground font-semibold">
            {formatCurrency(item.unitPrice)} ×{" "}
            <span
              className={cn(
                "font-bold",
                item.quantity > 1 ? "text-primary font-extrabold text-[13px]" : "text-foreground"
              )}
            >
              {item.quantity}
            </span>
          </span>
          <span className="font-black text-primary text-sm shrink-0">
            {formatCurrency(item.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

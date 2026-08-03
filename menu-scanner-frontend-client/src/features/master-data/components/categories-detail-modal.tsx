"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  selectCategoriesWithProductCountContent,
  selectSelectedCategories,
} from "../store/selectors/categories-selector";
import { clearSelectedCategories } from "../store/slice/categories-slice";
import { fetchCategoriesByIdService } from "../store/thunks/categories-thunks";

function CategoriesDetailImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative flex-shrink-0 w-14 h-14 rounded-[10px] overflow-hidden bg-muted border border-border flex items-center justify-center shadow-xs">
      {src ? (
        <SmartImage src={src} alt={alt} fill showSkeleton={false} />
      ) : (
        <Tag className="h-6 w-6 text-muted-foreground/60" />
      )}
    </div>
  );
}

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

interface CategoriesDetailModalProps {
  categoriesId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoriesDetailModal({
  categoriesId,
  isOpen,
  onClose,
}: CategoriesDetailModalProps) {
  const dispatch = useAppDispatch();
  const categoriesContent = useAppSelector(selectCategoriesWithProductCountContent);
  const selectedCategories = useAppSelector(selectSelectedCategories);
  const categories = categoriesContent.find(c => c.id === categoriesId) || (selectedCategories?.id === categoriesId ? selectedCategories : null);

  useEffect(() => {
    if (isOpen && categoriesId && !categories) {
      dispatch(fetchCategoriesByIdService(categoriesId));
    }
  }, [isOpen, categoriesId, categories, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedCategories());
    onClose();
  };

  const isActive = categories?.status === "ACTIVE";
  const totalProducts = categories?.totalProducts ?? categories?.productCount ?? 0;
  const activeProducts = categories?.activeProducts ?? 0;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !categories}
      isEmpty={!categories}
      emptyMessage="No category data available"
      title="Category"
      description="Manage product categories for your business"
      size="xl"
    >
      {categories && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Category Information</SectionTitle>
          <div className="col-span-2 flex items-center gap-3.5 p-2 rounded-[12px] bg-muted/30 border border-border/60 mb-1">
            <CategoriesDetailImage
              src={categories.image?.md ?? categories.image?.o ?? categories.image?.sm}
              alt={categories.name || "Category"}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {categories.name || "-"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>Status:</span>
                <span className={cn("font-semibold px-2 py-0.5 rounded-md text-[11px]", isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                  {categories.status ? formatEnumValue(categories.status) : "-"}
                </span>
              </p>
            </div>
          </div>

          <InfoRow label="Description" value={categories.description || "-"} fullWidth />

          <SectionTitle>Product Stats</SectionTitle>
          <InfoRow label="Total Products" value={totalProducts} />
          <InfoRow label="Active Products" value={activeProducts} />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created By" value={categories.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(categories.createdAt ?? "")} />
          <InfoRow label="Updated By" value={categories.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(categories.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}

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
    <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
      {src ? (
        <SmartImage src={src} alt={alt} fill showSkeleton={false} />
      ) : (
        <Tag className="h-5 w-5 text-muted-foreground" />
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
          <SectionTitle>Category Image</SectionTitle>
          <div className="col-span-2">
            <CategoriesDetailImage
              src={categories.image?.md ?? categories.image?.o ?? categories.image?.sm}
              alt={categories.name || "Category"}
            />
          </div>

          <SectionTitle>Category Information</SectionTitle>
          <InfoRow label="Name" value={categories.name || "-"} />
          <InfoRow
            label="Status"
            value={
              <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                {categories.status ? formatEnumValue(categories.status) : "-"}
              </span>
            }
          />
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

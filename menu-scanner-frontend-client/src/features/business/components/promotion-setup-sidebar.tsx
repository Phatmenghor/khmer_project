"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { PromotionValueField } from "@/components/shared/form-field/promotion-value-field";
import { SectionTitle } from "@/components/shared/modal/detail-section";
import { PROMOTION_TYPES } from "@/constants/form-options";
import { BulkPromotionFormData } from "@/features/business/store/models/schema/bulk-promotion-schema";

interface PromotionSetupSidebarProps {
  form: UseFormReturn<BulkPromotionFormData>;
  selectedProductCount: number;
  selectedSizesCount: number;
  promotionType: "FIXED_AMOUNT" | "PERCENTAGE";
  isSubmitting: boolean;
  isFormValid: boolean;
  onCancel: () => void;
  onApply: () => void;
}

export function PromotionSetupSidebar({
  form,
  selectedProductCount,
  selectedSizesCount,
  promotionType,
  isSubmitting,
  isFormValid,
  onCancel,
  onApply,
}: PromotionSetupSidebarProps) {
  return (
    <div className="w-full lg:w-64 flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden scroll-smooth bg-background">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-3 sm:px-3 md:px-3 lg:px-3 py-4 sm:py-5 md:py-4 lg:py-5 space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4">
          
          {/* Header */}
          <div className="space-y-1 border-b border-border pb-3">
            <h2 className="text-xs sm:text-xs font-bold text-foreground">
              Promotion Setup
            </h2>
            <p className="text-xs sm:text-xs text-muted-foreground">
              Configure discount details for selected products
            </p>
          </div>

          {/* Selection Status */}
          <div className="rounded p-3 bg-gradient-to-r from-primary/15 to-green-500/15 border border-primary/25 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                Selection Status
              </p>

              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex items-baseline gap-1">
                  <p className="text-xs sm:text-sm font-black text-primary">
                    {selectedProductCount}
                  </p>
                  <p className="text-xs sm:text-xs font-semibold text-foreground/60">
                    {selectedProductCount === 1 ? "Product" : "Products"}
                  </p>
                </div>

                <div className="h-8 w-px bg-primary/20" />

                <div className="flex items-baseline gap-1">
                  <p className="text-xs sm:text-sm font-black text-green-600">
                    {selectedSizesCount}
                  </p>
                  <p className="text-xs sm:text-xs font-semibold text-foreground/60">
                    {selectedSizesCount === 1 ? "Size" : "Sizes"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            
            {/* Discount Settings */}
            <div className="rounded border border-border/60 p-3 space-y-2 bg-muted/30 hover:bg-muted/50 transition-colors">
              <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                Discount Settings
              </SectionTitle>
              <div className="space-y-2">
                <CustomSelect
                  placeholder="Choose discount type..."
                  label="Discount Type"
                  options={PROMOTION_TYPES}
                  value={promotionType}
                  onValueChange={(value) =>
                    form.setValue(
                      "promotionType",
                      value as "FIXED_AMOUNT" | "PERCENTAGE",
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }
                  disabled={isSubmitting}
                  required
                />
                {form.formState.errors.promotionType && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.promotionType.message}
                  </p>
                )}

                <PromotionValueField
                  control={form.control}
                  name="promotionValue"
                  label={
                    promotionType === "PERCENTAGE"
                      ? "Discount Percentage"
                      : "Discount Amount"
                  }
                  promotionType={promotionType}
                  error={form.formState.errors.promotionValue}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="rounded border border-border/60 p-3 space-y-2 bg-muted/30 hover:bg-muted/50 transition-colors">
              <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                Duration
              </SectionTitle>
              <div className="space-y-2">
                <DateTimePickerField
                  control={form.control}
                  name="promotionFromDate"
                  label="Start Date"
                  required
                  mode="date"
                  error={form.formState.errors.promotionFromDate}
                />

                <DateTimePickerField
                  control={form.control}
                  name="promotionToDate"
                  label="End Date"
                  required
                  mode="date"
                  error={form.formState.errors.promotionToDate}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-3">
            <div className="flex gap-2 sm:gap-3 md:gap-2 lg:gap-3">
              <CancelButton
                onClick={onCancel}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 h-7 sm:h-8 md:h-7 lg:h-8 text-xs sm:text-xs md:text-xs lg:text-xs font-semibold rounded-[10px] border border-border hover:bg-muted/50 transition-colors"
                text="Cancel"
              />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={selectedProductCount > 0}
                isCreate={true}
                createText="Apply Promotion"
                submittingCreateText="Applying..."
                disabled={!isFormValid}
                onClick={onApply}
                variant="default"
                className="flex-1 h-7 sm:h-8 md:h-7 lg:h-8 text-xs sm:text-xs md:text-xs lg:text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-[10px] shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

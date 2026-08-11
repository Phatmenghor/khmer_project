"use client";

import React from "react";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioStatsSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  customStatsFieldArray: UseFieldArrayReturn<PortfolioFormData, "customStats">;
}

export function PortfolioStatsSection({
  form,
  customStatsFieldArray,
}: PortfolioStatsSectionProps) {
  const { fields: customStatsFields, append: appendCustomStat, remove: removeCustomStat } = customStatsFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={BarChart3}
        title="6. Key Business Statistics"
        subtitle="Highlight key milestones (e.g. 10,000+ Satisfied Guests, 150+ Dishes Offered)"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendCustomStat({ id: "", label: "", value: "" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Stat
          </CustomButton>
        }
      />
      {customStatsFields.length > 0 ? (
        <div className="space-y-3">
          {customStatsFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`customStats.${index}.value`}
                  label="Metric Value"
                  placeholder="Enter value (e.g. 10,000+)..."
                  required
                  error={form.formState.errors.customStats?.[index]?.value}
                />
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`customStats.${index}.label`}
                  label="Label Description"
                  placeholder="Enter label (e.g. Happy Guests)..."
                  required
                  error={form.formState.errors.customStats?.[index]?.label}
                />
              </div>
              <CustomButton
                type="button"
                size="sm"
                variant="ghost"
                className="mt-5 text-red-500 hover:bg-red-500/10 h-8 px-2 shrink-0"
                onClick={() => removeCustomStat(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </CustomButton>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioEmptyState message="No statistics added" />
      )}
    </div>
  );
}

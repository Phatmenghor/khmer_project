"use client";

import React from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioHoursSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  businessHoursFieldArray: UseFieldArrayReturn<PortfolioFormData, "businessHours">;
}

export function PortfolioHoursSection({
  form,
  businessHoursFieldArray,
}: PortfolioHoursSectionProps) {
  const { fields: businessHoursFields, append: appendBusinessHour, remove: removeBusinessHour } = businessHoursFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Clock}
        title="4. Operating Schedule & Hours"
        subtitle="Configure weekly opening and closing schedules for your storefront"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendBusinessHour({ id: "", day: "", openTime: "08:00", closeTime: "18:00" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Hours
          </CustomButton>
        }
      />
      {businessHoursFields.length > 0 ? (
        <div className="space-y-3">
          {businessHoursFields.map((field, index) => (
            <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
              <CustomButton
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                onClick={() => removeBusinessHour(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </CustomButton>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`businessHours.${index}.day`}
                  label="Day of Week"
                  placeholder="Enter day (e.g. Monday)..."
                  required
                />
                <div className="flex flex-col gap-1 w-full">
                  <Label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">Opening Time</Label>
                  <Controller
                    name={`businessHours.${index}.openTime`}
                    control={form.control}
                    render={({ field: timeField }) => (
                      <CustomTimePicker
                        value={timeField.value || ""}
                        onChange={timeField.onChange}
                        placeholder="Enter open time"
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">Closing Time</Label>
                  <Controller
                    name={`businessHours.${index}.closeTime`}
                    control={form.control}
                    render={({ field: timeField }) => (
                      <CustomTimePicker
                        value={timeField.value || ""}
                        onChange={timeField.onChange}
                        placeholder="Enter close time"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioEmptyState message="No operating hours added" />
      )}
    </div>
  );
}

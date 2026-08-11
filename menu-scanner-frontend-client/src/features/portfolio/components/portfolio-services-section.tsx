"use client";

import React from "react";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioServicesSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  servicesFieldArray: UseFieldArrayReturn<PortfolioFormData, "services">;
}

export function PortfolioServicesSection({
  form,
  servicesFieldArray,
}: PortfolioServicesSectionProps) {
  const { fields: servicesFields, append: appendService, remove: removeService } = servicesFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Briefcase}
        title="7. Store Services Offered"
        subtitle="Highlight main business services (e.g. In-Store Dining, Express Takeaway, Home Delivery)"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendService({ id: "", name: "", description: "" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Service
          </CustomButton>
        }
      />
      {servicesFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesFields.map((field, index) => (
            <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
              <CustomButton
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                onClick={() => removeService(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </CustomButton>
              <div className="space-y-3 pr-8">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`services.${index}.name`}
                  label="Service Title"
                  placeholder="Enter service title..."
                  required
                  error={form.formState.errors.services?.[index]?.name}
                />
                <TextareaField<PortfolioFormData>
                  control={form.control}
                  name={`services.${index}.description`}
                  label="Service Description"
                  placeholder="Enter service description narrative..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioEmptyState
          message="No services listed"
          hint="e.g., Premium Dine-In Experience, Express Takeaway & Pickup"
        />
      )}
    </div>
  );
}

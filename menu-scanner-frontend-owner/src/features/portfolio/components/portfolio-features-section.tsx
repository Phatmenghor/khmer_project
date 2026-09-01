"use client";

import React from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioFeaturesSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  featuresFieldArray: UseFieldArrayReturn<PortfolioFormData, "features">;
}

export function PortfolioFeaturesSection({
  form,
  featuresFieldArray,
}: PortfolioFeaturesSectionProps) {
  const { fields: featuresFields, append: appendFeature, remove: removeFeature } = featuresFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Sparkles}
        title="5. Features & Highlights"
        subtitle="Highlight key store amenities, guest features, and specialized offerings"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendFeature({ id: "", name: "" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Feature
          </CustomButton>
        }
      />
      {featuresFields.length > 0 ? (
        <div className="space-y-3">
          {featuresFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`features.${index}.name`}
                  label={`Feature #${index + 1}`}
                  placeholder="Enter feature (e.g. Free High-Speed Wi-Fi)..."
                  required
                  error={form.formState.errors.features?.[index]?.name}
                />
              </div>
              <CustomButton
                type="button"
                size="sm"
                variant="ghost"
                className="mt-5 text-red-500 hover:bg-red-500/10 h-8 px-2 shrink-0"
                onClick={() => removeFeature(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </CustomButton>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioEmptyState
          message="No features added"
          hint='Click "Add Feature" to list guest amenities like High-Speed Wi-Fi, Air Conditioning, etc.'
        />
      )}
    </div>
  );
}

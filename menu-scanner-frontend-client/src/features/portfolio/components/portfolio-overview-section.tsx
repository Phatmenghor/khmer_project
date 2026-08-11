"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { PortfolioSectionHeader } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioOverviewSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  watchCoverImage?: { o?: string; md?: string; sm?: string };
  onCoverFileSelected: (file: File | null) => void;
}

export function PortfolioOverviewSection({
  form,
  watchCoverImage,
  onCoverFileSelected,
}: PortfolioOverviewSectionProps) {
  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Building2}
        title="1. Overview & Header Cover Display"
        subtitle="Storefront cover display banner and main business description narrative"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Column (50%): Compact Header Banner Cover Display */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Header Banner Cover Display</span>
            <span className="text-[11px] font-normal text-muted-foreground">Banner Display</span>
          </Label>
          <SpacesImageUpload
            businessId={AppDefault.BUSINESS_ID}
            label=""
            value={watchCoverImage?.o || watchCoverImage?.md || watchCoverImage?.sm || ""}
            multiSize
            deferred
            onFileSelected={onCoverFileSelected}
            aspectRatio="banner"
            height="h-[145px]"
            placeholder="Click to upload storefront cover banner"
            helperText="Landscape cover display (16:9) — PNG, JPG"
            maxSizeMb={5}
          />
        </div>

        {/* Right Column (50%): Business Description Narrative */}
        <TextareaField<PortfolioFormData>
          control={form.control}
          name="description"
          label="Business Description Narrative"
          placeholder="Enter storefront narrative description..."
          rows={5}
          textareaClassName="h-[145px] resize-none"
          required
          error={form.formState.errors.description}
        />
      </div>
    </div>
  );
}

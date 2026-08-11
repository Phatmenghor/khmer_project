"use client";

import React from "react";
import { GalleryHorizontal, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioGallerySectionProps {
  form: UseFormReturn<PortfolioFormData>;
  galleryFieldArray: UseFieldArrayReturn<PortfolioFormData, "gallery">;
  onAddGallery: () => void;
  onRemoveGallery: (index: number) => void;
  onGalleryFileSelected: (index: number, file: File | null) => void;
}

export function PortfolioGallerySection({
  form,
  galleryFieldArray,
  onAddGallery,
  onRemoveGallery,
  onGalleryFileSelected,
}: PortfolioGallerySectionProps) {
  const { fields: galleryFields } = galleryFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={GalleryHorizontal}
        title="9. Photo Gallery Showcase"
        subtitle="Showcase store interior, high quality dishes, atmosphere, or event photos"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={onAddGallery}
          >
            <Plus className="w-3.5 h-3.5" /> Add Image
          </CustomButton>
        }
      />
      {galleryFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryFields.map((field, index) => {
            const watchImage = form.watch(`gallery.${index}.image`);
            return (
              <div key={field.id} className="border border-border/80 rounded-xl p-4 space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors relative">
                <CustomButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 text-red-500 hover:bg-red-500/10 h-7 px-2"
                  onClick={() => onRemoveGallery(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </CustomButton>
                <SpacesImageUpload
                  businessId={AppDefault.BUSINESS_ID}
                  label={`Gallery Photo #${index + 1}`}
                  value={watchImage?.o || watchImage?.md || watchImage?.sm || ""}
                  multiSize
                  deferred
                  onFileSelected={(file) => onGalleryFileSelected(index, file)}
                  aspectRatio="square"
                  placeholder="Click to upload gallery photo"
                  helperText="Square (1:1) image recommended — PNG, JPG"
                  maxSizeMb={5}
                />
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`gallery.${index}.title`}
                  label="Photo Caption (optional)"
                  placeholder="Enter photo caption..."
                />
              </div>
            );
          })}
        </div>
      ) : (
        <PortfolioEmptyState
          message="No gallery images added"
          hint="Upload photos of your ambiance, dishes, or staff"
        />
      )}
    </div>
  );
}

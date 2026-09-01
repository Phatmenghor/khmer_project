"use client";

import React from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioTeamSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  teamFieldArray: UseFieldArrayReturn<PortfolioFormData, "team">;
  onAddTeam: () => void;
  onRemoveTeam: (index: number) => void;
  onTeamFileSelected: (index: number, file: File | null) => void;
}

export function PortfolioTeamSection({
  form,
  teamFieldArray,
  onAddTeam,
  onRemoveTeam,
  onTeamFileSelected,
}: PortfolioTeamSectionProps) {
  const { fields: teamFields } = teamFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Users}
        title="8. Team & Staff Showcase"
        subtitle="Introduce key team members, head chefs, and managers to build customer trust"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={onAddTeam}
          >
            <Plus className="w-3.5 h-3.5" /> Add Team Member
          </CustomButton>
        }
      />
      {teamFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamFields.map((field, index) => {
            const watchPhoto = form.watch(`team.${index}.photo`);
            return (
              <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
                <CustomButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                  onClick={() => onRemoveTeam(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </CustomButton>
                <div className="space-y-4 pr-8">
                  <SpacesImageUpload
                    businessId={AppDefault.BUSINESS_ID}
                    label="Member Avatar Photo"
                    value={watchPhoto?.o || watchPhoto?.md || watchPhoto?.sm || ""}
                    multiSize
                    deferred
                    onFileSelected={(file) => onTeamFileSelected(index, file)}
                    aspectRatio="square"
                    placeholder="Click to upload profile photo"
                    helperText="Square (1:1) avatar recommended"
                    maxSizeMb={5}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField<PortfolioFormData>
                      control={form.control}
                      name={`team.${index}.name`}
                      label="Full Name"
                      placeholder="Enter full name..."
                      required
                      error={form.formState.errors.team?.[index]?.name}
                    />
                    <TextField<PortfolioFormData>
                      control={form.control}
                      name={`team.${index}.position`}
                      label="Position / Title"
                      placeholder="Enter position title..."
                      required
                      error={form.formState.errors.team?.[index]?.position}
                    />
                  </div>

                  <TextareaField<PortfolioFormData>
                    control={form.control}
                    name={`team.${index}.bio`}
                    label="Short Biography"
                    placeholder="Enter short bio..."
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <PortfolioEmptyState
          message="No team members added"
          hint="Introduce your team to build trust with customers"
        />
      )}
    </div>
  );
}

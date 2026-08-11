"use client";

import React from "react";
import { Share2, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioSocialMediaSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  socialMediaFieldArray: UseFieldArrayReturn<PortfolioFormData, "socialMedia">;
}

export function PortfolioSocialMediaSection({
  form,
  socialMediaFieldArray,
}: PortfolioSocialMediaSectionProps) {
  const { fields: socialMediaFields, append: appendSocialMedia, remove: removeSocialMedia } = socialMediaFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Share2}
        title="3. Social Media Channels"
        subtitle="Connect Facebook, Instagram, TikTok, LinkedIn, YouTube, and Telegram profile links"
        action={
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendSocialMedia({ id: "", name: "", url: "" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Social Account
          </CustomButton>
        }
      />
      {socialMediaFields.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialMediaFields.map((field, index) => (
            <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
              <CustomButton
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                onClick={() => removeSocialMedia(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </CustomButton>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`socialMedia.${index}.name`}
                  label="Platform Name"
                  placeholder="Enter platform (e.g. Facebook)..."
                  required
                  error={form.formState.errors.socialMedia?.[index]?.name}
                />
                <TextField<PortfolioFormData>
                  control={form.control}
                  name={`socialMedia.${index}.url`}
                  label="Profile Link URL"
                  placeholder="Enter profile URL..."
                  required
                  error={form.formState.errors.socialMedia?.[index]?.url}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioEmptyState
          message="No social media accounts added"
          hint='Click "Add Social Account" to attach social profile links'
        />
      )}
    </div>
  );
}

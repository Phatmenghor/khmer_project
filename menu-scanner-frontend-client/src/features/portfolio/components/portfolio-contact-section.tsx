"use client";

import React from "react";
import { Phone, Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PortfolioSectionHeader, PortfolioEmptyState } from "./portfolio-section-common";
import type { PortfolioFormData } from "@/app/admin/(service)/portfolio/schema/portfolio-form.schema";

interface PortfolioContactSectionProps {
  form: UseFormReturn<PortfolioFormData>;
  contactPhonesFieldArray: UseFieldArrayReturn<PortfolioFormData, "contact.phones">;
}

export function PortfolioContactSection({
  form,
  contactPhonesFieldArray,
}: PortfolioContactSectionProps) {
  const { fields: contactPhonesFields, append: appendContactPhone, remove: removeContactPhone } = contactPhonesFieldArray;

  return (
    <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
      <PortfolioSectionHeader
        icon={Phone}
        title="2. Contact Details & Map Location"
        subtitle="Public contact numbers, messenger channels, address, and Google Maps"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField<PortfolioFormData>
          control={form.control}
          name="contact.email"
          label="Email Address"
          type="email"
          placeholder="Enter email address..."
          error={form.formState.errors.contact?.email}
        />
        <TextField<PortfolioFormData>
          control={form.control}
          name="contact.phone"
          label="Primary Phone"
          placeholder="Enter primary phone number..."
          error={form.formState.errors.contact?.phone}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField<PortfolioFormData>
          control={form.control}
          name="contact.telegram"
          label="Telegram Username / Link"
          placeholder="Enter Telegram username..."
          error={form.formState.errors.contact?.telegram}
        />
        <TextField<PortfolioFormData>
          control={form.control}
          name="contact.address"
          label="Physical Address"
          placeholder="Enter physical contact address..."
          error={form.formState.errors.contact?.address}
        />
        <TextField<PortfolioFormData>
          control={form.control}
          name="contact.mapLink"
          label="Google Maps Location Link"
          placeholder="Enter Google Maps URL..."
          error={form.formState.errors.contact?.mapLink}
        />
      </div>

      {/* Additional Phone Numbers */}
      <div className="border-t border-border/80 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground">Additional Phone Numbers</p>
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 font-bold text-xs h-8"
            onClick={() => appendContactPhone({ id: "", number: "" })}
          >
            <Plus className="w-3.5 h-3.5" /> Add Phone
          </CustomButton>
        </div>
        {contactPhonesFields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {contactPhonesFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <TextField<PortfolioFormData>
                    control={form.control}
                    name={`contact.phones.${index}.number`}
                    label={`Phone #${index + 1}`}
                    placeholder="Enter phone number..."
                    required
                    error={form.formState.errors.contact?.phones?.[index]?.number}
                  />
                </div>
                <CustomButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="mt-5 text-red-500 hover:bg-red-500/10 h-8 px-2"
                  onClick={() => removeContactPhone(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </CustomButton>
              </div>
            ))}
          </div>
        ) : (
          <PortfolioEmptyState message="No additional phone numbers added" />
        )}
      </div>
    </div>
  );
}

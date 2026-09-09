"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { usePlatformProfileState } from "@/features/platform-profile/store/state/use-platform-profile-state";
import {
  fetchAdminPlatformProfileService,
  updatePlatformProfileService,
} from "@/features/platform-profile/store/thunks/platform-profile-thunks";
import { Building2, Save, Globe, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";

export default function PlatformProfilePage() {
  const { dispatch, profile, isLoading, isUpdating } = usePlatformProfileState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      brandName: "ScanMe KH",
      brandSlogan: "Digital Menu & Smart POS Platform",
      supportEmail: "phatmenghor7@gmail.com",
      supportTelegram: "070411260",
      supportPhone: "070411260",
      address: "",
      description: "ScanMe KH - Premier Digital Menu and Smart POS Solution for Restaurants, Cafes, and Businesses.",
      logoUrl: "",
      facebookUrl: "",
      websiteUrl: "",
    },
  });

  const logoUrl = watch("logoUrl");

  useEffect(() => {
    dispatch(fetchAdminPlatformProfileService());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setValue("brandName", profile.brandName || "ScanMe KH");
      setValue("brandSlogan", profile.brandSlogan || "Digital Menu & Smart POS Platform");
      setValue("supportEmail", profile.supportEmail || "phatmenghor7@gmail.com");
      setValue("supportTelegram", profile.supportTelegram || "070411260");
      setValue("supportPhone", profile.supportPhone || "070411260");
      setValue("address", profile.address || "");
      setValue("description", profile.description || "");
      setValue("logoUrl", profile.logoUrl || "");
      setValue("facebookUrl", profile.facebookUrl || "");
      setValue("websiteUrl", profile.websiteUrl || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await dispatch(updatePlatformProfileService(data)).unwrap();
      showToast.success("Platform information updated successfully!");
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to update platform profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 px-1 pb-10">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-foreground">
              Platform Profile & Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-medium pl-1">
            Manage platform brand identity, slogans, and support contact details
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isUpdating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting || isUpdating ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Brand & Identity Card */}
        <Card className="border-border/60 shadow-2xs rounded-2xl">
          <CardHeader className="py-4 px-5 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Brand & Platform Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                control={control}
                name="brandName"
                label="Brand Name"
                placeholder="Enter brand name"
                disabled={isSubmitting}
                required
              />

              <TextField
                control={control}
                name="brandSlogan"
                label="Brand Slogan"
                placeholder="Enter brand slogan"
                disabled={isSubmitting}
              />

              <TextField
                control={control}
                name="websiteUrl"
                label="Official Website URL"
                placeholder="Enter official website URL"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <SpacesImageUpload
                label="Platform Logo Image"
                businessId={AppDefault.BUSINESS_ID}
                value={logoUrl}
                onChange={(result: any) => {
                  const url = result?.url || result?.sm?.url || "";
                  setValue("logoUrl", url, { shouldDirty: true });
                }}
                onRemove={() => {
                  setValue("logoUrl", "", { shouldDirty: true });
                }}
                aspectRatio="square"
                disabled={isSubmitting}
                placeholder="Click to upload platform logo"
              />
            </div>

            <TextareaField
              control={control}
              name="description"
              label="Platform Overview / Description"
              placeholder="Enter platform overview description"
              rows={3}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Support & Contact Card */}
        <Card className="border-border/60 shadow-2xs rounded-2xl">
          <CardHeader className="py-4 px-5 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Support & Contact Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                control={control}
                name="supportEmail"
                label="Support Email"
                placeholder="Enter support email"
                type="email"
                disabled={isSubmitting}
              />

              <TextField
                control={control}
                name="supportTelegram"
                label="Support Telegram"
                placeholder="Enter support telegram"
                disabled={isSubmitting}
              />

              <TextField
                control={control}
                name="supportPhone"
                label="Hotline / Phone Number"
                placeholder="Enter hotline phone number"
                disabled={isSubmitting}
              />

              <TextField
                control={control}
                name="facebookUrl"
                label="Facebook Page URL"
                placeholder="Enter facebook page URL"
                disabled={isSubmitting}
              />
            </div>

            <TextareaField
              control={control}
              name="address"
              label="Physical Office / Support Address"
              placeholder="Enter physical office address"
              rows={2}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Save Footer Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <SubmitButton
            isSubmitting={isSubmitting || isUpdating}
            isDirty={true}
            isCreate={false}
            updateText="Save Platform Profile"
            submittingUpdateText="Saving Changes..."
          />
        </div>
      </form>
    </div>
  );
}

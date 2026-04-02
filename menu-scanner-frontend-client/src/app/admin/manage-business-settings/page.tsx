"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SocialMedia,
} from "@/redux/features/business/store/services/business-settings-service";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { uploadImageService } from "@/services/image-service";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "@/redux/features/business/store/thunks/business-settings-thunks";

interface FormData {
  businessName: string;
  taxPercentage: string;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function BusinessSettingsPage() {
  const dispatch = useAppDispatch();
  const reduxBusinessSettings = useAppSelector(selectBusinessSettings);

  const [isLoading, setIsLoading] = useState(!reduxBusinessSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const form = useForm<FormData>({
    mode: "onChange",
  });

  // Fetch business settings
  useEffect(() => {
    // If already in Redux, use that data
    if (reduxBusinessSettings) {
      form.reset({
        businessName: reduxBusinessSettings?.businessName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
        taxPercentage: reduxBusinessSettings?.taxPercentage?.toString() || "",
        logoBusinessUrl: reduxBusinessSettings?.logoBusinessUrl || "",
        enableStock: reduxBusinessSettings?.enableStock || "DISABLED",
        socialMedia: reduxBusinessSettings?.socialMedia || [],
        primaryColor: reduxBusinessSettings?.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
        secondaryColor: reduxBusinessSettings?.secondaryColor || BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR,
        accentColor: reduxBusinessSettings?.accentColor || BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR,
      });
      setIsLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetchBusinessSettings();
  }, [reduxBusinessSettings]);

  const fetchBusinessSettings = async () => {
    try {
      setIsLoading(true);
      const action = await dispatch(fetchBusinessSettingsThunk());

      if (action.payload) {
        const data = action.payload;
        // Initialize form with current data
        form.reset({
          businessName: data?.businessName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
          taxPercentage: data?.taxPercentage?.toString() || "",
          logoBusinessUrl: data?.logoBusinessUrl || "",
          enableStock: data?.enableStock || "DISABLED",
          socialMedia: data?.socialMedia || [],
          primaryColor: data?.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
          secondaryColor: data?.secondaryColor || BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR,
          accentColor: data?.accentColor || BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR,
        });
      } else {
        showToast.error("Failed to load business settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business logo selection and upload (like profile picture does)
  const handleLogoSelect = async (base64: string) => {
    try {
      setIsUploadingLogo(true);

      // Get file type from base64
      const type = base64.split(";")[0].replace("data:", "").split("/")[1] || "png";

      // Upload to API
      const uploadResponse = await uploadImageService({
        base64: base64,
        type: type,
      });

      if (uploadResponse?.imageUrl) {
        // Update form with the uploaded URL
        form.setValue("logoBusinessUrl", uploadResponse.imageUrl, {
          shouldDirty: true,
        });
        showToast.success("✓ Logo uploaded successfully");
      } else {
        showToast.error("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      showToast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Helper function to apply theme colors in real-time (hex to HSL conversion)
  const applyThemeColors = (
    primaryColor?: string,
    secondaryColor?: string,
    accentColor?: string
  ) => {
    const hexToHsl = (hex: string): string => {
      if (!hex) return "";

      hex = hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      const hue = Math.round(h * 360);
      const saturation = Math.round(s * 100);
      const lightness = Math.round(l * 100);

      return `${hue} ${saturation}% ${lightness}%`;
    };

    if (primaryColor) {
      const hsl = hexToHsl(primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--primary", hsl);
      }
    }

    if (secondaryColor) {
      const hsl = hexToHsl(secondaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--secondary", hsl);
      }
    }

    if (accentColor) {
      const hsl = hexToHsl(accentColor);
      if (hsl) {
        document.documentElement.style.setProperty("--accent", hsl);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      // Logo is already uploaded via handleLogoSelect
      const payload = {
        businessName: data.businessName,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusinessUrl: data.logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: data.socialMedia,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload));

      if (action.payload) {
        const result = action.payload;

        // Apply colors in real-time without refresh
        if (result.primaryColor || result.secondaryColor || result.accentColor) {
          applyThemeColors(result.primaryColor, result.secondaryColor, result.accentColor);
        }

        showToast.success("Business settings updated successfully");
      } else {
        showToast.error("Failed to update business settings");
        return;
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast.error("Failed to update business settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media accounts
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your business name"
                  {...form.register("businessName")}
                />
                <p className="text-xs text-muted-foreground">
                  Your business name displayed throughout the site
                </p>
              </div>

              {/* Tax Percentage */}
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Tax Percentage</Label>
                <div className="relative">
                  <Input
                    id="taxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    className="pr-8"
                    {...form.register("taxPercentage")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tax rate applied to all transactions (0-100%)
                </p>
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <Label htmlFor="enableStock">Stock Management</Label>
                <Select
                  value={form.watch("enableStock")}
                  onValueChange={(value) =>
                    form.setValue(
                      "enableStock",
                      value as "ENABLED" | "DISABLED",
                    )
                  }
                >
                  <SelectTrigger id="enableStock">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENABLED">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Enabled
                      </span>
                    </SelectItem>
                    <SelectItem value="DISABLED">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Disabled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Enable or disable stock management system
                </p>
              </div>
            </div>

            {/* Business Logo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ClickableImageUpload
                  label="Business Logo"
                  value={form.watch("logoBusinessUrl")}
                  onChange={handleLogoSelect}
                  disabled={isSaving || isUploadingLogo}
                  aspectRatio="square"
                  height="h-48"
                  placeholder="Click to upload logo"
                  helperText="Upload a square image (PNG, JPG, etc.)"
                  maxSize={5}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Logo will be uploaded immediately when selected
                </p>
              </div>
              {/* Right column - empty for now, can be used for future additions */}
              <div />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your brand colors (applies site-wide)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder={BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Main brand color
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("secondaryColor") || BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR}
                    onChange={(e) => form.setValue("secondaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder={BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR}
                    value={form.watch("secondaryColor") || BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR}
                    onChange={(e) => form.setValue("secondaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Secondary brand color
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("accentColor") || BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR}
                    onChange={(e) => form.setValue("accentColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder={BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR}
                    value={form.watch("accentColor") || BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR}
                    onChange={(e) => form.setValue("accentColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Accent color for highlights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <p className="text-sm text-muted-foreground">
                {form.watch("socialMedia")?.length > 0
                  ? `${form.watch("socialMedia").length} account${
                      form.watch("socialMedia").length > 1 ? "s" : ""
                    } added`
                  : "No social media accounts added"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSocialMedia = form.getValues("socialMedia") || [];
                form.setValue("socialMedia", [
                  ...currentSocialMedia,
                  { name: "", imageUrl: "", linkUrl: "" },
                ]);
              }}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {form.watch("socialMedia")?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No social media accounts added
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.watch("socialMedia")?.map((social, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 relative lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Platform Name
                          </Label>
                          <Input
                            placeholder="e.g., Facebook"
                            value={social.name}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].name = e.target.value;
                              form.setValue("socialMedia", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Icon/Logo URL
                          </Label>
                          <Input
                            placeholder="https://example.com/icon.png"
                            type="url"
                            value={social.imageUrl}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].imageUrl = e.target.value;
                              form.setValue("socialMedia", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Profile URL
                          </Label>
                          <Input
                            placeholder="https://facebook.com/yourprofile"
                            type="url"
                            value={social.linkUrl}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].linkUrl = e.target.value;
                              form.setValue("socialMedia", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      {!isSaving && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const currentSocialMedia =
                              form.getValues("socialMedia") || [];
                            form.setValue(
                              "socialMedia",
                              currentSocialMedia.filter((_, i) => i !== index),
                              { shouldDirty: true }
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={fetchBusinessSettings}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isUploadingLogo || !form.formState.isDirty}
            className="min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            {isSaving || isUploadingLogo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploadingLogo ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

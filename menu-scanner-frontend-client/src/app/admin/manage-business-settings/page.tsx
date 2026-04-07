"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "@/redux/features/business/store/thunks/business-settings-thunks";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  businessSettingsSchema,
  type BusinessSettingsFormData,
} from "./schema/business-settings.schema";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";
import {
  getCachedThemeColors,
  cacheThemeColors,
  applyThemeColors,
  hasThemeChanged,
} from "@/utils/common/theme-cache";

/**
 * Convert API response to form data
 * Handles type conversions between API response and form data
 */
function convertResponseToFormData(
  response: BusinessSettingsResponse
): BusinessSettingsFormData {
  return {
    businessName: response.businessName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
    taxPercentage: response.taxPercentage?.toString() || "",
    logoBusinessUrl: response.logoBusinessUrl || "",
    enableStock: response.enableStock || "DISABLED",
    socialMedia: response.socialMedia || [],
    primaryColor: response.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
    contactAddress: response.contactAddress || "",
    contactPhone: response.contactPhone || "",
    contactEmail: response.contactEmail || "",
    businessHours: response.businessHours || [],
  };
}

export default function BusinessSettingsPage() {
  const dispatch = useAppDispatch();
  const reduxBusinessSettings = useAppSelector(selectBusinessSettings);

  const [isLoading, setIsLoading] = useState(!reduxBusinessSettings);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    mode: "onChange",
    defaultValues: {
      businessName: BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
      taxPercentage: "",
      logoBusinessUrl: "",
      enableStock: "DISABLED",
      socialMedia: [],
      primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      businessHours: [],
    },
  });

  // Fetch business settings (with cache support)
  useEffect(() => {
    if (!reduxBusinessSettings) {
      fetchBusinessSettings();
      return;
    }

    // Load from cache first for instant color application
    const cachedColors = getCachedThemeColors(reduxBusinessSettings.businessId);
    if (cachedColors) {
      console.log(
        `[THEME] Applied cached colors for business ${reduxBusinessSettings.businessId}`
      );
      applyThemeColors(cachedColors.primaryColor);
    }

    // Then reset form with latest data
    const formData = convertResponseToFormData(reduxBusinessSettings);
    form.reset(formData);
    setIsLoading(false);
  }, [reduxBusinessSettings]);

  const fetchBusinessSettings = async () => {
    try {
      // Try to load from cache first (instant, no loading state)
      if (reduxBusinessSettings) {
        // Store business ID in localStorage for theme initializer
        localStorage.setItem("businessId", reduxBusinessSettings.businessId);

        const cachedColors = getCachedThemeColors(
          reduxBusinessSettings.businessId
        );
        if (cachedColors) {
          console.log(
            `[THEME] Loading cached colors for business ${reduxBusinessSettings.businessId}`
          );
          applyThemeColors(cachedColors.primaryColor);
          const formData = convertResponseToFormData(reduxBusinessSettings);
          form.reset(formData);
        }
      }

      setIsLoading(true);
      const action = await dispatch(fetchBusinessSettingsThunk());

      // Check if the action was fulfilled and has a payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const data = action.payload as BusinessSettingsResponse;

        // Store business ID for theme initializer
        localStorage.setItem("businessId", data.businessId);

        const formData = convertResponseToFormData(data);
        form.reset(formData);

        // Check if colors changed and update cache if needed
        const cachedColors = getCachedThemeColors(data.businessId);
        const currentColors = {
          primaryColor: data.primaryColor || "",
        };

        if (hasThemeChanged(cachedColors, currentColors)) {
          console.log(
            `[THEME] Colors changed, updating cache for business ${data.businessId}`
          );
          cacheThemeColors(data.businessId, currentColors);
        }

        // Apply theme colors (may have changed from cache)
        applyThemeColors(data.primaryColor);
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

  // Handle business logo selection (store base64, upload on Save)
  const handleLogoSelect = (imageData: string) => {
    // Just store the base64 in the form, don't upload yet
    form.setValue("logoBusinessUrl", imageData, {
      shouldDirty: true,
    });
    showToast.success("✓ Logo selected - click Save Changes to upload");
  };


  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
      setIsSaving(true);

      // Upload logo if it's base64 (follows profile pattern)
      let logoBusinessUrl = data.logoBusinessUrl;
      if (isBase64Image(logoBusinessUrl)) {
        try {
          console.log("📤 [UPLOAD CDN] Uploading logo to CDN...");
          logoBusinessUrl = await uploadImage(logoBusinessUrl);
          console.log("✅ [UPLOAD CDN] Logo URL from CDN:", logoBusinessUrl);
        } catch (error) {
          console.error("Failed to upload logo:", error);
          showToast.error("Failed to upload logo");
          return;
        }
      }

      // Create payload with the uploaded logo URL
      const payload = {
        businessName: data.businessName,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusinessUrl: logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: data.socialMedia,
        primaryColor: data.primaryColor,
        contactAddress: data.contactAddress,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        businessHours: data.businessHours,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload));

      // Check if the action was fulfilled and has a payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const result = action.payload as BusinessSettingsResponse;

        // Log the saved data
        console.log("[FORM] Business settings saved to Redux:", {
          businessName: result.businessName,
          logoBusinessUrl: result.logoBusinessUrl,
          primaryColor: result.primaryColor,
        });

        // Store business ID in localStorage for theme initializer
        localStorage.setItem("businessId", result.businessId);

        // Cache the colors for instant load on next page refresh
        const colors = {
          primaryColor: result.primaryColor || "",
        };
        cacheThemeColors(result.businessId, colors);
        console.log(
          `[THEME] Cached colors for business ${result.businessId}`
        );

        // Apply colors in real-time without refresh
        if (result.primaryColor) {
          applyThemeColors(result.primaryColor);
        }

        showToast.success("Business settings updated successfully");
      } else {
        showToast.error("Failed to update business settings");
        console.error("[FORM] Failed to save settings. Action:", action);
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
                  disabled={isSaving}
                  aspectRatio="square"
                  height="h-48"
                  placeholder="Click to upload logo"
                  helperText="Upload a square image (PNG, JPG, etc.)"
                  maxSize={5}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Logo will be uploaded when you click Save Changes
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
              Customize your brand color (applies site-wide)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactAddress">Contact Address</Label>
                <Input
                  id="contactAddress"
                  placeholder="123 Street Name, Phnom Penh, Cambodia"
                  {...form.register("contactAddress")}
                />
                <p className="text-xs text-muted-foreground">
                  Physical address displayed in footer
                </p>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+855 12 345 678"
                  {...form.register("contactPhone")}
                />
                <p className="text-xs text-muted-foreground">
                  Phone number for customer inquiries
                </p>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...form.register("contactEmail")}
                />
                <p className="text-xs text-muted-foreground">
                  Email for customer support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                {form.watch("businessHours")?.length > 0
                  ? `${form.watch("businessHours").length} day${
                      form.watch("businessHours").length > 1 ? "s" : ""
                    } configured`
                  : "No business hours configured"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentHours = form.getValues("businessHours") || [];
                form.setValue("businessHours", [
                  ...currentHours,
                  { day: "", openingTime: "", closingTime: "" },
                ]);
              }}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </div>

          {form.watch("businessHours")?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No business hours configured
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.watch("businessHours")?.map((hours, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 relative lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Day
                          </Label>
                          <Input
                            placeholder="e.g., Monday"
                            value={hours.day}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].day = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Opening Time
                          </Label>
                          <Input
                            placeholder="09:00"
                            type="time"
                            value={hours.openingTime}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].openingTime = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Closing Time
                          </Label>
                          <Input
                            placeholder="22:00"
                            type="time"
                            value={hours.closingTime}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].closingTime = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
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
                            const currentHours =
                              form.getValues("businessHours") || [];
                            form.setValue(
                              "businessHours",
                              currentHours.filter((_, i) => i !== index),
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
                  { name: "", linkUrl: "" },
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            disabled={isSaving || !form.formState.isDirty}
            className="min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
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

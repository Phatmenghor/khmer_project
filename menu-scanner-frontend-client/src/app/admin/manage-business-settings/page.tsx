"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Save, Plus, Trash2, Eye, EyeOff, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SocialMedia,
} from "@/features/business/store/services/business-settings-service";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "@/features/business/store/thunks/business-settings-thunks";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  businessSettingsSchema,
  type BusinessSettingsFormData,
} from "./schema/business-settings.schema";
import { BusinessSettingsResponse } from "@/features/business/store/services/business-settings-service";
import {
  getCachedThemeColors,
  cacheThemeColors,
  applyThemeColors,
  hasThemeChanged,
} from "@/utils/common/theme-cache";


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
    useBrands: response.useBrands ?? false,
    lowStockThreshold: response.lowStockThreshold ?? BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
    telegramGroupChatId: response.telegramGroupChatId ?? "",
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
      useBrands: false,
      lowStockThreshold: BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
      telegramGroupChatId: "",
    },
  });

  const { isDirty, dirtyFields } = form.formState;


  useEffect(() => {
    if (reduxBusinessSettings?.businessId) {
      const cachedColors = getCachedThemeColors(reduxBusinessSettings.businessId);
      if (cachedColors) {
        applyThemeColors(cachedColors.primaryColor);
      }
    }
    fetchBusinessSettings();
  }, []);


  useEffect(() => {
    if (!reduxBusinessSettings) return;
    const formData = convertResponseToFormData(reduxBusinessSettings);
    form.reset(formData);
    setIsLoading(false);
  }, [reduxBusinessSettings]);

  const fetchBusinessSettings = async () => {
    try {
      setIsLoading(true);

      const action = await dispatch(fetchBusinessSettingsThunk());


      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const data = action.payload as BusinessSettingsResponse;
        const businessId = data.businessId;


        localStorage.setItem("businessId", businessId);

        const formData = convertResponseToFormData(data);
        form.reset(formData);


        const cachedData = getCachedThemeColors(businessId);
        const apiData = {
          primaryColor: data.primaryColor || "",
          businessName: data.businessName,
          logoBusinessUrl: data.logoBusinessUrl,
          taxPercentage: data.taxPercentage ?? undefined,
        };


        if (hasThemeChanged(cachedData, apiData)) {
          cacheThemeColors(businessId, apiData);


          applyThemeColors(data.primaryColor);
        } else {

          applyThemeColors(data.primaryColor);
        }
      } else {
        showToast.error(Messages.business.settingsLoadFailed);
      }
    } catch (error) {
      showToast.error(Messages.business.settingsLoadFailed);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogoSelect = (imageData: string) => {

    form.setValue("logoBusinessUrl", imageData, {
      shouldDirty: true,
    });
    showToast.success(Messages.business.logoSelected);
  };


  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
      console.log("Form submitted with data:", data);
      setIsSaving(true);


      let logoBusinessUrl = data.logoBusinessUrl;
      if (isBase64Image(logoBusinessUrl)) {
        try {
          logoBusinessUrl = await uploadImage(logoBusinessUrl);
        } catch (error) {
          showToast.error(Messages.business.logoUploadFailed);
          return;
        }
      }


      const uploadedSocialMedia = await Promise.all(
        (data.socialMedia || []).map(async (social) => {
          let imageUrl = (social as { name: string; linkUrl: string; imageUrl?: string }).imageUrl;
          if (imageUrl && isBase64Image(imageUrl)) {
            try {
              imageUrl = await uploadImage(imageUrl);
            } catch (error) {
              showToast.error(`Failed to upload ${social.name} icon`);
              throw error;
            }
          }
          return {
            ...social,
            imageUrl,
          };
        })
      );


      const payload = {
        businessName: data.businessName,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusinessUrl: logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: uploadedSocialMedia,
        primaryColor: data.primaryColor,
        contactAddress: data.contactAddress,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        businessHours: data.businessHours,
        useBrands: data.useBrands,
        lowStockThreshold: data.lowStockThreshold ?? BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
        telegramGroupChatId: data.telegramGroupChatId || null,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload));


      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const result = action.payload as BusinessSettingsResponse;


        localStorage.setItem("businessId", result.businessId);


        const businessData = {
          primaryColor: result.primaryColor || "",
          businessName: result.businessName,
          logoBusinessUrl: result.logoBusinessUrl,
          taxPercentage: result.taxPercentage ?? undefined,
        };
        cacheThemeColors(result.businessId, businessData);


        if (result.primaryColor) {
          applyThemeColors(result.primaryColor);
        }


        form.reset(convertResponseToFormData(result));

        showToast.success(Messages.business.settingsUpdated);
      } else {
        showToast.error(Messages.business.settingsUpdateFailed);
        return;
      }
    } catch (error) {
      showToast.error(Messages.business.settingsUpdateFailed);
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

  // Debug: Log form state
  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media accounts
        </p>
      </div>

      {hasErrors && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              Please fix the following errors:
            </p>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
              {Object.entries(formErrors).map(([field, error]: any) => (
                <li key={field}>• {field}: {error?.message || 'Invalid value'}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={form.handleSubmit(
          (data) => {
            console.log("Form is valid, submitting...", data);
            return onSubmit(data);
          },
          (errors) => {
            console.log("Form validation failed:", errors);
          }
        )}
        className="space-y-6"
      >
        {}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your business name"
                  {...form.register("businessName")}
                  className={form.formState.errors.businessName ? "border-red-500" : ""}
                />
                {form.formState.errors.businessName && (
                  <p className="text-xs text-red-500">{form.formState.errors.businessName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your business name displayed throughout the site
                </p>
              </div>

              {}
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

              {}
              <div className="space-y-2">
                <Label htmlFor="enableStock">Stock Management</Label>
                <Select
                  value={form.watch("enableStock")}
                  onValueChange={(value) =>
                    form.setValue(
                      "enableStock",
                      value as "ENABLED" | "DISABLED",
                      { shouldDirty: true }
                    )
                  }
                >
                  <SelectTrigger id="enableStock" className="h-10">
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

              {}
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  step="1"
                  className="h-10"
                  placeholder={String(BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD)}
                  disabled={isSaving || form.watch("enableStock") === "DISABLED"}
                  value={form.watch("lowStockThreshold") ?? BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    form.setValue("lowStockThreshold", isNaN(val) || val < 1 ? BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD : val, { shouldDirty: true });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Items with stock below this number are flagged as low stock (default: {BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD})
                </p>
                {form.formState.errors.lowStockThreshold && (
                  <p className="text-xs text-red-500">{form.formState.errors.lowStockThreshold.message}</p>
                )}
              </div>
            </div>

            {}
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
              {}
              <div />
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your brand color (applies site-wide)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <input
                  type="hidden"
                  {...form.register("primaryColor")}
                />
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <input
                    placeholder={BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className={`flex-1 px-3 py-2 border rounded-md ${form.formState.errors.primaryColor ? "border-red-500" : "border-input"}`}
                  />
                </div>
                {form.formState.errors.primaryColor && (
                  <p className="text-xs text-red-500">{form.formState.errors.primaryColor.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Main brand color
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Feature Configuration</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enable or disable features on your storefront
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Brands</h4>
                    <Badge variant={form.watch("useBrands") ? "default" : "secondary"}>
                      {form.watch("useBrands") ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show product brands in your storefront
                  </p>
                </div>
                <Button
                  type="button"
                  variant={form.watch("useBrands") ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    form.setValue("useBrands", !form.watch("useBrands"), {
                      shouldDirty: true,
                    })
                  }
                  disabled={isSaving}
                  className="ml-4"
                >
                  {form.watch("useBrands") ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
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

              {}
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

              {}
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

        {}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                {form.watch("businessHours")?.length
                  ? `${form.watch("businessHours")?.length ?? 0} day${
                      (form.watch("businessHours")?.length ?? 0) > 1 ? "s" : ""
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
                ], { shouldDirty: true });
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
                          <CustomTimePicker
                            value={hours.openingTime}
                            onChange={(time) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].openingTime = time;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                            placeholder="Select opening time"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Closing Time
                          </Label>
                          <CustomTimePicker
                            value={hours.closingTime}
                            onChange={(time) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].closingTime = time;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                            placeholder="Select closing time"
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

        {}
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
                ], { shouldDirty: true });
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
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {}
                          <div className="space-y-4 flex flex-col justify-between">
                            {}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Platform Name
                              </Label>
                              <Input
                                placeholder="e.g., Facebook, Instagram, TikTok"
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

                            {}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Profile Link
                              </Label>
                              <Input
                                placeholder="https://facebook.com/yourprofile"
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

                          {}
                          <div>
                            <ClickableImageUpload
                              label="Platform Icon"
                              value={social.imageUrl || ""}
                              onChange={(imageData) => {
                                const updated = [
                                  ...(form.getValues("socialMedia") || []),
                                ];
                                updated[index].imageUrl = imageData;
                                form.setValue("socialMedia", updated, { shouldDirty: true });
                              }}
                              disabled={isSaving}
                              aspectRatio="square"
                              height="h-32"
                              placeholder="Click to upload icon"
                              maxSize={5}
                              helperText="Upload platform icon/logo (PNG, JPG)"
                            />
                          </div>
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

        {/* Telegram Monitoring */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-500" />
              <CardTitle>Telegram Monitoring</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Receive order alerts and staff notifications in your Telegram group
            </p>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Setup guide */}
            <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 p-4 space-y-3">
              <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                How to set up (3 steps)
              </p>
              <ol className="space-y-3 text-sm text-sky-700 dark:text-sky-400">
                <li className="flex gap-3">
                  <span className="font-bold shrink-0 w-4">1.</span>
                  <span>
                    Add{" "}
                    <span className="font-semibold text-foreground">@CambodiaEMenuBot</span>{" "}
                    to your Telegram group.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0 w-4">2.</span>
                  <span>
                    <span className="font-semibold text-foreground">Promote the bot to Admin</span>
                    {" "}— required so it can send messages to the group.
                    <br />
                    <span className="text-xs text-sky-600 dark:text-sky-500">
                      Group Info → Administrators → Add Admin → search @CambodiaEMenuBot → Save.
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0 w-4">3.</span>
                  <span>
                    Type this command in the group — the bot will link automatically:
                    <br />
                    <code className="mt-1 inline-block bg-white dark:bg-sky-900 px-2 py-1 rounded text-xs font-mono border border-sky-200 dark:border-sky-700 select-all">
                      /link {reduxBusinessSettings?.businessId ?? "YOUR_BUSINESS_ID"}
                    </code>
                  </span>
                </li>
              </ol>
            </div>

            {form.watch("telegramGroupChatId") ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Monitoring group linked — chat ID{" "}
                  <span className="font-mono font-medium">
                    {form.watch("telegramGroupChatId")}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  No group linked yet. Follow the steps above to connect a Telegram group.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
            disabled={isSaving || (!isDirty && Object.keys(dirtyFields).length === 0)}
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

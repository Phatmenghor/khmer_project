"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/shared/common/show-toast";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Send,
  Building2,
  Image as ImageIcon,
  Phone,
  Palette,
  Clock,
  Share2,
} from "lucide-react";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { type SocialMedia } from "@/features/business/store/services/business-settings-service";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { AppDefault } from "@/constants/app-resource/default/default";
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
  response: BusinessSettingsResponse,
): BusinessSettingsFormData {
  return {
    businessName: response.businessName || "",
    taxPercentage: response.taxPercentage?.toString() || "",
    logoBusinessUrl: response.logoBusinessUrl || "",
    enableStock: response.enableStock || "DISABLED",
    socialMedia: response.socialMedia || [],
    primaryColor: response.primaryColor || "",
    contactAddress: response.contactAddress || "",
    contactPhone: response.contactPhone || "",
    contactEmail: response.contactEmail || "",
    businessHours: (response.businessHours || []).map((hour) => ({
      day: hour.day || "",
      openingTime: hour.openingTime || "",
      closingTime: hour.closingTime || "",
    })),
    useBrands: response.useBrands ?? false,
    lowStockThreshold:
      response.lowStockThreshold ??
      BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
    telegramGroupChatId: response.telegramGroupChatId ?? "",
  };
}

// Shared section card title — unified style across the page (mirrors portfolio)
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="shrink-0 p-1.5 rounded-md bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold leading-tight">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="text-center py-6 border-2 border-dashed rounded-md bg-muted/20">
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
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
      businessName: "",
      taxPercentage: "",
      logoBusinessUrl: "",
      enableStock: "DISABLED",
      socialMedia: [],
      primaryColor: "",
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
    fetchBusinessSettings();
  }, []);

  useEffect(() => {
    if (!reduxBusinessSettings) return;
    const formData = convertResponseToFormData(reduxBusinessSettings);
    form.reset(formData);
    setIsLoading(false);

    if (reduxBusinessSettings?.businessId) {
      const cachedColors = getCachedThemeColors(
        reduxBusinessSettings.businessId,
      );
      if (cachedColors) {
        applyThemeColors(cachedColors.primaryColor);
      }
    }
  }, [reduxBusinessSettings, form]);

  const fetchBusinessSettings = async () => {
    try {
      setIsLoading(true);
      const action = await dispatch(
        fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID),
      );

      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const data = action.payload as BusinessSettingsResponse;
        const businessId = data.businessId;

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
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = useCallback(
    (imageData: string) => {
      form.setValue("logoBusinessUrl", imageData, { shouldDirty: true });
      showToast.success(Messages.business.logoSelected);
    },
    [form],
  );

  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
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
          let imageUrl = (
            social as { name: string; linkUrl: string; imageUrl?: string }
          ).imageUrl;
          if (imageUrl && isBase64Image(imageUrl)) {
            try {
              imageUrl = await uploadImage(imageUrl);
            } catch (error) {
              showToast.error(`Failed to upload ${social.name} icon`);
              throw error;
            }
          }
          return { ...social, imageUrl };
        }),
      );

      const filteredBusinessHours = (data.businessHours || [])
        .filter((bh) => bh.day && bh.openingTime && bh.closingTime)
        .map((bh) => ({
          day: bh.day as string,
          openingTime: bh.openingTime as string,
          closingTime: bh.closingTime as string,
        }));

      const filteredSocialMedia: SocialMedia[] = uploadedSocialMedia
        .filter((sm) => Boolean(sm.name) && Boolean(sm.linkUrl))
        .map((sm) => ({
          name: sm.name as string,
          linkUrl: sm.linkUrl as string,
          imageUrl: sm.imageUrl,
        }));

      const payload = {
        businessName: data.businessName || undefined,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusinessUrl: logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: filteredSocialMedia,
        primaryColor: data.primaryColor,
        contactAddress: data.contactAddress || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        businessHours: filteredBusinessHours,
        useBrands: data.useBrands,
        lowStockThreshold:
          data.lowStockThreshold ??
          BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;
  const businessHours = form.watch("businessHours") || [];
  const socialMedia = form.watch("socialMedia") || [];

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your business profile, branding, hours, and integrations
        </p>
      </div>

      {hasErrors && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">
              Please fix the following errors:
            </p>
            <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
              {Object.entries(formErrors).map(([field, error]: any) => (
                <li key={field}>
                  • {field}: {error?.message || "Invalid value"}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={form.handleSubmit(
          (data) => onSubmit(data),
          (errors) => {
            const errorCount = Object.keys(errors).length;
            if (errorCount > 0) {
              const firstErrorField = Object.keys(errors)[0];
              const firstError = errors[firstErrorField as keyof typeof errors];
              const errorMessage =
                (firstError as any)?.message ||
                `Please fix ${errorCount} validation error${errorCount > 1 ? "s" : ""}`;
              showToast.error(errorMessage);
            }
          },
        )}
        className="space-y-5"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={Building2}
              title="Basic Information"
              subtitle="The core identity of your business"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="businessName"
                label="Business Name"
                placeholder="Your business name"
              />
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="taxPercentage"
                label="Tax Percentage"
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="0.00"
              />
              <SelectField<BusinessSettingsFormData>
                control={form.control}
                name="enableStock"
                label="Stock Management"
                options={[
                  { label: "Enabled", value: "ENABLED" },
                  { label: "Disabled", value: "DISABLED" },
                ]}
              />
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="lowStockThreshold"
                label="Low Stock Threshold"
                type="number"
                min={1}
                step={1}
                valueAsNumber
                disabled={isSaving || form.watch("enableStock") === "DISABLED"}
                placeholder={String(BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD)}
                error={form.formState.errors.lowStockThreshold}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding Image */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={ImageIcon}
              title="Branding Image"
              subtitle="Logo shown across your storefront"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClickableImageUpload
                label="Business Logo"
                value={form.watch("logoBusinessUrl")}
                onChange={handleLogoSelect}
                disabled={isSaving}
                aspectRatio="square"
                placeholder="Click to upload logo"
                helperText="Square (1:1) image recommended — PNG, JPG"
                maxSize={5}
              />
              <div />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={Phone}
              title="Contact Information"
              subtitle="How customers can reach you"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField<BusinessSettingsFormData>
              control={form.control}
              name="contactAddress"
              label="Contact Address"
              placeholder="123 Street Name, Phnom Penh, Cambodia"
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="contactPhone"
                label="Contact Phone"
                placeholder="+855 12 345 678"
              />
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="contactEmail"
                label="Contact Email"
                type="email"
                placeholder="support@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Color */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={Palette}
              title="Brand Color"
              subtitle="Main brand color applied site-wide"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <Label className="text-xs font-medium text-foreground">
                  Primary Color <span className="text-red-500 ml-1">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSaving}
                        className="w-14 h-[26px] cursor-pointer rounded border border-input"
                      />
                      <input
                        placeholder="#000000"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSaving}
                        className={`flex h-[26px] w-full rounded border bg-transparent px-2 py-0.5 text-[11px] shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 ${
                          form.formState.errors.primaryColor
                            ? "border-red-500"
                            : "border-input"
                        }`}
                      />
                    </div>
                  )}
                />
                <p
                  className={`text-xs text-red-500 ${
                    form.formState.errors.primaryColor?.message ? "min-h-[16px]" : ""
                  }`}
                >
                  {form.formState.errors.primaryColor?.message || ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Clock}
              title="Business Hours"
              subtitle={
                businessHours.length > 0
                  ? `${businessHours.length} day${businessHours.length > 1 ? "s" : ""} configured`
                  : "No business hours configured"
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentHours = form.getValues("businessHours") || [];
                form.setValue(
                  "businessHours",
                  [
                    ...currentHours,
                    { day: "", openingTime: "", closingTime: "" },
                  ],
                  { shouldDirty: true },
                );
              }}
              disabled={isSaving}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
            </Button>
          </CardHeader>
          <CardContent>
            {businessHours.length === 0 ? (
              <EmptyState message="No business hours configured" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessHours.map((_, index) => {
                  const hourErrors = (
                    form.formState.errors.businessHours as any
                  )?.[index];
                  const hasError = !!hourErrors;
                  return (
                    <div
                      key={index}
                      className={`border rounded-md p-4 relative hover:shadow-sm transition-shadow ${
                        hasError
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : ""
                      }`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => {
                          const currentHours =
                            form.getValues("businessHours") || [];
                          form.setValue(
                            "businessHours",
                            currentHours.filter((_, i) => i !== index),
                            { shouldDirty: true },
                          );
                        }}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-10">
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`businessHours.${index}.day`}
                          label="Day"
                          placeholder="e.g., Monday"
                          disabled={isSaving}
                        />
                        <div className="flex flex-col gap-1 w-full">
                          <Label className="text-xs font-medium text-foreground">
                            Opening Time
                          </Label>
                          <Controller
                            control={form.control}
                            name={`businessHours.${index}.openingTime`}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                disabled={isSaving}
                                placeholder="Open"
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <Label className="text-xs font-medium text-foreground">
                            Closing Time
                          </Label>
                          <Controller
                            control={form.control}
                            name={`businessHours.${index}.closingTime`}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                disabled={isSaving}
                                placeholder="Close"
                              />
                            )}
                          />
                        </div>
                      </div>
                      {hasError && !hourErrors?.day && hourErrors?.message && (
                        <p className="mt-2 text-xs text-red-600">
                          {hourErrors.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Share2}
              title="Social Media"
              subtitle={
                socialMedia.length > 0
                  ? `${socialMedia.length} account${socialMedia.length > 1 ? "s" : ""} added`
                  : "No social media accounts added"
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues("socialMedia") || [];
                form.setValue(
                  "socialMedia",
                  [...current, { name: "", imageUrl: "", linkUrl: "" }],
                  { shouldDirty: true },
                );
              }}
              disabled={isSaving}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {socialMedia.length === 0 ? (
              <EmptyState
                message="No social media accounts added"
                hint='Click "Add Account" to connect a platform'
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialMedia.map((_, index) => {
                  const socialErrors = (
                    form.formState.errors.socialMedia as any
                  )?.[index];
                  const hasError = !!socialErrors;
                  return (
                    <div
                      key={index}
                      className={`border rounded-md p-4 relative hover:shadow-sm transition-shadow ${
                        hasError
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : ""
                      }`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => {
                          const current = form.getValues("socialMedia") || [];
                          form.setValue(
                            "socialMedia",
                            current.filter((_, i) => i !== index),
                            { shouldDirty: true },
                          );
                        }}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="space-y-4 pr-10">
                        <Controller
                          control={form.control}
                          name={`socialMedia.${index}.imageUrl`}
                          render={({ field }) => (
                            <ClickableImageUpload
                              label="Platform Icon"
                              value={field.value || ""}
                              onChange={field.onChange}
                              disabled={isSaving}
                              aspectRatio="square"
                              placeholder="Click to upload icon"
                              maxSize={5}
                              helperText="Square (1:1) icon recommended — PNG, JPG"
                            />
                          )}
                        />
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`socialMedia.${index}.name`}
                          label="Platform Name"
                          placeholder="e.g., Facebook, Instagram, TikTok"
                          disabled={isSaving}
                        />
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`socialMedia.${index}.linkUrl`}
                          label="Profile Link"
                          placeholder="https://facebook.com/yourprofile"
                          disabled={isSaving}
                        />
                      </div>
                      {hasError && socialErrors?.message && (
                        <p className="mt-2 text-xs text-red-600">
                          {socialErrors.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telegram Monitoring */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={Send}
              title="Telegram Monitoring"
              subtitle="Receive order alerts and staff notifications in your Telegram group"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 p-3 space-y-2">
              <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                How to set up (3 steps)
              </p>
              <ol className="space-y-2 text-xs text-sky-700 dark:text-sky-400">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0 w-3">1.</span>
                  <span>
                    Add{" "}
                    <span className="font-semibold text-foreground">
                      @CambodiaEMenuBot
                    </span>{" "}
                    to your Telegram group.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0 w-3">2.</span>
                  <span>
                    <span className="font-semibold text-foreground">
                      Promote the bot to Admin
                    </span>{" "}
                    — required so it can send messages to the group.
                    <br />
                    <span className="text-xs text-sky-600 dark:text-sky-500">
                      Group Info → Administrators → Add Admin → search
                      @CambodiaEMenuBot → Save.
                    </span>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0 w-3">3.</span>
                  <span>
                    Type this command in the group — the bot will link
                    automatically:
                    <br />
                    <code className="mt-1 inline-block bg-white dark:bg-sky-900 px-1 py-1 rounded text-xs font-mono border border-sky-200 dark:border-sky-700 select-all">
                      /link{" "}
                      {reduxBusinessSettings?.businessId ?? "YOUR_BUSINESS_ID"}
                    </code>
                  </span>
                </li>
              </ol>
            </div>

            {form.watch("telegramGroupChatId") ? (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-md border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Monitoring group linked — chat ID{" "}
                  <span className="font-mono font-medium">
                    {form.watch("telegramGroupChatId")}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-md border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  No group linked yet. Follow the steps above to connect a
                  Telegram group.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <CancelButton
            onClick={fetchBusinessSettings}
            disabled={isSaving}
            text="Cancel"
          />
          <SubmitButton
            isSubmitting={isSaving}
            isDirty={isDirty || Object.keys(dirtyFields).length > 0}
            isCreate={false}
            updateText="Save Changes"
            submittingUpdateText="Saving..."
            icon={<Save className="h-4 w-4" />}
            className="min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          />
        </div>
      </form>
    </div>
  );
}

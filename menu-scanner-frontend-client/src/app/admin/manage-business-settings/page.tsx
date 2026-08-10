"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
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
  Clock,
  Share2,
} from "lucide-react";


import { type SocialMedia } from "@/features/business/store/services/business-settings-service";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
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
import { uploadMultiSize, SpacesMultiSizeResult } from "@/services/spaces-service";

function toImageUrls(r: SpacesMultiSizeResult): ImageUrls {
  return { sm: r.sm.url, md: r.md.url, o: r.o.url };
}
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import {
  businessSettingsSchema,
  type BusinessSettingsFormData,
} from "./schema/business-settings.schema";
import { BusinessSettingsResponse } from "@/features/business/store/services/business-settings-service";
import {
  cacheThemeColors,
} from "@/utils/common/theme-cache";
import { ReceiptSize } from "@/enums/receipt-size.enum";

function convertResponseToFormData(
  response: BusinessSettingsResponse,
): BusinessSettingsFormData {
  return {
    businessName: response.businessName || "",
    taxPercentage: response.taxPercentage?.toString() || "",
    logoBusiness: response.logoBusiness || {},
    enableStock: response.enableStock || "DISABLED",
    socialMedia: (response.socialMedia || []).map((sm) => ({
      name: sm.name,
      linkUrl: sm.linkUrl,
      image: sm.image || {},
    })),
    contactAddress: response.contactAddress || "",
    contactPhone: response.contactPhone || "",
    contactEmail: response.contactEmail || "",
    businessHours: (response.businessHours || []).map((hour) => ({
      day: hour.day || "",
      openingTime: hour.openingTime || "",
      closingTime: hour.closingTime || "",
    })),
    useBrands: response.useBrands ?? true,
    lowStockThreshold:
      response.lowStockThreshold ??
      BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
    telegramGroupChatId: response.telegramGroupChatId ?? "",
    receiptSize: response.receiptSize || ReceiptSize.SIZE_58MM,
    wifiName: response.wifiName ?? "",
    wifiPassword: response.wifiPassword ?? "",
  };
}

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

  // Deferred upload state for logo
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoBlobUrl, setLogoBlobUrl] = useState<string>("");

  // Deferred upload state for social media icons (indexed parallel array)
  const [pendingSocialFiles, setPendingSocialFiles] = useState<(File | null)[]>([]);
  const [socialBlobUrls, setSocialBlobUrls] = useState<string[]>([]);

  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      taxPercentage: "",
      logoBusiness: {},
      enableStock: "DISABLED",
      socialMedia: [],
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      businessHours: [],
      useBrands: true,
      lowStockThreshold: BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
      telegramGroupChatId: "",
      receiptSize: ReceiptSize.SIZE_58MM,
      wifiName: "",
      wifiPassword: "",
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
    setPendingLogoFile(null);
    setLogoBlobUrl("");
    setPendingSocialFiles([]);
    setSocialBlobUrls([]);
    setIsLoading(false);

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

        if (true) {
          cacheThemeColors(businessId, {
            businessName: data.businessName,
            logoBusinessUrl: data.logoBusiness?.sm,
            taxPercentage: data.taxPercentage ?? undefined,
          });
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoFileSelected = useCallback((file: File | null) => {
    if (logoBlobUrl) URL.revokeObjectURL(logoBlobUrl);
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setPendingLogoFile(file);
      setLogoBlobUrl(blobUrl);
      form.setValue("logoBusiness", { sm: blobUrl, md: blobUrl, o: blobUrl }, { shouldDirty: true });
    } else {
      setPendingLogoFile(null);
      setLogoBlobUrl("");
      form.setValue("logoBusiness", {}, { shouldDirty: true });
    }
  }, [form, logoBlobUrl]);

  const handleSocialFileSelected = useCallback((index: number, file: File | null) => {
    setPendingSocialFiles((prev) => {
      const next = [...prev];
      if (socialBlobUrls[index]) URL.revokeObjectURL(socialBlobUrls[index]);
      next[index] = file;
      return next;
    });
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setSocialBlobUrls((prev) => { const next = [...prev]; next[index] = blobUrl; return next; });
      form.setValue(`socialMedia.${index}.image`, { sm: blobUrl, md: blobUrl, o: blobUrl }, { shouldDirty: true });
    } else {
      setSocialBlobUrls((prev) => { const next = [...prev]; next[index] = ""; return next; });
      form.setValue(`socialMedia.${index}.image`, {}, { shouldDirty: true });
    }
  }, [form, socialBlobUrls]);

  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
      setIsSaving(true);
      const businessId = AppDefault.BUSINESS_ID;

      // Upload logo if pending
      let logoBusiness: ImageUrls | undefined = data.logoBusiness as ImageUrls | undefined;
      if (pendingLogoFile) {
        try {
          logoBusiness = toImageUrls(await uploadMultiSize(pendingLogoFile, businessId));
        } catch (error) {
          showToast.error(Messages.business.logoUploadFailed);
          return;
        }
      }

      // Upload social media icons
      const uploadedSocialMedia = await Promise.all(
        (data.socialMedia || []).map(async (social, index) => {
          const pendingFile = pendingSocialFiles[index];
          if (pendingFile) {
            try {
              const uploaded = await uploadMultiSize(pendingFile, businessId);
              return { ...social, image: toImageUrls(uploaded) };
            } catch (error) {
              showToast.error(`Failed to upload ${social.name} icon`);
              throw error;
            }
          }
          return social;
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
          image: sm.image as ImageUrls | undefined,
        }));

      const payload = {
        businessName: data.businessName || undefined,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusiness: logoBusiness && (logoBusiness.sm || logoBusiness.md || logoBusiness.o) ? logoBusiness : undefined,
        enableStock: data.enableStock,
        socialMedia: filteredSocialMedia,
        contactAddress: data.contactAddress || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        businessHours: filteredBusinessHours,
        useBrands: data.useBrands,
        lowStockThreshold:
          data.lowStockThreshold ??
          BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
        telegramGroupChatId: data.telegramGroupChatId || null,
        receiptSize: data.receiptSize,
        wifiName: data.wifiName || null,
        wifiPassword: data.wifiPassword || null,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload));

      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const result = action.payload as BusinessSettingsResponse;

        localStorage.setItem("businessId", result.businessId);

        cacheThemeColors(result.businessId, {
          businessName: result.businessName,
          logoBusinessUrl: result.logoBusiness?.sm,
          taxPercentage: result.taxPercentage ?? undefined,
        });

        form.reset(convertResponseToFormData(result));
        setPendingLogoFile(null);
        setLogoBlobUrl("");
        setPendingSocialFiles([]);
        setSocialBlobUrls([]);

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
  const watchLogoBusiness = form.watch("logoBusiness");

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
        {/* Business Profile & Branding */}
        <Card className="border border-border/60 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-sm bg-card">
          <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
            <SectionTitle
              icon={Building2}
              title="Business Profile & Branding"
              subtitle="The core identity, logo, and contact details of your storefront"
            />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left Column: Logo + Core Identity Fields */}
              <div className="w-full lg:w-[260px] shrink-0 flex flex-col space-y-4">
                <div className="w-full">
                  <SpacesImageUpload
                    businessId={AppDefault.BUSINESS_ID}
                    label="Business Logo"
                    value={watchLogoBusiness?.o || watchLogoBusiness?.md || watchLogoBusiness?.sm || ""}
                    multiSize
                    deferred
                    onFileSelected={handleLogoFileSelected}
                    disabled={isSaving}
                    aspectRatio="square"
                    placeholder="Click to upload logo"
                    helperText="Square (1:1) recommended — PNG, JPG"
                    maxSizeMb={5}
                  />
                </div>
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="businessName"
                  label="Business Name"
                  placeholder="Enter your business name"
                  disabled={isSaving}
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="contactPhone"
                  label="Contact Phone"
                  placeholder="Enter your contact phone number"
                  disabled={isSaving}
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="contactEmail"
                  label="Contact Email"
                  type="email"
                  placeholder="Enter your contact email address"
                  disabled={isSaving}
                />
              </div>

              {/* Right Column: Store Settings (2 Items Per Row) */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-3 rounded-full bg-primary shrink-0" />
                    Store Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField<BusinessSettingsFormData>
                      control={form.control}
                      name="receiptSize"
                      label="Default Receipt Size"
                      options={[
                        { label: "Small receipt (58mm)", value: "SIZE_58MM" },
                        { label: "Standard receipt (80mm)", value: "SIZE_80MM" },
                        { label: "Large receipt (112mm)", value: "SIZE_112MM" },
                      ]}
                      disabled={isSaving}
                    />
                    <TextField<BusinessSettingsFormData>
                      control={form.control}
                      name="taxPercentage"
                      label="Tax Percentage"
                      pattern="[0-9.]"
                      placeholder="Enter your tax percentage"
                      disabled={isSaving}
                    />
                    <TextField<BusinessSettingsFormData>
                      control={form.control}
                      name="lowStockThreshold"
                      label="Low Stock Threshold"
                      valueAsNumber
                      allowZero={false}
                      disabled={isSaving}
                      placeholder="Enter low stock threshold"
                      error={form.formState.errors.lowStockThreshold}
                    />
                    <SelectField<BusinessSettingsFormData>
                      control={form.control}
                      name="enableStock"
                      label="Stock Management"
                      options={[
                        { label: "Enabled", value: "ENABLED" },
                        { label: "Disabled", value: "DISABLED" },
                      ]}
                      disabled={isSaving}
                    />
                    <TextField<BusinessSettingsFormData>
                      control={form.control}
                      name="wifiName"
                      label="Wi-Fi Name (SSID)"
                      placeholder="Enter Wi-Fi Network Name"
                      disabled={isSaving}
                    />
                    <TextField<BusinessSettingsFormData>
                      control={form.control}
                      name="wifiPassword"
                      label="Wi-Fi Password"
                      placeholder="Enter Wi-Fi Password"
                      disabled={isSaving}
                    />
                    <div className="sm:col-span-2">
                      <TextareaField<BusinessSettingsFormData>
                        control={form.control}
                        name="contactAddress"
                        label="Contact Address"
                        placeholder="Enter your contact address"
                        rows={2}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="border border-border/60 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/40 bg-muted/10 pb-4">
            <SectionTitle
              icon={Clock}
              title="Business Hours"
              subtitle={
                businessHours.length > 0
                  ? `${businessHours.length} day${businessHours.length > 1 ? "s" : ""} configured`
                  : "No business hours configured"
              }
            />
            <CustomButton
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
              className="hover:bg-primary/5 hover:text-primary transition-colors duration-200"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
            </CustomButton>
          </CardHeader>
          <CardContent className="pt-6">
            {businessHours.length === 0 ? (
              <EmptyState message="No business hours configured" />
            ) : (
              <div className="space-y-4">
                {businessHours.map((_, index) => {
                  const hourErrors = (
                    form.formState.errors.businessHours as any
                  )?.[index];
                  const hasError = !!hourErrors;
                  return (
                    <div
                      key={index}
                      className={`border border-border/60 rounded-xl p-4 sm:p-5 relative hover:shadow-xs hover:border-primary/30 transition-all duration-300 bg-muted/5 flex flex-col md:flex-row md:items-end gap-4 ${
                        hasError
                          ? "border-red-300 bg-red-50/30 dark:bg-red-950/10"
                          : ""
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`businessHours.${index}.day`}
                          label="Day"
                          placeholder="Enter day (e.g., Monday)"
                          disabled={isSaving}
                        />
                        <div className="flex flex-col gap-1.5 w-full">
                          <Label className="text-xs font-semibold text-foreground">
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
                        <div className="flex flex-col gap-1.5 w-full">
                          <Label className="text-xs font-semibold text-foreground">
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
                      
                      <div className="flex justify-end md:pb-1 shrink-0">
                        <CustomButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-9 w-9 p-0"
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
                          <Trash2 className="h-4 w-4" />
                        </CustomButton>
                      </div>
                      {hasError && !hourErrors?.day && hourErrors?.message && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
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
        <Card className="border border-border/60 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/40 bg-muted/10 pb-4">
            <SectionTitle
              icon={Share2}
              title="Social Media"
              subtitle={
                socialMedia.length > 0
                  ? `${socialMedia.length} account${socialMedia.length > 1 ? "s" : ""} added`
                  : "No social media accounts added"
              }
            />
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues("socialMedia") || [];
                form.setValue(
                  "socialMedia",
                  [...current, { name: "", image: {}, linkUrl: "" }],
                  { shouldDirty: true },
                );
                setPendingSocialFiles((prev) => [...prev, null]);
                setSocialBlobUrls((prev) => [...prev, ""]);
              }}
              disabled={isSaving}
              className="hover:bg-primary/5 hover:text-primary transition-colors duration-200"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Account
            </CustomButton>
          </CardHeader>
          <CardContent className="pt-6">
            {socialMedia.length === 0 ? (
              <EmptyState
                message="No social media accounts added"
                hint='Click "Add Account" to connect a platform'
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialMedia.map((_, index) => {
                  const socialErrors = (
                    form.formState.errors.socialMedia as any
                  )?.[index];
                  const hasError = !!socialErrors;
                  const watchImage = form.watch(`socialMedia.${index}.image`);
                  return (
                    <div
                      key={index}
                      className={`border border-border/60 rounded-xl p-5 hover:shadow-xs hover:border-primary/30 transition-all duration-300 bg-muted/5 space-y-4 ${
                        hasError
                          ? "border-red-300 bg-red-50/30 dark:bg-red-950/10"
                          : ""
                      }`}
                    >
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Platform #{index + 1}
                        </span>
                        <CustomButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8 p-0"
                          onClick={() => {
                            const current = form.getValues("socialMedia") || [];
                            form.setValue(
                              "socialMedia",
                              current.filter((_, i) => i !== index),
                              { shouldDirty: true },
                            );
                            if (socialBlobUrls[index]) URL.revokeObjectURL(socialBlobUrls[index]);
                            setPendingSocialFiles((prev) => prev.filter((_, i) => i !== index));
                            setSocialBlobUrls((prev) => prev.filter((_, i) => i !== index));
                          }}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </CustomButton>
                      </div>

                      {/* Content */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        {/* Social Icon Uploder */}
                        <div className="sm:col-span-4 flex flex-col justify-start">
                          <SpacesImageUpload
                            businessId={AppDefault.BUSINESS_ID}
                            label="Platform Icon"
                            value={watchImage?.o || watchImage?.md || watchImage?.sm || ""}
                            multiSize
                            deferred
                            onFileSelected={(file) => handleSocialFileSelected(index, file)}
                            disabled={isSaving}
                            aspectRatio="square"
                            placeholder="Click icon"
                            maxSizeMb={5}
                            helperText="1:1 (PNG, JPG)"
                          />
                        </div>
                        {/* Social Input Fields */}
                        <div className="sm:col-span-8 space-y-3">
                          <TextField<BusinessSettingsFormData>
                            control={form.control}
                            name={`socialMedia.${index}.name`}
                            label="Platform Name"
                            placeholder="Enter platform name (e.g., Facebook)"
                            disabled={isSaving}
                          />
                          <TextField<BusinessSettingsFormData>
                            control={form.control}
                            name={`socialMedia.${index}.linkUrl`}
                            label="Profile Link"
                            placeholder="Enter profile link (e.g., https://...)"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      {hasError && socialErrors?.message && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
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
        <Card className="border border-border/60 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-sm bg-card">
          <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
            <SectionTitle
              icon={Send}
              title="Telegram Monitoring"
              subtitle="Receive order alerts and staff notifications in your Telegram group"
            />
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-sky-500/[0.03] to-indigo-500/[0.03] dark:from-sky-400/[0.02] dark:to-indigo-400/[0.02] p-5 space-y-4 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-sky-400/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <p className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-sky-500 shrink-0 shadow-sm animate-pulse" />
                Quick Setup Guide
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="flex flex-col gap-3 p-4 bg-card/60 dark:bg-muted/5 border border-border/80 rounded-xl hover:border-sky-300/40 dark:hover:border-sky-700/40 hover:shadow-2xs transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-500 text-white text-[11px] font-extrabold shrink-0 shadow-xs">1</span>
                    <span className="text-xs font-bold text-foreground">Add Bot</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300">
                    Add <span className="px-1.5 py-0.5 rounded-md bg-sky-50/50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-semibold text-[11px] border border-sky-100/50 dark:border-sky-900/50">@CambodiaEMenuBot</span> to your Telegram group.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col gap-3 p-4 bg-card/60 dark:bg-muted/5 border border-border/80 rounded-xl hover:border-sky-300/40 dark:hover:border-sky-700/40 hover:shadow-2xs transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-500 text-white text-[11px] font-extrabold shrink-0 shadow-xs">2</span>
                    <span className="text-xs font-bold text-foreground">Make Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300 delay-75">
                    Promote the bot to <span className="font-semibold text-foreground">Admin</span> in group settings to enable alert messaging.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-3 p-4 bg-card/60 dark:bg-muted/5 border border-border/80 rounded-xl hover:border-sky-300/40 dark:hover:border-sky-700/40 hover:shadow-2xs transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-500 text-white text-[11px] font-extrabold shrink-0 shadow-xs">3</span>
                    <span className="text-xs font-bold text-foreground">Link Chat</span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-300 delay-150">
                    <span>Send command in your group:</span>
                    <code className="block w-full text-center bg-sky-50/50 dark:bg-sky-950/20 px-2 py-1 rounded text-[10px] font-mono border border-sky-100/60 dark:border-sky-900/40 select-all font-semibold text-sky-700 dark:text-sky-400 shadow-3xs hover:bg-sky-100/50 dark:hover:bg-sky-900/30 transition-all duration-200 cursor-pointer">
                      /link {reduxBusinessSettings?.businessId || AppDefault.BUSINESS_ID}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="telegramGroupChatId"
                label="Telegram Group Chat ID"
                placeholder="Enter Telegram group chat ID"
                disabled={isSaving}
              />
            </div>

            {form.watch("telegramGroupChatId") ? (
              <div className="flex items-center gap-2.5 p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Monitoring group linked — chat ID{" "}
                  <span className="font-mono font-bold bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded text-[11px]">
                    {form.watch("telegramGroupChatId")}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-lg border border-border/60 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <p className="text-xs text-muted-foreground font-medium">
                  No group linked yet. Follow the steps above to connect a Telegram group.
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
            className="min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300 shadow-xs hover:shadow-sm"
          />
        </div>
      </form>
    </div>
  );
}

"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/shared/common/show-toast";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Send,
  Building2,
  Phone,
  Clock,
  Share2,
  Sparkles,
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
import { cacheThemeColors } from "@/utils/common/theme-cache";
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
    storeDescription: response.storeDescription || "",
  };
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function EmptySectionState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="text-center py-6 border-2 border-dashed border-border/80 rounded-xl bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground">{message}</p>
      {hint && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{hint}</p>}
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
      storeDescription: "",
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

        cacheThemeColors(businessId, {
          businessName: data.businessName,
          logoBusinessUrl: data.logoBusiness?.sm,
          taxPercentage: data.taxPercentage ?? undefined,
        });
      }
    } catch {
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
        } catch {
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
        storeDescription: data.storeDescription || null,
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
    } catch {
      showToast.error(Messages.business.settingsUpdateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading business settings...</p>
      </div>
    );
  }

  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;
  const businessHours = form.watch("businessHours") || [];
  const socialMedia = form.watch("socialMedia") || [];
  const watchLogoBusiness = form.watch("logoBusiness");

  return (
    <div className="flex flex-1 flex-col gap-5 px-1 pb-10 pt-2">
      {/* Top Header */}
      <div className="space-y-1">
        <h1 className="text-base font-extrabold text-foreground">Business Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your business profile, branding, hours, and integrations
        </p>
      </div>

      {hasErrors && (
        <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 p-4 text-xs">
          <p className="font-bold text-red-600 dark:text-red-400 mb-1">
            Please fix the following validation errors:
          </p>
          <ul className="text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
            {Object.entries(formErrors).map(([field, error]: any) => (
              <li key={field}>
                <span className="font-semibold">{field}</span>: {error?.message || "Invalid value"}
              </li>
            ))}
          </ul>
        </div>
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
        className="space-y-6"
      >
        {/* Section 1: Business Profile & Branding */}
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
          <SectionHeader
            icon={Building2}
            title="Business Profile & Branding"
            subtitle="The core identity, logo, and contact details of your storefront"
          />
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left Column: Logo */}
            <div className="w-full lg:w-[240px] shrink-0">
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
                helperText="Square (1:1) logo recommended — PNG, JPG"
                maxSizeMb={5}
              />
            </div>

            {/* Right Column: Information & Details Fields */}
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="businessName"
                  label="Business Name"
                  placeholder="Enter business name..."
                  disabled={isSaving}
                  required
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="contactPhone"
                  label="Contact Phone"
                  placeholder="Enter contact phone..."
                  disabled={isSaving}
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="contactEmail"
                  label="Contact Email"
                  type="email"
                  placeholder="Enter contact email..."
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  label="Tax Percentage (%)"
                  pattern="[0-9.]"
                  placeholder="Enter tax percentage..."
                  disabled={isSaving}
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="lowStockThreshold"
                  label="Low Stock Threshold"
                  valueAsNumber
                  allowZero={false}
                  disabled={isSaving}
                  placeholder="Enter low stock threshold..."
                  error={form.formState.errors.lowStockThreshold}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  placeholder="Enter Wi-Fi network name..."
                  disabled={isSaving}
                />
                <TextField<BusinessSettingsFormData>
                  control={form.control}
                  name="wifiPassword"
                  label="Wi-Fi Password"
                  placeholder="Enter Wi-Fi password..."
                  disabled={isSaving}
                />
              </div>

              <TextareaField<BusinessSettingsFormData>
                control={form.control}
                name="storeDescription"
                label="Storefront Tagline / Welcome Description"
                placeholder="Enter storefront tagline (e.g. Welcome to My Business. Explore our full digital menu...)..."
                rows={2}
                disabled={isSaving}
              />
              <TextField<BusinessSettingsFormData>
                control={form.control}
                name="contactAddress"
                label="Contact Address"
                placeholder="Enter physical contact address..."
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business Hours */}
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
          <SectionHeader
            icon={Clock}
            title="Operating Schedule & Hours"
            subtitle={
              businessHours.length > 0
                ? `${businessHours.length} day${businessHours.length > 1 ? "s" : ""} configured`
                : "No business hours configured"
            }
            action={
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 font-bold text-xs h-8"
                onClick={() => {
                  const currentHours = form.getValues("businessHours") || [];
                  form.setValue(
                    "businessHours",
                    [
                      ...currentHours,
                      { day: "", openingTime: "08:00", closingTime: "18:00" },
                    ],
                    { shouldDirty: true },
                  );
                }}
                disabled={isSaving}
              >
                <Plus className="w-3.5 h-3.5" /> Add Business Day
              </CustomButton>
            }
          />
          {businessHours.length === 0 ? (
            <EmptySectionState message="No business hours configured" />
          ) : (
            <div className="space-y-3">
              {businessHours.map((_, index) => {
                const hourErrors = (
                  form.formState.errors.businessHours as any
                )?.[index];
                const hasError = !!hourErrors;
                return (
                  <div
                    key={index}
                    className={`border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors ${
                      hasError ? "border-red-500/40 bg-red-500/5" : ""
                    }`}
                  >
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                      onClick={() => {
                        const currentHours = form.getValues("businessHours") || [];
                        form.setValue(
                          "businessHours",
                          currentHours.filter((_, i) => i !== index),
                          { shouldDirty: true },
                        );
                      }}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </CustomButton>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                      <TextField<BusinessSettingsFormData>
                        control={form.control}
                        name={`businessHours.${index}.day`}
                        label="Day of Week"
                        placeholder="Enter day of week (e.g. Monday)..."
                        disabled={isSaving}
                      />
                      <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">
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
                              placeholder="Enter open time"
                            />
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">
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
                              placeholder="Enter close time"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Social Media */}
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
          <SectionHeader
            icon={Share2}
            title="Social Media Channels"
            subtitle={
              socialMedia.length > 0
                ? `${socialMedia.length} account${socialMedia.length > 1 ? "s" : ""} configured`
                : "No social media accounts added"
            }
            action={
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 font-bold text-xs h-8"
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
              >
                <Plus className="w-3.5 h-3.5" /> Add Social Account
              </CustomButton>
            }
          />
          {socialMedia.length === 0 ? (
            <EmptySectionState
              message="No social media accounts added"
              hint='Click "Add Social Account" to attach platform links'
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialMedia.map((_, index) => {
                const watchImage = form.watch(`socialMedia.${index}.image`);
                return (
                  <div
                    key={index}
                    className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors space-y-3"
                  >
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
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
                      <Trash2 className="h-3.5 w-3.5" />
                    </CustomButton>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pr-8">
                      <div className="sm:col-span-4">
                        <SpacesImageUpload
                          businessId={AppDefault.BUSINESS_ID}
                          label="Icon"
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
                      <div className="sm:col-span-8 space-y-3">
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`socialMedia.${index}.name`}
                          label="Platform Name"
                          placeholder="Enter platform name..."
                          disabled={isSaving}
                        />
                        <TextField<BusinessSettingsFormData>
                          control={form.control}
                          name={`socialMedia.${index}.linkUrl`}
                          label="Profile Link"
                          placeholder="Enter profile link..."
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Telegram Monitoring */}
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
          <SectionHeader
            icon={Send}
            title="Telegram Integration & Monitoring"
            subtitle="Receive instant order alerts and staff notifications directly in your Telegram group"
          />
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
            <p className="text-xs font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Telegram Group Integration Guide
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-card rounded-xl border border-border/60">
                <span className="text-xs font-bold text-primary">1. Add Bot</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Add <span className="font-semibold text-foreground">@CambodiaEMenuBot</span> to your Telegram group.
                </p>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border/60">
                <span className="text-xs font-bold text-primary">2. Promote Admin</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Make the bot an Admin in group settings for message delivery.
                </p>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border/60">
                <span className="text-xs font-bold text-primary">3. Link Group</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Send <code className="px-1 py-0.5 bg-muted rounded font-mono text-[11px]">/link {reduxBusinessSettings?.businessId || AppDefault.BUSINESS_ID}</code> in your group.
                </p>
              </div>
            </div>
          </div>

          <TextField<BusinessSettingsFormData>
            control={form.control}
            name="telegramGroupChatId"
            label="Telegram Group Chat ID"
            placeholder="Enter Telegram group chat ID..."
            disabled={isSaving}
          />
        </div>

        {/* ── Floating / Bottom Save Action Bar ── */}
        <div className="sticky bottom-4 z-40 rounded-[16px] border border-border/80 bg-card/90 backdrop-blur-md p-3 px-5 flex items-center justify-between shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">
            {isDirty || Object.keys(dirtyFields).length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">● Unsaved changes detected</span>
            ) : (
              "All business settings saved"
            )}
          </p>
          <div className="flex items-center gap-2">
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchBusinessSettings}
              disabled={isSaving}
            >
              Reset
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || (!isDirty && Object.keys(dirtyFields).length === 0)}
              className="gap-1.5 font-bold min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </CustomButton>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Building2,
  Image as ImageIcon,
  Phone,
  Share2,
  Sparkles,
  BarChart3,
  Clock,
  GalleryHorizontal,
  Briefcase,
  Users,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/shared/common/show-toast";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useAppDispatch } from "@/store";
import { usePortfolioProfileState } from "@/features/portfolio/store/state/portfolio-profile-state";
import {
  fetchAdminPortfolioProfileThunk,
  saveAdminPortfolioProfileThunk,
} from "@/features/portfolio/store/thunks/portfolio-thunks";
import { resetState } from "@/features/portfolio/store/slice/portfolio-profile-slice";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  PortfolioProfileSaveRequest,
  PortfolioAdminProfile,
} from "@/features/portfolio/store/models/portfolio-types";
import {
  portfolioFormSchema,
  type PortfolioFormData,
} from "./schema/portfolio-form.schema";

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioFormData {
  const contact = p.contact || {};
  return {
    businessName: p.businessName || "",
    description: p.description || "",
    logoUrl: p.logoUrl || "",
    coverImageUrl: p.coverImageUrl || "",
    contact: {
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      phones: (contact.phones || []).map((ph) => ({ id: ph.id, number: ph.number })),
      whatsapp: contact.whatsapp || "",
      telegram: contact.telegram || "",
      address: contact.address || "",
      mapLink: contact.mapLink || "",
    },
    socialMedia: (p.socialMedia || []).map((sm) => ({ id: sm.id, name: sm.name, url: sm.url })),
    features: (p.features || []).map((f) => ({ id: f.id, name: f.name })),
    customStats: (p.stats || []).map((s) => ({ id: s.id, label: s.label, value: s.value })),
    businessHours:
      p.businessHours?.map((h) => ({
        id: h.id,
        day: h.day,
        openTime: h.openTime || "",
        closeTime: h.closeTime || "",
      })) ?? [],
    gallery: (p.gallery || []).map((g) => ({ id: g.id, url: g.url, title: g.title || "" })),
    services: (p.services || []).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || "",
    })),
    team: (p.team || []).map((m) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      bio: m.bio || "",
      photoUrl: m.photoUrl || "",
    })),
  };
}

const emptyForm = (): PortfolioFormData => ({
  businessName: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  contact: { email: "", phone: "", phones: [], whatsapp: "", telegram: "", address: "", mapLink: "" },
  socialMedia: [],
  features: [],
  customStats: [],
  businessHours: [],
  gallery: [],
  services: [],
  team: [],
});

// Shared section card title — unified style across the page
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

export default function PortfolioPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSaving } = usePortfolioProfileState();

  const defaultValues = useMemo(() => emptyForm(), []);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const { fields: businessHoursFields, append: appendBusinessHour, remove: removeBusinessHour } = useFieldArray({ control: form.control, name: "businessHours" });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: form.control, name: "gallery" });
  const { fields: servicesFields, append: appendService, remove: removeService } = useFieldArray({ control: form.control, name: "services" });
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({ control: form.control, name: "team" });
  const { fields: customStatsFields, append: appendCustomStat, remove: removeCustomStat } = useFieldArray({ control: form.control, name: "customStats" });
  const { fields: socialMediaFields, append: appendSocialMedia, remove: removeSocialMedia } = useFieldArray({ control: form.control, name: "socialMedia" });
  const { fields: featuresFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: "features" });
  const { fields: contactPhonesFields, append: appendContactPhone, remove: removeContactPhone } = useFieldArray({ control: form.control, name: "contact.phones" });

  useAdminCleanup(() => { dispatch(resetState()); });

  useEffect(() => {
    dispatch(fetchAdminPortfolioProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      try {
        const formData = buildFormFromProfile(profile);
        form.reset(formData);
      } catch (err) {
        console.error("Error building portfolio form from profile:", err);
        showToast.error("Error loading portfolio data");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      let logoUrl = data.logoUrl || "";
      let coverImageUrl = data.coverImageUrl || "";

      if (logoUrl && isBase64Image(logoUrl)) {
        try { logoUrl = await uploadImage(logoUrl); }
        catch { showToast.error("Failed to upload logo"); return; }
      }
      if (coverImageUrl && isBase64Image(coverImageUrl)) {
        try { coverImageUrl = await uploadImage(coverImageUrl); }
        catch { showToast.error("Failed to upload cover image"); return; }
      }

      const uploadedGallery = await Promise.all(
        (data.gallery || []).map(async (item) => {
          let url = item.url;
          if (url && isBase64Image(url)) {
            try { url = await uploadImage(url); }
            catch { showToast.error("Failed to upload gallery image"); throw new Error("Gallery upload failed"); }
          }
          return { ...item, url };
        })
      );

      const uploadedTeam = await Promise.all(
        (data.team || []).map(async (member) => {
          let photoUrl = member.photoUrl || "";
          if (photoUrl && isBase64Image(photoUrl)) {
            try { photoUrl = await uploadImage(photoUrl); }
            catch { showToast.error("Failed to upload team photo"); throw new Error("Team photo upload failed"); }
          }
          return { ...member, photoUrl };
        })
      );

      const submitData: PortfolioProfileSaveRequest = {
        businessName: data.businessName || "",
        description: data.description || "",
        logoUrl,
        coverImageUrl,
        contact: {
          email: data.contact?.email || "",
          phone: data.contact?.phone || "",
          phones: data.contact?.phones || [],
          whatsapp: data.contact?.whatsapp || "",
          telegram: data.contact?.telegram || "",
          address: data.contact?.address || "",
          mapLink: data.contact?.mapLink || "",
        },
        socialMedia: data.socialMedia || [],
        businessHours: data.businessHours || [],
        gallery: uploadedGallery,
        services: data.services || [],
        team: uploadedTeam,
        features: data.features || [],
        customStats: data.customStats || [],
      };

      const result = await dispatch(saveAdminPortfolioProfileThunk(submitData));
      if (saveAdminPortfolioProfileThunk.fulfilled.match(result)) {
        showToast.success("Portfolio profile saved successfully");
      } else {
        showToast.error("Failed to save portfolio profile");
      }
    } catch {
      showToast.error("Failed to save portfolio profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Portfolio Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your public business profile — services, team, gallery, and more
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

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
            <TextField<PortfolioFormData>
              control={form.control}
              name="businessName"
              label="Business Name"
              placeholder="e.g. Mega Store"
              required
              error={form.formState.errors.businessName}
            />
            <TextareaField<PortfolioFormData>
              control={form.control}
              name="description"
              label="Business Description"
              placeholder="Describe your business in detail — what you offer, your values, and what makes you unique..."
              rows={6}
              required
              error={form.formState.errors.description}
            />
          </CardContent>
        </Card>

        {/* Branding Images */}
        <Card>
          <CardHeader>
            <SectionTitle
              icon={ImageIcon}
              title="Branding Images"
              subtitle="Logo and cover image shown on your public page"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="logoUrl"
                control={form.control}
                render={({ field }) => (
                  <ClickableImageUpload
                    label="Business Logo"
                    value={field.value || ""}
                    onChange={(v) => { field.onChange(v); showToast.success("Logo selected"); }}
                    aspectRatio="square"
                    height="h-40"
                    placeholder="Click to upload logo"
                    helperText="Square image recommended (PNG, JPG)"
                    maxSize={5}
                  />
                )}
              />
              <Controller
                name="coverImageUrl"
                control={form.control}
                render={({ field }) => (
                  <ClickableImageUpload
                    label="Cover Image"
                    value={field.value || ""}
                    onChange={(v) => { field.onChange(v); showToast.success("Cover image selected"); }}
                    aspectRatio="video"
                    height="h-40"
                    placeholder="Click to upload cover"
                    helperText="Wide banner image recommended (PNG, JPG)"
                    maxSize={5}
                  />
                )}
              />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.email"
                label="Email Address"
                type="email"
                placeholder="contact@business.com"
                error={form.formState.errors.contact?.email}
              />
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.phone"
                label="Primary Phone"
                placeholder="+855 12 345 678"
                error={form.formState.errors.contact?.phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.whatsapp"
                label="WhatsApp Number"
                placeholder="+855 12 345 678"
                error={form.formState.errors.contact?.whatsapp}
              />
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.telegram"
                label="Telegram Link"
                placeholder="https://t.me/yourbusiness"
                error={form.formState.errors.contact?.telegram}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.address"
                label="Physical Address"
                placeholder="Street 271, Toul Kork, Phnom Penh, Cambodia, 12000"
                error={form.formState.errors.contact?.address}
              />
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.mapLink"
                label="Google Maps Link"
                placeholder="https://maps.google.com/?q=your+location"
                error={form.formState.errors.contact?.mapLink}
              />
            </div>

            {/* Additional Phones */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Additional Phone Numbers</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {contactPhonesFields.length > 0
                      ? `${contactPhonesFields.length} number${contactPhonesFields.length > 1 ? "s" : ""} added`
                      : "No additional numbers"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendContactPhone({ id: "", number: "" })}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Phone
                </Button>
              </div>
              {contactPhonesFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contactPhonesFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <TextField<PortfolioFormData>
                          control={form.control}
                          name={`contact.phones.${index}.number`}
                          label="Phone Number"
                          placeholder="+855 12 345 678"
                          required
                          error={form.formState.errors.contact?.phones?.[index]?.number}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeContactPhone(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No additional phone numbers added" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Share2}
              title="Social Media"
              subtitle={
                socialMediaFields.length > 0
                  ? `${socialMediaFields.length} account${socialMediaFields.length > 1 ? "s" : ""} connected`
                  : "No social media accounts added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendSocialMedia({ id: "", name: "", url: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {socialMediaFields.length > 0 ? (
              <div className="space-y-3">
                {socialMediaFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`socialMedia.${index}.name`}
                        label="Platform"
                        placeholder="Facebook, Instagram..."
                        required
                        error={form.formState.errors.socialMedia?.[index]?.name}
                      />
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`socialMedia.${index}.url`}
                        label="URL"
                        placeholder="https://..."
                        required
                        error={form.formState.errors.socialMedia?.[index]?.url}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No social media accounts added"
                hint='Click "Add Account" to get started'
              />
            )}
          </CardContent>
        </Card>

        {/* Features & Amenities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Sparkles}
              title="Features & Amenities"
              subtitle={
                featuresFields.length > 0
                  ? `${featuresFields.length} feature${featuresFields.length > 1 ? "s" : ""} listed`
                  : "No features added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendFeature({ id: "", name: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent>
            {featuresFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuresFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`features.${index}.name`}
                        label="Feature"
                        placeholder="Feature name..."
                        required
                        error={form.formState.errors.features?.[index]?.name}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No features added" />
            )}
          </CardContent>
        </Card>

        {/* Business Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={BarChart3}
              title="Business Statistics"
              subtitle={
                customStatsFields.length > 0
                  ? `${customStatsFields.length} stat${customStatsFields.length > 1 ? "s" : ""} configured`
                  : "No stats added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendCustomStat({ id: "", label: "", value: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Stat
            </Button>
          </CardHeader>
          <CardContent>
            {customStatsFields.length > 0 ? (
              <div className="space-y-3">
                {customStatsFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeCustomStat(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`customStats.${index}.value`}
                        label="Value"
                        placeholder="e.g., 10,000+"
                        required
                        error={form.formState.errors.customStats?.[index]?.value}
                      />
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`customStats.${index}.label`}
                        label="Label"
                        placeholder="e.g., Happy Customers"
                        required
                        error={form.formState.errors.customStats?.[index]?.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No statistics added" />
            )}
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Clock}
              title="Business Hours"
              subtitle={
                businessHoursFields.length > 0
                  ? `${businessHoursFields.length} day${businessHoursFields.length > 1 ? "s" : ""} configured`
                  : "No hours configured yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendBusinessHour({ id: "", day: "", openTime: "08:00", closeTime: "18:00" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Hours
            </Button>
          </CardHeader>
          <CardContent>
            {businessHoursFields.length > 0 ? (
              <div className="space-y-3">
                {businessHoursFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeBusinessHour(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`businessHours.${index}.day`}
                        label="Day"
                        placeholder="e.g. Monday"
                        required
                      />
                      <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-medium text-foreground">Open Time</Label>
                        <Controller
                          name={`businessHours.${index}.openTime`}
                          control={form.control}
                          render={({ field: timeField }) => (
                            <CustomTimePicker
                              value={timeField.value || ""}
                              onChange={timeField.onChange}
                              placeholder="Open"
                            />
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-medium text-foreground">Close Time</Label>
                        <Controller
                          name={`businessHours.${index}.closeTime`}
                          control={form.control}
                          render={({ field: timeField }) => (
                            <CustomTimePicker
                              value={timeField.value || ""}
                              onChange={timeField.onChange}
                              placeholder="Close"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No business hours added" />
            )}
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={GalleryHorizontal}
              title="Photo Gallery"
              subtitle={
                galleryFields.length > 0
                  ? `${galleryFields.length} image${galleryFields.length > 1 ? "s" : ""} in gallery`
                  : "No gallery images added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendGallery({ id: "", url: "", title: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Image
            </Button>
          </CardHeader>
          <CardContent>
            {galleryFields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-3 space-y-3 hover:shadow-sm transition-shadow">
                    <Controller
                      name={`gallery.${index}.url`}
                      control={form.control}
                      render={({ field: f }) => (
                        <ClickableImageUpload
                          label={`Image ${index + 1}`}
                          value={f.value}
                          onChange={f.onChange}
                          height="h-40"
                          aspectRatio="landscape"
                          placeholder="Click to upload"
                          maxSize={5}
                        />
                      )}
                    />
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <TextField<PortfolioFormData>
                          control={form.control}
                          name={`gallery.${index}.title`}
                          label="Caption (optional)"
                          placeholder="e.g., Store Entrance"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => removeGallery(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No gallery images"
                hint="Showcase your store, products, or events"
              />
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Briefcase}
              title="Services"
              subtitle={
                servicesFields.length > 0
                  ? `${servicesFields.length} service${servicesFields.length > 1 ? "s" : ""} listed`
                  : "No services added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendService({ id: "", name: "", description: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {servicesFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="space-y-3 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`services.${index}.name`}
                        label="Service Name"
                        placeholder="Service name..."
                        required
                        error={form.formState.errors.services?.[index]?.name}
                      />
                      <TextareaField<PortfolioFormData>
                        control={form.control}
                        name={`services.${index}.description`}
                        label="Description"
                        placeholder="Describe what this service includes..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No services listed"
                hint="e.g., In-Store Shopping, Online Ordering, Gift Wrapping"
              />
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <SectionTitle
              icon={Users}
              title="Team Members"
              subtitle={
                teamFields.length > 0
                  ? `${teamFields.length} member${teamFields.length > 1 ? "s" : ""} on the team`
                  : "No team members added yet"
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendTeam({ id: "", name: "", position: "", bio: "", photoUrl: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {teamFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeTeam(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="space-y-4 pr-10">
                      <div className="w-32">
                        <Controller
                          name={`team.${index}.photoUrl`}
                          control={form.control}
                          render={({ field: f }) => (
                            <ClickableImageUpload
                              label="Photo"
                              value={f.value || ""}
                              onChange={f.onChange}
                              aspectRatio="square"
                              height="h-32"
                              placeholder="Upload"
                              maxSize={5}
                              showPreviewText={false}
                            />
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextField<PortfolioFormData>
                          control={form.control}
                          name={`team.${index}.name`}
                          label="Full Name"
                          placeholder="John Doe"
                          required
                          error={form.formState.errors.team?.[index]?.name}
                        />
                        <TextField<PortfolioFormData>
                          control={form.control}
                          name={`team.${index}.position`}
                          label="Position / Title"
                          placeholder="Store Manager"
                          required
                          error={form.formState.errors.team?.[index]?.position}
                        />
                      </div>

                      <TextareaField<PortfolioFormData>
                        control={form.control}
                        name={`team.${index}.bio`}
                        label="Bio"
                        placeholder="Short bio about this team member..."
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No team members added"
                hint="Introduce your team to build trust with customers"
              />
            )}
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(fetchAdminPortfolioProfileThunk())}
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

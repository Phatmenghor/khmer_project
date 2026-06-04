"use client";

import { useEffect, useMemo } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-3 py-4">
      <div className="space-y-1">
        <h1 className="text-xs font-bold">Portfolio Profile</h1>
        <p className="text-muted-foreground">
          Manage your public business profile — services, team, gallery, and more
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              rows={5}
              required
              error={form.formState.errors.description}
            />
          </CardContent>
        </Card>

        {/* Branding Images */}
        <Card>
          <CardHeader>
            <CardTitle>Branding Images</CardTitle>
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
                    height="h-32"
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
                    height="h-32"
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
            <CardTitle>Contact Information</CardTitle>
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
            <div className="border-t pt-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Additional Phone Numbers</p>
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
                  <Plus className="w-3 h-3 mr-1" /> Add Phone
                </Button>
              </div>
              {contactPhonesFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {contactPhonesFields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Phone Number <span className="text-red-500">*</span></Label>
                      <div className="flex gap-1.5 items-center">
                        <Input
                          placeholder="+855 12 345 678"
                          {...form.register(`contact.phones.${index}.number`)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeContactPhone(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 border-2 border-dashed rounded">
                  <p className="text-xs text-muted-foreground">No additional phone numbers added</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Social Media</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {socialMediaFields.length > 0
                  ? `${socialMediaFields.length} account${socialMediaFields.length > 1 ? "s" : ""} connected`
                  : "No social media accounts added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendSocialMedia({ id: "", name: "", url: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {socialMediaFields.length > 0 ? (
              <div className="space-y-2">
                {socialMediaFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Platform <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Facebook, Instagram..."
                          {...form.register(`socialMedia.${index}.name`)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">URL <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="https://..."
                          {...form.register(`socialMedia.${index}.url`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No social media accounts added</p>
                <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Account&quot; to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features & Amenities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Features &amp; Amenities</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {featuresFields.length > 0
                  ? `${featuresFields.length} feature${featuresFields.length > 1 ? "s" : ""} listed`
                  : "No features added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendFeature({ id: "", name: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent>
            {featuresFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {featuresFields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Feature <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1.5 items-center">
                      <Input
                        placeholder="Feature name..."
                        {...form.register(`features.${index}.name`)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No features added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Business Statistics</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {customStatsFields.length > 0
                  ? `${customStatsFields.length} stat${customStatsFields.length > 1 ? "s" : ""} configured`
                  : "No stats added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendCustomStat({ id: "", label: "", value: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Stat
            </Button>
          </CardHeader>
          <CardContent>
            {customStatsFields.length > 0 ? (
              <div className="space-y-2">
                {customStatsFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeCustomStat(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Value <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="e.g., 10,000+"
                          {...form.register(`customStats.${index}.value`)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Label <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="e.g., Happy Customers"
                          {...form.register(`customStats.${index}.label`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No statistics added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Business Hours</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {businessHoursFields.length > 0
                  ? `${businessHoursFields.length} day${businessHoursFields.length > 1 ? "s" : ""} configured`
                  : "No hours configured yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendBusinessHour({ id: "", day: "", openTime: "08:00", closeTime: "18:00" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Hours
            </Button>
          </CardHeader>
          <CardContent>
            {businessHoursFields.length > 0 ? (
              <div className="space-y-2">
                {businessHoursFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeBusinessHour(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Day <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="e.g. Monday"
                          {...form.register(`businessHours.${index}.day`)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Open Time</Label>
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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Close Time</Label>
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
              <div className="text-center py-3 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No business hours added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Photo Gallery</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {galleryFields.length > 0
                  ? `${galleryFields.length} image${galleryFields.length > 1 ? "s" : ""} in gallery`
                  : "No gallery images added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendGallery({ id: "", url: "", title: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Image
            </Button>
          </CardHeader>
          <CardContent>
            {galleryFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {galleryFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 space-y-2 hover:shadow-sm transition-shadow">
                    <Controller
                      name={`gallery.${index}.url`}
                      control={form.control}
                      render={({ field: f }) => (
                        <ClickableImageUpload
                          label=""
                          value={f.value}
                          onChange={f.onChange}
                          height="h-24"
                          placeholder="Click to upload"
                          maxSize={5}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Caption (optional)</Label>
                      <div className="flex gap-1.5 items-center">
                        <Controller
                          name={`gallery.${index}.title`}
                          control={form.control}
                          render={({ field: f }) => (
                            <Input placeholder="e.g., Store Entrance" {...f} />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                          onClick={() => removeGallery(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-7 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No gallery images</p>
                <p className="text-xs text-muted-foreground mt-1">Showcase your store, products, or events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {servicesFields.length > 0
                  ? `${servicesFields.length} service${servicesFields.length > 1 ? "s" : ""} listed`
                  : "No services added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendService({ id: "", name: "", description: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {servicesFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicesFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 relative hover:shadow-sm transition-shadow">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Service Name <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Service name..."
                          {...form.register(`services.${index}.name`)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Description</Label>
                        <Controller
                          name={`services.${index}.description`}
                          control={form.control}
                          render={({ field: f }) => (
                            <Textarea
                              placeholder="Describe what this service includes..."
                              rows={2}
                              className="resize-none text-xs"
                              {...f}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-7 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No services listed</p>
                <p className="text-xs text-muted-foreground mt-1">e.g., In-Store Shopping, Online Ordering, Gift Wrapping</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {teamFields.length > 0
                  ? `${teamFields.length} member${teamFields.length > 1 ? "s" : ""} on the team`
                  : "No team members added yet"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendTeam({ id: "", name: "", position: "", bio: "", photoUrl: "" })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {teamFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamFields.map((field, index) => (
                  <div key={field.id} className="border rounded p-3 hover:shadow-sm transition-shadow">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-20">
                        <Controller
                          name={`team.${index}.photoUrl`}
                          control={form.control}
                          render={({ field: f }) => (
                            <ClickableImageUpload
                              label="Photo"
                              value={f.value || ""}
                              onChange={f.onChange}
                              aspectRatio="square"
                              height="h-20"
                              placeholder="Upload"
                              maxSize={5}
                            />
                          )}
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Full Name <span className="text-red-500">*</span></Label>
                              <Controller
                                name={`team.${index}.name`}
                                control={form.control}
                                render={({ field: f }) => (
                                  <Input placeholder="John Doe" className="text-xs font-semibold" {...f} />
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Position / Title <span className="text-red-500">*</span></Label>
                              <Controller
                                name={`team.${index}.position`}
                                control={form.control}
                                render={({ field: f }) => (
                                  <Input placeholder="Store Manager" className="text-xs" {...f} />
                                )}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-5 w-5 p-0 shrink-0"
                            onClick={() => removeTeam(index)}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Bio</Label>
                          <Controller
                            name={`team.${index}.bio`}
                            control={form.control}
                            render={({ field: f }) => (
                              <Textarea
                                placeholder="Short bio about this team member..."
                                rows={4}
                                className="resize-none text-xs"
                                {...f}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-7 border-2 border-dashed rounded">
                <p className="text-xs text-muted-foreground">No team members added</p>
                <p className="text-xs text-muted-foreground mt-1">Introduce your team to build trust with customers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        <div className="flex gap-2 justify-end pt-3 border-t">
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
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3 w-3" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { showToast } from "@/components/shared/common/show-toast";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useAppDispatch } from "@/store";
import { usePortfolioProfileState } from "@/features/portfolio/store/state/portfolio-profile-state";
import { fetchAdminPortfolioProfileThunk, saveAdminPortfolioProfileThunk } from "@/features/portfolio/store/thunks/portfolio-thunks";
import { resetState } from "@/features/portfolio/store/slice/portfolio-profile-slice";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  PortfolioProfileSaveRequest,
  PortfolioHoursRequest,
  PortfolioGalleryItemRequest,
  PortfolioServiceItemRequest,
  PortfolioTeamMemberRequest,
  PortfolioCustomStatRequest,
  PortfolioSocialMediaRequest,
  PortfolioAdminProfile,
} from "@/features/portfolio/store/models/portfolio-types";
import {
  portfolioFormSchema,
  type PortfolioFormData,
} from "./schema/portfolio-form.schema";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioFormData {
  const contact = p.contact || {};
  return {
    description: p.description || "",
    logoUrl: p.logoUrl || "",
    coverImageUrl: p.coverImageUrl || "",
    contact: {
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      phones: contact.phones ?? [],
      whatsapp: contact.whatsapp || "",
      telegram: contact.telegram || "",
      address: contact.address || "",
      mapLink: contact.mapLink || "",
    },
    socialMedia: Array.isArray(p.socialMedia) ? p.socialMedia : [],
    features: p.features?.map((f: any) => ({ id: f.id, name: f.name || f })) ?? [],
    customStats: (Array.isArray(p.stats) ? p.stats : p.stats?.customStats) ?? [],
    businessHours: p.businessHours?.map((h) => ({
      id: h.id,
      day: h.day,
      openTime: h.openTime || "",
      closeTime: h.closeTime || "",
    })) ?? DAYS.map((d) => ({ day: d, openTime: "08:00", closeTime: "18:00" })),
    gallery: p.gallery?.map((g) => ({ id: g.id, url: g.url, title: g.title || "" })) ?? [],
    services: p.services?.map((s) => ({ id: s.id, name: s.name, description: s.description })) ?? [],
    team: p.team?.map((m) => ({ id: m.id, name: m.name, position: m.position, bio: m.bio || "", photoUrl: m.photoUrl || "" })) ?? [],
  };
}

const emptyForm = (): PortfolioFormData => ({
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  contact: {
    email: "",
    phone: "",
    phones: [],
    whatsapp: "",
    telegram: "",
    address: "",
    mapLink: "",
  },
  socialMedia: [],
  features: [],
  customStats: [],
  businessHours: DAYS.map((d) => ({ day: d, openTime: "08:00", closeTime: "18:00" })),
  gallery: [],
  services: [],
  team: [],
});

export default function PortfolioPage() {
  const dispatch = useAppDispatch();
  const { profile } = usePortfolioProfileState();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues = useMemo(() => emptyForm(), []);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const { fields: businessHoursFields, append: appendBusinessHours, remove: removeBusinessHours } = useFieldArray({
    control: form.control,
    name: "businessHours",
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  const { fields: servicesFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control: form.control,
    name: "team",
  });

  const { fields: customStatsFields, append: appendCustomStat, remove: removeCustomStat } = useFieldArray({
    control: form.control,
    name: "customStats",
  });

  const { fields: socialMediaFields, append: appendSocialMedia, remove: removeSocialMedia } = useFieldArray({
    control: form.control,
    name: "socialMedia",
  });

  const { fields: featuresFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const { fields: contactPhonesFields, append: appendContactPhone, remove: removeContactPhone } = useFieldArray({
    control: form.control,
    name: "contact.phones",
  });

  useAdminCleanup(() => {
    dispatch(resetState());
  });

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      await dispatch(fetchAdminPortfolioProfileThunk());
    } catch (err) {
      showToast.error("Failed to load portfolio profile");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    const formData = buildFormFromProfile(profile);
    form.reset(formData);
    setIsLoading(false);
  }, [profile]);

  const handleLogoSelect = useCallback((imageData: string) => {
    form.setValue("logoUrl", imageData, { shouldDirty: true });
    showToast.success("Logo selected");
  }, []);

  const handleCoverImageSelect = useCallback((imageData: string) => {
    form.setValue("coverImageUrl", imageData, { shouldDirty: true });
    showToast.success("Cover image selected");
  }, []);

  const handleGalleryImageSelect = useCallback((index: number, imageData: string) => {
    const gallery = form.getValues("gallery");
    gallery[index].url = imageData;
    form.setValue("gallery", gallery, { shouldDirty: true });
    showToast.success("Gallery image selected");
  }, []);

  const handleTeamPhotoSelect = useCallback((index: number, imageData: string) => {
    const team = form.getValues("team");
    team[index].photoUrl = imageData;
    form.setValue("team", team, { shouldDirty: true });
    showToast.success("Team photo selected");
  }, []);

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      setIsSaving(true);

      let logoUrl = data.logoUrl || "";
      let coverImageUrl = data.coverImageUrl || "";

      if (logoUrl && isBase64Image(logoUrl)) {
        try {
          logoUrl = await uploadImage(logoUrl);
        } catch {
          showToast.error("Failed to upload logo");
          return;
        }
      }

      if (coverImageUrl && isBase64Image(coverImageUrl)) {
        try {
          coverImageUrl = await uploadImage(coverImageUrl);
        } catch {
          showToast.error("Failed to upload cover image");
          return;
        }
      }

      const uploadedGallery = await Promise.all(
        (data.gallery || []).map(async (item) => {
          let url = item.url;
          if (url && isBase64Image(url)) {
            try {
              url = await uploadImage(url);
            } catch {
              showToast.error("Failed to upload gallery image");
              throw new Error("Gallery upload failed");
            }
          }
          return { ...item, url };
        })
      );

      const uploadedTeam = await Promise.all(
        (data.team || []).map(async (member) => {
          let photoUrl = member.photoUrl || "";
          if (photoUrl && isBase64Image(photoUrl)) {
            try {
              photoUrl = await uploadImage(photoUrl);
            } catch {
              showToast.error("Failed to upload team photo");
              throw new Error("Team photo upload failed");
            }
          }
          return { ...member, photoUrl };
        })
      );

      const submitData: PortfolioProfileSaveRequest = {
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
        await fetchProfile();
      } else {
        showToast.error("Failed to save portfolio profile");
      }
    } catch (error) {
      console.error("Error saving portfolio:", error);
      showToast.error("Failed to save portfolio profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Portfolio Profile</h1>
        <p className="text-muted-foreground">
          Manage your business portfolio, services, team, and customer reviews
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TextareaField<PortfolioFormData>
              control={form.control}
              name="description"
              label="Description"
              placeholder="Detailed business description..."
              rows={5}
              error={form.formState.errors.description}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <ClickableImageUpload
                label="Logo"
                value={form.getValues("logoUrl")}
                onChange={handleLogoSelect}
              />
            </div>

            <div className="space-y-2">
              <ClickableImageUpload
                label="Cover Image"
                value={form.getValues("coverImageUrl")}
                onChange={handleCoverImageSelect}
              />
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
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.email"
                label="Email"
                type="email"
                placeholder="contact@business.com"
                error={form.formState.errors.contact?.email}
              />
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.phone"
                label="Phone"
                placeholder="+1-234-567-8900"
                error={form.formState.errors.contact?.phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.whatsapp"
                label="WhatsApp"
                placeholder="+1-234-567-8900"
                error={form.formState.errors.contact?.whatsapp}
              />
              <TextField<PortfolioFormData>
                control={form.control}
                name="contact.telegram"
                label="Telegram"
                placeholder="https://t.me/..."
                error={form.formState.errors.contact?.telegram}
              />
            </div>

            {/* Additional Contact Phones */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Additional Phone Numbers</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendContactPhone({ id: "", number: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Phone
                </Button>
              </div>
              {contactPhonesFields.length > 0 ? (
                <div className="space-y-3">
                  {contactPhonesFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="+1-234-567-8900"
                        {...form.register(`contact.phones.${index}.number`)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeContactPhone(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No additional phone numbers added</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TextareaField<PortfolioFormData>
              control={form.control}
              name="contact.address"
              label="Address"
              placeholder="Street 271, Toul Kork, Phnom Penh, Phnom Penh, Cambodia, 12000"
              rows={3}
              error={form.formState.errors.contact?.address}
            />

            <TextField<PortfolioFormData>
              control={form.control}
              name="contact.mapLink"
              label="Map Link"
              placeholder="https://maps.google.com/..."
              error={form.formState.errors.contact?.mapLink}
            />
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Media</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendSocialMedia({ id: "", name: "", url: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Social Media
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialMediaFields.length > 0 ? (
              <div className="space-y-4">
                {socialMediaFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 p-4 border rounded-lg">
                    <Input
                      placeholder="Name (Facebook, Instagram, Twitter, YouTube, etc.)"
                      {...form.register(`socialMedia.${index}.name`)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      {...form.register(`socialMedia.${index}.url`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No social media links added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Features & Amenities</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendFeature({ id: "", name: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuresFields.length > 0 ? (
              <div className="space-y-3">
                {featuresFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="Feature name..."
                      {...form.register(`features.${index}.name`)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No features added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessHoursFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Open Time</Label>
                    <Controller
                      name={`businessHours.${index}.openTime`}
                      control={form.control}
                      render={({ field: timeField }) => (
                        <CustomTimePicker
                          value={timeField.value || "08:00"}
                          onChange={timeField.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Close Time</Label>
                    <Controller
                      name={`businessHours.${index}.closeTime`}
                      control={form.control}
                      render={({ field: timeField }) => (
                        <CustomTimePicker
                          value={timeField.value || "18:00"}
                          onChange={timeField.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gallery</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendGallery({ id: "", url: "", title: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Image
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {galleryFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Image {index + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeGallery(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Controller
                    name={`gallery.${index}.url`}
                    control={form.control}
                    render={({ field }) => (
                      <ClickableImageUpload
                        label="Image"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Controller
                    name={`gallery.${index}.title`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        placeholder="Image title..."
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendService({ id: "", name: "", description: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {servicesFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Service {index + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Service Name</Label>
                  <Controller
                    name={`services.${index}.name`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        placeholder="Service name..."
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Controller
                    name={`services.${index}.description`}
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        placeholder="Service description..."
                        rows={3}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendTeam({ id: "", name: "", position: "", bio: "", photoUrl: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {teamFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">{field.name || "Team Member"}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTeam(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Controller
                    name={`team.${index}.photoUrl`}
                    control={form.control}
                    render={({ field: photoField }) => (
                      <ClickableImageUpload
                        label="Photo"
                        value={photoField.value}
                        onChange={photoField.onChange}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Name</Label>
                    <Controller
                      name={`team.${index}.name`}
                      control={form.control}
                      render={({ field: nameField }) => (
                        <Input
                          placeholder="Full name..."
                          {...nameField}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <Controller
                      name={`team.${index}.position`}
                      control={form.control}
                      render={({ field: posField }) => (
                        <Input
                          placeholder="Job title..."
                          {...posField}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Bio</Label>
                  <Controller
                    name={`team.${index}.bio`}
                    control={form.control}
                    render={({ field: bioField }) => (
                      <Textarea
                        placeholder="Team member bio..."
                        rows={3}
                        {...bioField}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Custom Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Custom Statistics</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendCustomStat({ id: "", label: "", value: "" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Stat
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {customStatsFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1">
                  <Controller
                    name={`customStats.${index}.label`}
                    control={form.control}
                    render={({ field: labelField }) => (
                      <Input placeholder="Label (e.g., Products)" {...labelField} />
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name={`customStats.${index}.value`}
                    control={form.control}
                    render={({ field: valueField }) => (
                      <Input placeholder="Value (e.g., 10,000+)" {...valueField} />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCustomStat(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchProfile()}
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

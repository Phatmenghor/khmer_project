"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { showToast } from "@/components/shared/common/show-toast";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
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

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioProfileSaveRequest {
  const contact = p.contact || {};
  return {
    slug: p.slug || "",
    tagline: p.tagline || "",
    description: p.description || "",
    logoUrl: p.logoUrl || "",
    coverImageUrl: p.coverImageUrl || "",
    contactEmail: contact.email || "",
    contactPhone: contact.phone || "",
    contactPhones: contact.phones ?? [],
    contactWhatsapp: contact.whatsapp || "",
    contactTelegram: contact.telegram || "",
    address: contact.address || "",
    mapLink: contact.mapLink || "",
    socialMedia: Array.isArray(p.socialMedia) ? p.socialMedia : [],
    features: p.features ?? [],
    yearsInBusiness: p.stats?.yearsInBusiness,
    customersServed: p.stats?.customersServed,
    customStats: p.stats?.customStats ?? [],
    businessHours: p.businessHours?.map((h) => ({
      id: h.id,
      day: h.day,
      openTime: h.openTime || "",
      closeTime: h.closeTime || "",
    })) ?? DAYS.map((d) => ({ day: d, openTime: "08:00", closeTime: "18:00" })),
    gallery: p.gallery?.map((g) => ({ id: g.id, url: g.url, title: g.title || "" })) ?? [],
    services: p.services?.map((s) => ({ name: s.name, description: s.description })) ?? [],
    team: p.team?.map((m) => ({ name: m.name, position: m.position, bio: m.bio || "", photoUrl: m.photoUrl || "" })) ?? [],
  };
}

const emptyForm = (): PortfolioProfileSaveRequest => ({
  slug: "",
  tagline: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactPhones: [],
  contactWhatsapp: "",
  contactTelegram: "",
  address: "",
  mapLink: "",
  socialMedia: [],
  features: [],
  customStats: [],
  yearsInBusiness: undefined,
  customersServed: undefined,
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

  const form = useForm<PortfolioProfileSaveRequest>({
    mode: "onBlur",
    defaultValues,
  });

  const { fields: businessHoursFields } = useFieldArray({
    control: form.control,
    name: "businessHours",
  });

  const { fields: galleryFields } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  const { fields: servicesFields } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { fields: teamFields } = useFieldArray({
    control: form.control,
    name: "team",
  });

  const features = form.watch("features") ?? [];

  const { fields: customStatsFields } = useFieldArray({
    control: form.control,
    name: "customStats",
  });

  const { fields: socialMediaFields, append: appendSocialMedia, remove: removeSocialMedia } = useFieldArray({
    control: form.control,
    name: "socialMedia",
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

  const onSubmit = async (data: PortfolioProfileSaveRequest) => {
    try {
      setIsSaving(true);

      // Upload base64 images
      let logoUrl = data.logoUrl;
      let coverImageUrl = data.coverImageUrl;

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

      // Upload gallery images
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

      // Upload team photos
      const uploadedTeam = await Promise.all(
        (data.team || []).map(async (member) => {
          let photoUrl = member.photoUrl;
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

      const submitData = {
        ...data,
        logoUrl,
        coverImageUrl,
        gallery: uploadedGallery,
        team: uploadedTeam,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input placeholder="Enter business name" {...form.register("slug")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input placeholder="Your one-stop destination..." {...form.register("tagline")} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Detailed business description..." rows={5} {...form.register("description")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Years in Business</Label>
                <Input type="number" placeholder="8" {...form.register("yearsInBusiness", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Customers Served</Label>
                <Input type="number" placeholder="10000" {...form.register("customersServed", { valueAsNumber: true })} />
              </div>
            </div>
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
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="contact@business.com" {...form.register("contactEmail")} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1-234-567-8900" {...form.register("contactPhone")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input placeholder="+1-234-567-8900" {...form.register("contactWhatsapp")} />
              </div>
              <div className="space-y-2">
                <Label>Telegram</Label>
                <Input placeholder="@username" {...form.register("contactTelegram")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea placeholder="Street 271, Toul Kork, Phnom Penh, Phnom Penh, Cambodia, 12000" rows={3} {...form.register("address")} />
            </div>

            <div className="space-y-2">
              <Label>Map Link</Label>
              <Input placeholder="https://maps.google.com/..." {...form.register("mapLink")} />
            </div>
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
              onClick={() => appendSocialMedia({ id: "", type: "", url: "" })}
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
                      placeholder="Type (facebook, instagram, twitter, youtube, etc.)"
                      {...form.register(`socialMedia.${index}.type`)}
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
              onClick={() => {
                form.setValue("features", [...features, ""], { shouldDirty: true });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Feature name..."
                  value={feature}
                  onChange={(e) => {
                    const updated = [...features];
                    updated[index] = e.target.value;
                    form.setValue("features", updated, { shouldDirty: true });
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    form.setValue("features", features.filter((_, i) => i !== index), { shouldDirty: true });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
              onClick={() => {
                const gallery = form.getValues("gallery");
                form.setValue("gallery", [...gallery, { url: "", title: "" }], { shouldDirty: true });
              }}
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
                    onClick={() => {
                      const gallery = form.getValues("gallery");
                      form.setValue("gallery", gallery.filter((_, i) => i !== index), { shouldDirty: true });
                    }}
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
              onClick={() => {
                const services = form.getValues("services");
                form.setValue("services", [...services, { name: "", description: "" }], { shouldDirty: true });
              }}
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
                    onClick={() => {
                      const services = form.getValues("services");
                      form.setValue("services", services.filter((_, i) => i !== index), { shouldDirty: true });
                    }}
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
              onClick={() => {
                const team = form.getValues("team");
                form.setValue("team", [...team, { name: "", position: "", bio: "", photoUrl: "" }], { shouldDirty: true });
              }}
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
                    onClick={() => {
                      const team = form.getValues("team");
                      form.setValue("team", team.filter((_, i) => i !== index), { shouldDirty: true });
                    }}
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
              onClick={() => {
                const stats = form.getValues("customStats");
                form.setValue("customStats", [...stats, { label: "", value: "" }], { shouldDirty: true });
              }}
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
                  onClick={() => {
                    const stats = form.getValues("customStats");
                    form.setValue("customStats", stats.filter((_, i) => i !== index), { shouldDirty: true });
                  }}
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

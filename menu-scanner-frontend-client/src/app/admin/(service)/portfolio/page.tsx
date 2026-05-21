"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PortfolioAdminProfile,
} from "@/features/portfolio/store/models/portfolio-types";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioProfileSaveRequest {
  const contact = p.contact || {};
  const address = contact.address || {};
  return {
    slug: p.slug || "",
    tagline: p.tagline || "",
    description: p.description || "",
    logoUrl: p.logoUrl || "",
    coverImageUrl: p.coverImageUrl || "",
    industry: p.industry || "",
    contactEmail: contact.email || "",
    contactPhone: contact.phone || "",
    contactPhones: contact.phones ?? [],
    contactWhatsapp: contact.whatsapp || "",
    contactTelegram: contact.telegram || "",
    addressStreet: address.street || "",
    addressCity: address.city || "",
    addressState: address.state || "",
    addressCountry: address.country || "",
    addressPostalCode: address.postalCode || "",
    mapLink: contact.mapLink || "",
    socialFacebook: p.socialMedia?.facebook || "",
    socialInstagram: p.socialMedia?.instagram || "",
    socialTwitter: p.socialMedia?.twitter || "",
    socialLinkedin: p.socialMedia?.linkedin || "",
    socialYoutube: p.socialMedia?.youtube || "",
    socialTiktok: p.socialMedia?.tiktok || "",
    socialWebsite: p.socialMedia?.website || "",
    features: p.features ?? [],
    yearsInBusiness: p.stats?.yearsInBusiness,
    customersServed: p.stats?.customersServed,
    customStats: p.stats?.customStats ?? [],
    isPublished: p.isPublished ?? false,
    businessHours: p.businessHours?.map((h) => ({
      day: h.day,
      isOpen: h.isOpen,
      openTime: h.openTime || "",
      closeTime: h.closeTime || "",
      is24Hours: h.is24Hours ?? false,
    })) ?? DAYS.map((d) => ({ day: d, isOpen: false, openTime: "08:00", closeTime: "18:00", is24Hours: false })),
    gallery: p.gallery?.map((g) => ({ url: g.url, title: g.title || "", description: g.description || "", displayOrder: g.displayOrder ?? 0 })) ?? [],
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
  industry: "",
  contactEmail: "",
  contactPhone: "",
  contactPhones: [],
  contactWhatsapp: "",
  contactTelegram: "",
  addressStreet: "",
  addressCity: "",
  addressState: "",
  addressCountry: "",
  addressPostalCode: "",
  mapLink: "",
  socialFacebook: "",
  socialInstagram: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialYoutube: "",
  socialTiktok: "",
  socialWebsite: "",
  features: [],
  customStats: [],
  yearsInBusiness: undefined,
  customersServed: undefined,
  isPublished: false,
  businessHours: DAYS.map((d) => ({ day: d, isOpen: false, openTime: "08:00", closeTime: "18:00", is24Hours: false })),
  gallery: [],
  services: [],
  team: [],
});

export default function PortfolioPage() {
  const dispatch = useAppDispatch();
  const profile = usePortfolioProfileState();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PortfolioProfileSaveRequest>({
    mode: "onChange",
    defaultValues: emptyForm(),
  });

  useAdminCleanup(() => {
    dispatch(resetState());
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const formData = buildFormFromProfile(profile);
    form.reset(formData);
    setIsLoading(false);
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      await dispatch(fetchAdminPortfolioProfileThunk());
    } catch (err) {
      showToast.error("Failed to load portfolio profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (imageData: string) => {
    form.setValue("logoUrl", imageData, { shouldDirty: true });
    showToast.success("Logo selected");
  };

  const handleCoverImageSelect = (imageData: string) => {
    form.setValue("coverImageUrl", imageData, { shouldDirty: true });
    showToast.success("Cover image selected");
  };

  const handleGalleryImageSelect = (index: number, imageData: string) => {
    const gallery = form.getValues("gallery");
    gallery[index].url = imageData;
    form.setValue("gallery", gallery, { shouldDirty: true });
    showToast.success("Gallery image selected");
  };

  const handleTeamPhotoSelect = (index: number, imageData: string) => {
    const team = form.getValues("team");
    team[index].photoUrl = imageData;
    form.setValue("team", team, { shouldDirty: true });
    showToast.success("Team photo selected");
  };

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
      <CardHeaderSection title="Portfolio Profile" />

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
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input placeholder="e.g., Retail, Fashion" {...form.register("industry")} />
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

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Switch {...form.register("isPublished")} />
              <div>
                <p className="font-semibold text-sm">Publish Profile</p>
                <p className="text-xs text-muted-foreground">Make this profile visible to customers</p>
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
                value={form.watch("logoUrl")}
                onChange={handleLogoSelect}
              />
            </div>

            <div className="space-y-2">
              <ClickableImageUpload
                label="Cover Image"
                value={form.watch("coverImageUrl")}
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
              <Label>Street</Label>
              <Input placeholder="123 Main Street" {...form.register("addressStreet")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="New York" {...form.register("addressCity")} />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input placeholder="NY" {...form.register("addressState")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input placeholder="United States" {...form.register("addressCountry")} />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input placeholder="10001" {...form.register("addressPostalCode")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Map Link</Label>
              <Input placeholder="https://maps.google.com/..." {...form.register("mapLink")} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { field: "socialFacebook", label: "Facebook" },
                { field: "socialInstagram", label: "Instagram" },
                { field: "socialTwitter", label: "Twitter" },
                { field: "socialLinkedin", label: "LinkedIn" },
                { field: "socialYoutube", label: "YouTube" },
                { field: "socialTiktok", label: "TikTok" },
              ].map(({ field, label }) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Input placeholder={`https://${label.toLowerCase()}.com/...`} {...form.register(field as any)} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Website</Label>
                <Input placeholder="https://yourwebsite.com" {...form.register("socialWebsite")} />
              </div>
            </div>
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
                const features = form.getValues("features");
                form.setValue("features", [...features, ""], { shouldDirty: true });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.watch("features").map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Feature name..."
                  value={feature}
                  onChange={(e) => {
                    const features = form.getValues("features");
                    features[index] = e.target.value;
                    form.setValue("features", features, { shouldDirty: true });
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const features = form.getValues("features");
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
            {form.watch("businessHours").map((hour, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">{hour.day}</span>
                  <Switch
                    checked={hour.isOpen}
                    onCheckedChange={(checked) => {
                      const hours = form.getValues("businessHours");
                      hours[index].isOpen = checked;
                      form.setValue("businessHours", hours, { shouldDirty: true });
                    }}
                  />
                </div>
                {hour.isOpen && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Open Time</Label>
                      <CustomTimePicker
                        value={hour.openTime}
                        onChange={(time) => {
                          const hours = form.getValues("businessHours");
                          hours[index].openTime = time;
                          form.setValue("businessHours", hours, { shouldDirty: true });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Close Time</Label>
                      <CustomTimePicker
                        value={hour.closeTime}
                        onChange={(time) => {
                          const hours = form.getValues("businessHours");
                          hours[index].closeTime = time;
                          form.setValue("businessHours", hours, { shouldDirty: true });
                        }}
                      />
                    </div>
                  </div>
                )}
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
                form.setValue("gallery", [...gallery, { url: "", title: "", description: "", displayOrder: gallery.length }], { shouldDirty: true });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Image
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.watch("gallery").map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
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
                  <ClickableImageUpload
                    label="Image"
                    value={item.url}
                    onChange={(img) => handleGalleryImageSelect(index, img)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      placeholder="Image title..."
                      value={item.title}
                      onChange={(e) => {
                        const gallery = form.getValues("gallery");
                        gallery[index].title = e.target.value;
                        form.setValue("gallery", gallery, { shouldDirty: true });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Display Order</Label>
                    <Input
                      type="number"
                      value={item.displayOrder}
                      onChange={(e) => {
                        const gallery = form.getValues("gallery");
                        gallery[index].displayOrder = parseInt(e.target.value) || 0;
                        form.setValue("gallery", gallery, { shouldDirty: true });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Image description..."
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const gallery = form.getValues("gallery");
                      gallery[index].description = e.target.value;
                      form.setValue("gallery", gallery, { shouldDirty: true });
                    }}
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
            {form.watch("services").map((service, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
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
                  <Input
                    placeholder="Service name..."
                    value={service.name}
                    onChange={(e) => {
                      const services = form.getValues("services");
                      services[index].name = e.target.value;
                      form.setValue("services", services, { shouldDirty: true });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Service description..."
                    rows={3}
                    value={service.description}
                    onChange={(e) => {
                      const services = form.getValues("services");
                      services[index].description = e.target.value;
                      form.setValue("services", services, { shouldDirty: true });
                    }}
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
            {form.watch("team").map((member, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">{member.name || "Team Member"}</span>
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
                  <ClickableImageUpload
                    label="Photo"
                    value={member.photoUrl}
                    onChange={(img) => handleTeamPhotoSelect(index, img)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="Full name..."
                      value={member.name}
                      onChange={(e) => {
                        const team = form.getValues("team");
                        team[index].name = e.target.value;
                        form.setValue("team", team, { shouldDirty: true });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <Input
                      placeholder="Job title..."
                      value={member.position}
                      onChange={(e) => {
                        const team = form.getValues("team");
                        team[index].position = e.target.value;
                        form.setValue("team", team, { shouldDirty: true });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Bio</Label>
                  <Textarea
                    placeholder="Team member bio..."
                    rows={3}
                    value={member.bio}
                    onChange={(e) => {
                      const team = form.getValues("team");
                      team[index].bio = e.target.value;
                      form.setValue("team", team, { shouldDirty: true });
                    }}
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
            {form.watch("customStats").map((stat, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input placeholder="Label (e.g., Products)" value={stat.label} onChange={(e) => {
                    const stats = form.getValues("customStats");
                    stats[index].label = e.target.value;
                    form.setValue("customStats", stats, { shouldDirty: true });
                  }} />
                </div>
                <div className="flex-1">
                  <Input placeholder="Value (e.g., 10,000+)" value={stat.value} onChange={(e) => {
                    const stats = form.getValues("customStats");
                    stats[index].value = e.target.value;
                    form.setValue("customStats", stats, { shouldDirty: true });
                  }} />
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
        <div className="flex gap-3 justify-end sticky bottom-6 bg-background p-4 rounded-lg border">
          <Button type="button" variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

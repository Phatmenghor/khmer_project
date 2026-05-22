"use client";

import { useEffect, useMemo } from "react";
import {
  Loader2, Plus, Trash2, Save,
  Mail, Phone, MapPin, Globe,
  Image, Users, Clock, BarChart2, Sparkles, Briefcase,
  ChevronRight,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
] as const;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

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
      })) ?? DAYS.map((d) => ({ day: d, openTime: "08:00", closeTime: "18:00" })),
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
  businessHours: DAYS.map((d) => ({ day: d, openTime: "08:00", closeTime: "18:00" })),
  gallery: [],
  services: [],
  team: [],
});

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-2">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
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

  const { fields: businessHoursFields } = useFieldArray({ control: form.control, name: "businessHours" });
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
    console.log("## [PortfolioPage] profile from Redux state:", profile);
    if (profile) {
      try {
        const formData = buildFormFromProfile(profile);
        console.log("## [PortfolioPage] built formData from profile:", formData);
        form.reset(formData);
        console.log("## [PortfolioPage] form.getValues() after reset:", form.getValues());
      } catch (err) {
        console.error("## [PortfolioPage] error building form from profile:", err);
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Portfolio Profile</h1>
        <p className="text-muted-foreground">
          Manage your public business profile — services, team, gallery, and more
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* ════════════════════════════════════════
            SECTION 1 — BASIC INFORMATION
        ════════════════════════════════════════ */}

        {/* Business Name + Description */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField<PortfolioFormData>
              control={form.control}
              name="businessName"
              label="Business Name"
              placeholder="e.g. Mega Store"
              error={form.formState.errors.businessName}
            />
            <TextareaField<PortfolioFormData>
              control={form.control}
              name="description"
              label="Business Description"
              placeholder="Describe your business in detail — what you offer, your values, and what makes you unique..."
              rows={5}
              error={form.formState.errors.description}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Branding Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Controller
                  name="logoUrl"
                  control={form.control}
                  render={({ field }) => (
                    <ClickableImageUpload
                      label="Business Logo"
                      value={field.value || ""}
                      onChange={(v) => { field.onChange(v); showToast.success("Logo selected"); }}
                      aspectRatio="square"
                      height="h-48"
                      placeholder="Click to upload logo"
                      helperText="Square image recommended (PNG, JPG)"
                      maxSize={5}
                    />
                  )}
                />
              </div>
              <div className="space-y-1">
                <Controller
                  name="coverImageUrl"
                  control={form.control}
                  render={({ field }) => (
                    <ClickableImageUpload
                      label="Cover Image"
                      value={field.value || ""}
                      onChange={(v) => { field.onChange(v); showToast.success("Cover image selected"); }}
                      aspectRatio="video"
                      height="h-48"
                      placeholder="Click to upload cover"
                      helperText="Wide banner image recommended (PNG, JPG)"
                      maxSize={5}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════
            SECTION 3 — CONTACT & COMMUNICATION
        ════════════════════════════════════════ */}
        <div className="border-t" />
        <SectionHeader icon={Phone} title="Contact & Communication" description="How customers can reach you" />

        {/* Contact fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Additional Phones */}
            <div className="border-t pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Additional Phone Numbers</Label>
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
                  <Plus className="w-4 h-4 mr-1" /> Add Phone
                </Button>
              </div>
              {contactPhonesFields.length > 0 ? (
                <div className="space-y-2">
                  {contactPhonesFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
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
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No additional phone numbers added</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField<PortfolioFormData>
              control={form.control}
              name="contact.address"
              label="Physical Address"
              placeholder="Street 271, Toul Kork, Phnom Penh, Cambodia, 12000"
              rows={2}
              error={form.formState.errors.contact?.address}
            />
            <TextField<PortfolioFormData>
              control={form.control}
              name="contact.mapLink"
              label="Google Maps Link"
              placeholder="https://maps.google.com/?q=your+location"
              error={form.formState.errors.contact?.mapLink}
            />
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════
            SECTION 4 — ONLINE PRESENCE
        ════════════════════════════════════════ */}
        <div className="border-t" />
        <SectionHeader icon={Globe} title="Online Presence" description="Social media accounts and links" />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Social Media
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {socialMediaFields.length > 0 ? (
              <div className="space-y-3">
                {socialMediaFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0 text-sm font-bold">
                      {form.watch(`socialMedia.${index}.name`)?.[0]?.toUpperCase() || "?"}
                    </div>
                    <Input
                      placeholder="Platform (Facebook, Instagram...)"
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Globe className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No social media accounts added</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Add Account" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════
            SECTION 5 — HIGHLIGHTS & STATISTICS
        ════════════════════════════════════════ */}
        <div className="border-t" />
        <SectionHeader icon={Sparkles} title="Highlights & Statistics" description="Key features and business stats displayed on your profile" />

        {/* Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Features & Amenities
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent>
            {featuresFields.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {featuresFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1">
                    <Input
                      placeholder="Feature name..."
                      {...form.register(`features.${index}.name`)}
                      className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 w-32 min-w-[80px]"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="w-5 h-5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No features added</p>
                <p className="text-xs text-muted-foreground mt-1">e.g., Free Delivery, 30-Day Returns, 24/7 Support</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Business Statistics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Stat
            </Button>
          </CardHeader>
          <CardContent>
            {customStatsFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customStatsFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <Controller
                        name={`customStats.${index}.value`}
                        control={form.control}
                        render={({ field: f }) => (
                          <Input
                            placeholder="Value (e.g., 10,000+)"
                            className="font-bold text-primary border-0 p-0 h-auto text-lg focus-visible:ring-0"
                            {...f}
                          />
                        )}
                      />
                      <Controller
                        name={`customStats.${index}.label`}
                        control={form.control}
                        render={({ field: f }) => (
                          <Input
                            placeholder="Label (e.g., Happy Customers)"
                            className="text-xs text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                            {...f}
                          />
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeCustomStat(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <BarChart2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No statistics added</p>
                <p className="text-xs text-muted-foreground mt-1">e.g., 10,000+ Happy Customers, 8 Years in Business</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════
            SECTION 6 — BUSINESS OPERATIONS
        ════════════════════════════════════════ */}
        <div className="border-t" />
        <SectionHeader icon={Clock} title="Business Operations" description="Opening hours for each day of the week" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {businessHoursFields.map((field, index) => {
                const dayLabel = DAY_LABELS[field.day] || field.day;
                const openTime = form.watch(`businessHours.${index}.openTime`);
                const closeTime = form.watch(`businessHours.${index}.closeTime`);
                const isClosed = !openTime && !closeTime;
                const isWeekend = field.day === "SATURDAY" || field.day === "SUNDAY";

                return (
                  <div
                    key={field.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${isClosed ? "bg-muted/30 opacity-70" : "hover:bg-muted/20"}`}
                  >
                    {/* Day label */}
                    <div className="w-24 shrink-0">
                      <p className={`text-sm font-semibold ${isWeekend ? "text-orange-600" : "text-foreground"}`}>
                        {dayLabel}
                      </p>
                      {isClosed && (
                        <Badge variant="secondary" className="text-xs mt-0.5 px-1.5 py-0">Closed</Badge>
                      )}
                    </div>

                    {/* Time pickers */}
                    <div className="flex flex-1 items-center gap-2">
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
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
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

                    {/* Clear button */}
                    <Button
                      type="button"
                      size="sm"
                      variant={isClosed ? "outline" : "ghost"}
                      className={`shrink-0 text-xs px-2 ${isClosed ? "text-primary border-primary/30" : "text-muted-foreground"}`}
                      onClick={() => {
                        const hours = form.getValues("businessHours") || [];
                        if (isClosed) {
                          hours[index].openTime = "08:00";
                          hours[index].closeTime = "18:00";
                        } else {
                          hours[index].openTime = "";
                          hours[index].closeTime = "";
                        }
                        form.setValue("businessHours", [...hours], { shouldDirty: true });
                      }}
                    >
                      {isClosed ? "Set Hours" : "Close"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════
            SECTION 7 — PORTFOLIO & SHOWCASE
        ════════════════════════════════════════ */}
        <div className="border-t" />
        <SectionHeader icon={Image} title="Portfolio & Showcase" description="Gallery, services, and team members" />

        {/* Gallery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Photo Gallery
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Image
            </Button>
          </CardHeader>
          <CardContent>
            {galleryFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleryFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">Image {index + 1}</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                        onClick={() => removeGallery(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Controller
                      name={`gallery.${index}.url`}
                      control={form.control}
                      render={({ field: f }) => (
                        <ClickableImageUpload
                          label=""
                          value={f.value}
                          onChange={f.onChange}
                          height="h-36"
                          placeholder="Click to upload"
                          maxSize={5}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Caption (optional)</Label>
                      <Controller
                        name={`gallery.${index}.title`}
                        control={form.control}
                        render={({ field: f }) => (
                          <Input placeholder="e.g., Store Entrance" {...f} />
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Image className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No gallery images</p>
                <p className="text-xs text-muted-foreground mt-1">Showcase your store, products, or events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Services
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {servicesFields.length > 0 ? (
              <div className="space-y-3">
                {servicesFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {index + 1}
                        </div>
                        <Controller
                          name={`services.${index}.name`}
                          control={form.control}
                          render={({ field: f }) => (
                            <Input
                              placeholder="Service name..."
                              className="font-semibold border-0 p-0 h-auto text-sm focus-visible:ring-0"
                              {...f}
                            />
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Controller
                      name={`services.${index}.description`}
                      control={form.control}
                      render={({ field: f }) => (
                        <Textarea
                          placeholder="Describe what this service includes..."
                          rows={2}
                          className="resize-none text-sm"
                          {...f}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No services listed</p>
                <p className="text-xs text-muted-foreground mt-1">e.g., In-Store Shopping, Online Ordering, Gift Wrapping</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Plus className="w-4 h-4 mr-1" /> Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {teamFields.length > 0 ? (
              <div className="space-y-4">
                {teamFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex gap-4">
                      {/* Photo */}
                      <div className="shrink-0 w-28">
                        <Controller
                          name={`team.${index}.photoUrl`}
                          control={form.control}
                          render={({ field: f }) => (
                            <ClickableImageUpload
                              label="Photo"
                              value={f.value || ""}
                              onChange={f.onChange}
                              aspectRatio="square"
                              height="h-28"
                              placeholder="Upload"
                              maxSize={5}
                            />
                          )}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Full Name</Label>
                              <Controller
                                name={`team.${index}.name`}
                                control={form.control}
                                render={({ field: f }) => (
                                  <Input placeholder="John Doe" className="text-sm font-semibold" {...f} />
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Position / Title</Label>
                              <Controller
                                name={`team.${index}.position`}
                                control={form.control}
                                render={({ field: f }) => (
                                  <Input placeholder="Store Manager" className="text-sm" {...f} />
                                )}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0 shrink-0"
                            onClick={() => removeTeam(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                                rows={2}
                                className="resize-none text-sm"
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
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No team members added</p>
                <p className="text-xs text-muted-foreground mt-1">Introduce your team to build trust with customers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Save / Cancel ── */}
        <div className="flex gap-3 justify-end pt-4 border-t">
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

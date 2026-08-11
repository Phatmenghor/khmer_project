"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Building2,
  Phone,
  Share2,
  Sparkles,
  BarChart3,
  Clock,
  GalleryHorizontal,
  Briefcase,
  Users,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/shared/common/show-toast";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
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
import { uploadMultiSize, SpacesMultiSizeResult } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import {
  PortfolioProfileSaveRequest,
  PortfolioAdminProfile,
} from "@/features/portfolio/store/models/portfolio-types";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import {
  portfolioFormSchema,
  type PortfolioFormData,
} from "../(service)/portfolio/schema/portfolio-form.schema";

function toImageUrls(r: SpacesMultiSizeResult): ImageUrls {
  return { sm: r.sm.url, md: r.md.url, o: r.o.url };
}

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioFormData {
  const contact = p.contact || {};
  return {
    description: p.description || "",
    coverImage: p.coverImage || {},
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
    gallery: (p.gallery || []).map((g) => ({ id: g.id, image: g.image || {}, title: g.title || "" })),
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
      photo: m.photo || {},
    })),
  };
}

const emptyForm = (): PortfolioFormData => ({
  description: "",
  coverImage: {},
  contact: { email: "", phone: "", phones: [], whatsapp: "", telegram: "", address: "", mapLink: "" },
  socialMedia: [],
  features: [],
  customStats: [],
  businessHours: [],
  gallery: [],
  services: [],
  team: [],
});

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

export default function BusinessProfileEditorPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSaving } = usePortfolioProfileState();
  const [activeTab, setActiveTab] = useState<string>("basic");

  const defaultValues = useMemo(() => emptyForm(), []);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string>("");

  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<(File | null)[]>([]);
  const [galleryBlobUrls, setGalleryBlobUrls] = useState<string[]>([]);

  const [pendingTeamFiles, setPendingTeamFiles] = useState<(File | null)[]>([]);
  const [teamBlobUrls, setTeamBlobUrls] = useState<string[]>([]);

  const cleanupBlobUrls = () => {
    if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    galleryBlobUrls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    teamBlobUrls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
  };
  useAdminCleanup(cleanupBlobUrls);

  const {
    fields: contactPhonesFields,
    append: appendContactPhone,
    remove: removeContactPhone,
  } = useFieldArray({ control: form.control, name: "contact.phones" });

  const {
    fields: socialMediaFields,
    append: appendSocialMedia,
    remove: removeSocialMedia,
  } = useFieldArray({ control: form.control, name: "socialMedia" });

  const {
    fields: featuresFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control: form.control, name: "features" });

  const {
    fields: customStatsFields,
    append: appendCustomStat,
    remove: removeCustomStat,
  } = useFieldArray({ control: form.control, name: "customStats" });

  const {
    fields: businessHoursFields,
    append: appendBusinessHour,
    remove: removeBusinessHour,
  } = useFieldArray({ control: form.control, name: "businessHours" });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({ control: form.control, name: "gallery" });

  const {
    fields: servicesFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control: form.control, name: "services" });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({ control: form.control, name: "team" });

  useEffect(() => {
    dispatch(fetchAdminPortfolioProfileThunk());
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      try {
        const formData = buildFormFromProfile(profile);
        form.reset(formData);
        setPendingCoverFile(null);
        setCoverBlobUrl("");
        setPendingGalleryFiles([]);
        setGalleryBlobUrls([]);
        setPendingTeamFiles([]);
        setTeamBlobUrls([]);
      } catch (err) {
        console.error("Error building portfolio form from profile:", err);
        showToast.error("Error loading portfolio data");
      }
    }
  }, [profile, form]);

  const handleCoverFileSelected = (file: File | null) => {
    if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setPendingCoverFile(file);
      setCoverBlobUrl(blobUrl);
      form.setValue("coverImage", { sm: blobUrl, md: blobUrl, o: blobUrl }, { shouldDirty: true });
    } else {
      setPendingCoverFile(null);
      setCoverBlobUrl("");
      form.setValue("coverImage", {}, { shouldDirty: true });
    }
  };

  const handleGalleryFileSelected = (index: number, file: File | null) => {
    setPendingGalleryFiles((prev) => {
      const next = [...prev];
      if (next[index]?.name !== file?.name) {
        if (galleryBlobUrls[index]) URL.revokeObjectURL(galleryBlobUrls[index]);
      }
      next[index] = file;
      return next;
    });
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setGalleryBlobUrls((prev) => { const next = [...prev]; next[index] = blobUrl; return next; });
      form.setValue(`gallery.${index}.image`, { sm: blobUrl, md: blobUrl, o: blobUrl }, { shouldDirty: true });
    } else {
      setGalleryBlobUrls((prev) => { const next = [...prev]; next[index] = ""; return next; });
      form.setValue(`gallery.${index}.image`, {}, { shouldDirty: true });
    }
  };

  const handleRemoveGallery = (index: number) => {
    if (pendingGalleryFiles[index]) {
      if (galleryBlobUrls[index]) URL.revokeObjectURL(galleryBlobUrls[index]);
      setPendingGalleryFiles((prev) => prev.filter((_, i) => i !== index));
      setGalleryBlobUrls((prev) => prev.filter((_, i) => i !== index));
    }
    removeGallery(index);
  };

  const handleTeamFileSelected = (index: number, file: File | null) => {
    setPendingTeamFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setTeamBlobUrls((prev) => { const next = [...prev]; next[index] = blobUrl; return next; });
      form.setValue(`team.${index}.photo`, { sm: blobUrl, md: blobUrl, o: blobUrl }, { shouldDirty: true });
    } else {
      setTeamBlobUrls((prev) => { const next = [...prev]; next[index] = ""; return next; });
      form.setValue(`team.${index}.photo`, {}, { shouldDirty: true });
    }
  };

  const handleRemoveTeam = (index: number) => {
    if (pendingTeamFiles[index] && teamBlobUrls[index]) {
      URL.revokeObjectURL(teamBlobUrls[index]);
      setPendingTeamFiles((prev) => prev.filter((_, i) => i !== index));
      setTeamBlobUrls((prev) => prev.filter((_, i) => i !== index));
    }
    removeTeam(index);
  };

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      const businessId = AppDefault.BUSINESS_ID;

      // Upload cover image if pending
      let coverImage: ImageUrls | undefined = data.coverImage as ImageUrls | undefined;
      if (pendingCoverFile) {
        try {
          coverImage = toImageUrls(await uploadMultiSize(pendingCoverFile, businessId));
        } catch {
          showToast.error("Failed to upload cover image");
          return;
        }
      }

      // Upload gallery images
      const uploadedGallery = await Promise.all(
        (data.gallery || []).map(async (item, index) => {
          const pendingFile = pendingGalleryFiles[index];
          if (pendingFile) {
            try {
              const uploaded = await uploadMultiSize(pendingFile, businessId);
              return { ...item, image: toImageUrls(uploaded) };
            } catch {
              showToast.error(`Failed to upload gallery image ${index + 1}`);
              throw new Error("Gallery upload failed");
            }
          }
          return item;
        })
      );

      // Upload team photos
      const uploadedTeam = await Promise.all(
        (data.team || []).map(async (member, index) => {
          const pendingFile = pendingTeamFiles[index];
          if (pendingFile) {
            try {
              const uploaded = await uploadMultiSize(pendingFile, businessId);
              return { ...member, photo: toImageUrls(uploaded) };
            } catch {
              showToast.error(`Failed to upload team photo for ${member.name}`);
              throw new Error("Team photo upload failed");
            }
          }
          return member;
        })
      );

      const submitData: PortfolioProfileSaveRequest = {
        description: data.description || "",
        coverImage: coverImage && (coverImage.sm || coverImage.md || coverImage.o) ? coverImage : undefined,
        contact: {
          email: data.contact?.email || "",
          phone: data.contact?.phone || "",
          phones: data.contact?.phones || [],
          telegram: data.contact?.telegram || "",
          address: data.contact?.address || "",
          mapLink: data.contact?.mapLink || "",
        },
        socialMedia: data.socialMedia || [],
        businessHours: data.businessHours || [],
        gallery: uploadedGallery.map((g) => ({
          id: g.id,
          image: g.image as ImageUrls | undefined,
          title: g.title,
        })),
        services: data.services || [],
        team: uploadedTeam.map((m) => ({
          id: m.id,
          name: m.name,
          position: m.position,
          bio: m.bio,
          photo: m.photo as ImageUrls | undefined,
        })),
        features: data.features || [],
        customStats: data.customStats || [],
      };

      const result = await dispatch(saveAdminPortfolioProfileThunk(submitData));
      if (saveAdminPortfolioProfileThunk.fulfilled.match(result)) {
        showToast.success("Business profile saved successfully");
        setPendingCoverFile(null);
        setPendingGalleryFiles([]);
        setPendingTeamFiles([]);
      } else {
        showToast.error("Failed to save business profile");
      }
    } catch {
      showToast.error("Failed to save business profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading profile details...</p>
      </div>
    );
  }

  const watchCoverImage = form.watch("coverImage");

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact & Hours" },
    { id: "media", label: "Images & Gallery" },
    { id: "services", label: "Services & Offerings" },
    { id: "team", label: "Team & Statistics" },
    { id: "social", label: "Social Media" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 px-1 pb-10 pt-2">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-foreground">Business Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize your business portfolio and showcase your brand
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portfolio" target="_blank">
            <CustomButton variant="outline" size="sm" className="gap-1.5 font-bold">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </CustomButton>
          </Link>
          <CustomButton
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving || !form.formState.isDirty}
            onClick={form.handleSubmit(onSubmit)}
            className="gap-1.5 font-bold"
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

      {/* ── Navigation Tabs ── */}
      <div className="border-b border-border/80">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <CustomButton
              variant="unstyled"
              size="unstyled"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </CustomButton>
          ))}
        </nav>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Tab 1: Basic Info (Overview & Store Branding: Business Description on Left, Header Banner Cover Image on Right) ── */}
        {activeTab === "basic" && (
          <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
            <SectionHeader
              icon={Building2}
              title="Overview & Store Branding"
              subtitle="Business description and storefront header cover banner image"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <TextareaField<PortfolioFormData>
                control={form.control}
                name="description"
                label="Business Description"
                placeholder="Enter business description..."
                rows={5}
                textareaClassName="h-[145px] resize-none"
                required
                error={form.formState.errors.description}
              />

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Header Banner Cover Image
                </Label>
                <SpacesImageUpload
                  businessId={AppDefault.BUSINESS_ID}
                  label=""
                  value={watchCoverImage?.o || watchCoverImage?.md || watchCoverImage?.sm || ""}
                  multiSize
                  deferred
                  onFileSelected={handleCoverFileSelected}
                  aspectRatio="banner"
                  height="h-[145px]"
                  placeholder="Click to upload store cover banner"
                  helperText="HD high resolution banner recommended — PNG, JPG"
                  maxSizeMb={5}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Contact Details & Business Hours ── */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Contact Details */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
              <SectionHeader
                icon={Phone}
                title="Contact Details"
                subtitle="Public contact numbers, messenger channels, address, and Google Maps"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name="contact.email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address..."
                  error={form.formState.errors.contact?.email}
                />
                <TextField<PortfolioFormData>
                  control={form.control}
                  name="contact.phone"
                  label="Primary Phone"
                  placeholder="Enter primary phone number..."
                  error={form.formState.errors.contact?.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name="contact.telegram"
                  label="Telegram Link"
                  placeholder="Enter Telegram link..."
                  error={form.formState.errors.contact?.telegram}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField<PortfolioFormData>
                  control={form.control}
                  name="contact.address"
                  label="Physical Address"
                  placeholder="Enter physical address..."
                  error={form.formState.errors.contact?.address}
                />
                <TextField<PortfolioFormData>
                  control={form.control}
                  name="contact.mapLink"
                  label="Google Maps Link"
                  placeholder="Enter Google Maps link..."
                  error={form.formState.errors.contact?.mapLink}
                />
              </div>

              {/* Additional Phones */}
              <div className="border-t border-border/80 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Additional Phone Numbers</p>
                  <CustomButton
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 font-bold text-xs h-8"
                    onClick={() => appendContactPhone({ id: "", number: "" })}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Phone
                  </CustomButton>
                </div>
                {contactPhonesFields.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactPhonesFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <TextField<PortfolioFormData>
                            control={form.control}
                            name={`contact.phones.${index}.number`}
                            placeholder="Enter phone number..."
                            required
                            error={form.formState.errors.contact?.phones?.[index]?.number}
                          />
                        </div>
                        <CustomButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="mt-6 text-red-500 hover:bg-red-500/10 h-8 px-2"
                          onClick={() => removeContactPhone(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </CustomButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySectionState message="No additional phone numbers added" />
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
              <SectionHeader
                icon={Clock}
                title="Operating Schedule & Hours"
                subtitle="Configure weekly opening and closing schedules for your customers"
                action={
                  <CustomButton
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 font-bold text-xs h-8"
                    onClick={() => appendBusinessHour({ id: "", day: "", openTime: "08:00", closeTime: "18:00" })}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Hours
                  </CustomButton>
                }
              />
              {businessHoursFields.length > 0 ? (
                <div className="space-y-3">
                  {businessHoursFields.map((field, index) => (
                    <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
                      <CustomButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                        onClick={() => removeBusinessHour(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </CustomButton>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                        <TextField<PortfolioFormData>
                          control={form.control}
                          name={`businessHours.${index}.day`}
                          label="Day of Week"
                          placeholder="Enter day of week..."
                          required
                        />
                        <div className="flex flex-col gap-1 w-full">
                          <Label className="text-xs font-semibold text-foreground">Open Time</Label>
                          <Controller
                            name={`businessHours.${index}.openTime`}
                            control={form.control}
                            render={({ field: timeField }) => (
                              <CustomTimePicker
                                value={timeField.value || ""}
                                onChange={timeField.onChange}
                                placeholder="Enter open time"
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <Label className="text-xs font-semibold text-foreground">Close Time</Label>
                          <Controller
                            name={`businessHours.${index}.closeTime`}
                            control={form.control}
                            render={({ field: timeField }) => (
                              <CustomTimePicker
                                value={timeField.value || ""}
                                onChange={timeField.onChange}
                                placeholder="Enter close time"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySectionState message="No business hours added" />
              )}
            </div>
          </div>
        )}

        {/* ── Tab 3: Images & Gallery ── */}
        {activeTab === "media" && (
          <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
            <SectionHeader
              icon={GalleryHorizontal}
              title="Photo Gallery Showcase"
              subtitle="Showcase store interior, high quality dishes, atmosphere, or event photos"
              action={
                <CustomButton
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 font-bold text-xs h-8"
                  onClick={() => {
                    appendGallery({ id: "", image: {}, title: "" });
                    setPendingGalleryFiles((prev) => [...prev, null]);
                    setGalleryBlobUrls((prev) => [...prev, ""]);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image
                </CustomButton>
              }
            />
            {galleryFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryFields.map((field, index) => {
                  const watchImage = form.watch(`gallery.${index}.image`);
                  return (
                    <div key={field.id} className="border border-border/80 rounded-xl p-4 space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors relative">
                      <CustomButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 text-red-500 hover:bg-red-500/10 h-7 px-2"
                        onClick={() => handleRemoveGallery(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </CustomButton>
                      <SpacesImageUpload
                        businessId={AppDefault.BUSINESS_ID}
                        label={`Gallery Photo #${index + 1}`}
                        value={watchImage?.o || watchImage?.md || watchImage?.sm || ""}
                        multiSize
                        deferred
                        onFileSelected={(file) => handleGalleryFileSelected(index, file)}
                        aspectRatio="square"
                        placeholder="Click to upload gallery photo"
                        helperText="Square (1:1) image recommended — PNG, JPG"
                        maxSizeMb={5}
                      />
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`gallery.${index}.title`}
                        label="Photo Caption (optional)"
                        placeholder="Enter photo caption..."
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptySectionState
                message="No gallery images added"
                hint="Upload photos of your ambiance, dishes, or staff"
              />
            )}
          </div>
        )}

        {/* ── Tab 4: Services & Offerings ── */}
        {activeTab === "services" && (
          <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
            <SectionHeader
              icon={Briefcase}
              title="Services & Special Offerings"
              subtitle="Highlight main business services (e.g. In-Store Dining, VIP Catering, Express Delivery)"
              action={
                <CustomButton
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 font-bold text-xs h-8"
                  onClick={() => appendService({ id: "", name: "", description: "" })}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Service
                </CustomButton>
              }
            />
            {servicesFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesFields.map((field, index) => (
                  <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </CustomButton>
                    <div className="space-y-3 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`services.${index}.name`}
                        label="Service Name"
                        placeholder="Enter service name..."
                        required
                        error={form.formState.errors.services?.[index]?.name}
                      />
                      <TextareaField<PortfolioFormData>
                        control={form.control}
                        name={`services.${index}.description`}
                        label="Description"
                        placeholder="Enter service description..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionState
                message="No services listed"
                hint="e.g., Private Catering, Outdoor Seating, Customized Orders"
              />
            )}
          </div>
        )}

        {/* ── Tab 5: Team & Statistics ── */}
        {activeTab === "team" && (
          <div className="space-y-5">
            {/* Team Members */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
              <SectionHeader
                icon={Users}
                title="Team & Management"
                subtitle="Introduce key team members, head chefs, and managers to build customer trust"
                action={
                  <CustomButton
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 font-bold text-xs h-8"
                    onClick={() => {
                      appendTeam({ id: "", name: "", position: "", bio: "", photo: {} });
                      setPendingTeamFiles((prev) => [...prev, null]);
                      setTeamBlobUrls((prev) => [...prev, ""]);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </CustomButton>
                }
              />
              {teamFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamFields.map((field, index) => {
                    const watchPhoto = form.watch(`team.${index}.photo`);
                    return (
                      <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
                        <CustomButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                          onClick={() => handleRemoveTeam(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </CustomButton>
                        <div className="space-y-4 pr-10">
                          <SpacesImageUpload
                            businessId={AppDefault.BUSINESS_ID}
                            label="Member Avatar Photo"
                            value={watchPhoto?.o || watchPhoto?.md || watchPhoto?.sm || ""}
                            multiSize
                            deferred
                            onFileSelected={(file) => handleTeamFileSelected(index, file)}
                            aspectRatio="square"
                            placeholder="Click to upload profile photo"
                            helperText="Square (1:1) avatar recommended"
                            maxSizeMb={5}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <TextField<PortfolioFormData>
                              control={form.control}
                              name={`team.${index}.name`}
                              label="Full Name"
                              placeholder="Enter full name..."
                              required
                              error={form.formState.errors.team?.[index]?.name}
                            />
                            <TextField<PortfolioFormData>
                              control={form.control}
                              name={`team.${index}.position`}
                              label="Position / Title"
                              placeholder="Enter position title..."
                              required
                              error={form.formState.errors.team?.[index]?.position}
                            />
                          </div>

                          <TextareaField<PortfolioFormData>
                            control={form.control}
                            name={`team.${index}.bio`}
                            label="Short Biography"
                            placeholder="Enter short bio..."
                            rows={3}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptySectionState
                  message="No team members added"
                  hint="Introduce your team to build trust with customers"
                />
              )}
            </div>

            {/* Features & Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Features */}
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
                <SectionHeader
                  icon={Sparkles}
                  title="Features & Highlights"
                  subtitle="Special amenities (e.g. Free Wi-Fi, Air Conditioned, Valet Parking)"
                  action={
                    <CustomButton
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 font-bold text-xs h-8"
                      onClick={() => appendFeature({ id: "", name: "" })}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Feature
                    </CustomButton>
                  }
                />
                {featuresFields.length > 0 ? (
                  <div className="space-y-2.5">
                    {featuresFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <TextField<PortfolioFormData>
                            control={form.control}
                            name={`features.${index}.name`}
                            placeholder="Enter feature name..."
                            required
                            error={form.formState.errors.features?.[index]?.name}
                          />
                        </div>
                        <CustomButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10 h-9 px-2 shrink-0"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </CustomButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySectionState message="No features added" />
                )}
              </div>

              {/* Key Statistics */}
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
                <SectionHeader
                  icon={BarChart3}
                  title="Key Business Statistics"
                  subtitle="Highlight key milestones (e.g. 10,000+ Happy Guests, 15+ Years)"
                  action={
                    <CustomButton
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 font-bold text-xs h-8"
                      onClick={() => appendCustomStat({ id: "", label: "", value: "" })}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stat
                    </CustomButton>
                  }
                />
                {customStatsFields.length > 0 ? (
                  <div className="space-y-3">
                    {customStatsFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <TextField<PortfolioFormData>
                            control={form.control}
                            name={`customStats.${index}.value`}
                            placeholder="Enter stat value..."
                            required
                            error={form.formState.errors.customStats?.[index]?.value}
                          />
                          <TextField<PortfolioFormData>
                            control={form.control}
                            name={`customStats.${index}.label`}
                            placeholder="Enter stat label..."
                            required
                            error={form.formState.errors.customStats?.[index]?.label}
                          />
                        </div>
                        <CustomButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10 h-9 px-2 shrink-0"
                          onClick={() => removeCustomStat(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </CustomButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySectionState message="No statistics added" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 6: Social Media ── */}
        {activeTab === "social" && (
          <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
            <SectionHeader
              icon={Share2}
              title="Social Media Channels"
              subtitle="Connect Facebook, Instagram, TikTok, LinkedIn, and YouTube links"
              action={
                <CustomButton
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 font-bold text-xs h-8"
                  onClick={() => appendSocialMedia({ id: "", name: "", url: "" })}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Account
                </CustomButton>
              }
            />
            {socialMediaFields.length > 0 ? (
              <div className="space-y-3">
                {socialMediaFields.map((field, index) => (
                  <div key={field.id} className="border border-border/80 rounded-xl p-4 relative bg-muted/20 hover:bg-muted/40 transition-colors">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 h-7 px-2"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </CustomButton>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`socialMedia.${index}.name`}
                        label="Platform"
                        placeholder="Enter platform name..."
                        required
                        error={form.formState.errors.socialMedia?.[index]?.name}
                      />
                      <TextField<PortfolioFormData>
                        control={form.control}
                        name={`socialMedia.${index}.url`}
                        label="URL"
                        placeholder="Enter social profile link..."
                        required
                        error={form.formState.errors.socialMedia?.[index]?.url}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionState
                message="No social media accounts added"
                hint='Click "Add Account" to attach social media links'
              />
            )}
          </div>
        )}

        {/* ── Floating / Bottom Save Action Bar ── */}
        <div className="sticky bottom-4 z-40 rounded-[16px] border border-border/80 bg-card/90 backdrop-blur-md p-3 px-5 flex items-center justify-between shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">
            {form.formState.isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">● Unsaved changes detected</span>
            ) : (
              "All profile changes saved"
            )}
          </p>
          <div className="flex items-center gap-2">
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchAdminPortfolioProfileThunk())}
              disabled={isSaving}
            >
              Reset
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || !form.formState.isDirty}
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

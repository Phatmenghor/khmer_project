"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Save, RefreshCw, Eye, Sparkles } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
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
} from "./schema/portfolio-form.schema";

// Custom Modular Section Components
import { PortfolioOverviewSection } from "@/features/portfolio/components/portfolio-overview-section";
import { PortfolioContactSection } from "@/features/portfolio/components/portfolio-contact-section";
import { PortfolioSocialMediaSection } from "@/features/portfolio/components/portfolio-social-media-section";
import { PortfolioHoursSection } from "@/features/portfolio/components/portfolio-hours-section";
import { PortfolioFeaturesSection } from "@/features/portfolio/components/portfolio-features-section";
import { PortfolioStatsSection } from "@/features/portfolio/components/portfolio-stats-section";
import { PortfolioServicesSection } from "@/features/portfolio/components/portfolio-services-section";
import { PortfolioTeamSection } from "@/features/portfolio/components/portfolio-team-section";
import { PortfolioGallerySection } from "@/features/portfolio/components/portfolio-gallery-section";

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

export default function PortfolioAdminPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSaving } = usePortfolioProfileState();
  useAdminCleanup(resetState);

  const businessId = AppDefault.BUSINESS_ID;

  // Local state for pending uploads (deferred until submit)
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string>("");

  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<(File | null)[]>([]);
  const [galleryBlobUrls, setGalleryBlobUrls] = useState<string[]>([]);

  const [pendingTeamFiles, setPendingTeamFiles] = useState<(File | null)[]>([]);
  const [teamBlobUrls, setTeamBlobUrls] = useState<string[]>([]);

  const defaultValues = useMemo(() => {
    return profile ? buildFormFromProfile(profile) : emptyForm();
  }, [profile]);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(fetchAdminPortfolioProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      form.reset(buildFormFromProfile(profile));
    }
  }, [profile, form]);

  // Field Arrays
  const contactPhonesFieldArray = useFieldArray({ control: form.control, name: "contact.phones" });
  const socialMediaFieldArray = useFieldArray({ control: form.control, name: "socialMedia" });
  const businessHoursFieldArray = useFieldArray({ control: form.control, name: "businessHours" });
  const servicesFieldArray = useFieldArray({ control: form.control, name: "services" });
  const teamFieldArray = useFieldArray({ control: form.control, name: "team" });
  const featuresFieldArray = useFieldArray({ control: form.control, name: "features" });
  const customStatsFieldArray = useFieldArray({ control: form.control, name: "customStats" });
  const galleryFieldArray = useFieldArray({ control: form.control, name: "gallery" });

  // Upload Handlers
  const handleCoverFileSelected = (file: File | null) => {
    if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    if (file) {
      const url = URL.createObjectURL(file);
      setPendingCoverFile(file);
      setCoverBlobUrl(url);
      form.setValue("coverImage", { o: url, md: url, sm: url }, { shouldDirty: true });
    } else {
      setPendingCoverFile(null);
      setCoverBlobUrl("");
      form.setValue("coverImage", {}, { shouldDirty: true });
    }
  };

  const handleGalleryFileSelected = (index: number, file: File | null) => {
    setPendingGalleryFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (file) {
      const url = URL.createObjectURL(file);
      setGalleryBlobUrls((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
      form.setValue(`gallery.${index}.image`, { o: url, md: url, sm: url }, { shouldDirty: true });
    } else {
      setGalleryBlobUrls((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      form.setValue(`gallery.${index}.image`, {}, { shouldDirty: true });
    }
  };

  const handleTeamFileSelected = (index: number, file: File | null) => {
    setPendingTeamFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (file) {
      const url = URL.createObjectURL(file);
      setTeamBlobUrls((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
      form.setValue(`team.${index}.photo`, { o: url, md: url, sm: url }, { shouldDirty: true });
    } else {
      setTeamBlobUrls((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      form.setValue(`team.${index}.photo`, {}, { shouldDirty: true });
    }
  };

  const handleAddTeam = () => {
    teamFieldArray.append({ id: "", name: "", position: "", bio: "", photo: {} });
    setPendingTeamFiles((prev) => [...prev, null]);
    setTeamBlobUrls((prev) => [...prev, ""]);
  };

  const handleRemoveTeam = (index: number) => {
    if (teamBlobUrls[index]) URL.revokeObjectURL(teamBlobUrls[index]);
    setPendingTeamFiles((prev) => prev.filter((_, i) => i !== index));
    setTeamBlobUrls((prev) => prev.filter((_, i) => i !== index));
    teamFieldArray.remove(index);
    form.setValue("team", form.getValues("team"), { shouldDirty: true });
  };

  const handleAddGallery = () => {
    galleryFieldArray.append({ id: "", image: {}, title: "" });
    setPendingGalleryFiles((prev) => [...prev, null]);
    setGalleryBlobUrls((prev) => [...prev, ""]);
  };

  const handleRemoveGallery = (index: number) => {
    if (galleryBlobUrls[index]) URL.revokeObjectURL(galleryBlobUrls[index]);
    setPendingGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryBlobUrls((prev) => prev.filter((_, i) => i !== index));
    galleryFieldArray.remove(index);
    form.setValue("gallery", form.getValues("gallery"), { shouldDirty: true });
  };

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      // Upload Cover Image if pending
      let coverImage = profile?.coverImage;
      if (pendingCoverFile) {
        try {
          const uploaded = await uploadMultiSize(pendingCoverFile, businessId);
          coverImage = toImageUrls(uploaded);
        } catch {
          showToast.error("Failed to upload header cover image");
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
              showToast.error(`Failed to upload gallery image #${index + 1}`);
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
        showToast.success("Portfolio profile saved successfully");
        setPendingCoverFile(null);
        setPendingGalleryFiles([]);
        setPendingTeamFiles([]);
      } else {
        showToast.error("Failed to save portfolio profile");
      }
    } catch {
      showToast.error("Failed to save portfolio profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading portfolio details...</p>
      </div>
    );
  }

  const watchCoverImage = form.watch("coverImage");

  return (
    <div className="flex flex-1 flex-col gap-5 px-1 pb-10 pt-2">
      {/* ── Top Header Bar with Preview Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-foreground">Business Portfolio Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize public storefront showcase — narrative, contact, features, services, team, and gallery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/business-profile" target="_blank">
            <CustomButton variant="outline" size="sm" className="gap-1.5 font-bold">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </CustomButton>
          </Link>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Section 1: Overview & Cover Display ── */}
        <PortfolioOverviewSection
          form={form}
          watchCoverImage={watchCoverImage}
          onCoverFileSelected={handleCoverFileSelected}
        />

        {/* ── Section 2: Contact Details & Location ── */}
        <PortfolioContactSection
          form={form}
          contactPhonesFieldArray={contactPhonesFieldArray}
        />

        {/* ── Section 3: Social Media Channels ── */}
        <PortfolioSocialMediaSection
          form={form}
          socialMediaFieldArray={socialMediaFieldArray}
        />

        {/* ── Section 4: Operating Schedule & Hours ── */}
        <PortfolioHoursSection
          form={form}
          businessHoursFieldArray={businessHoursFieldArray}
        />

        {/* ── Section 5 & 6: Features & Key Statistics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PortfolioFeaturesSection
            form={form}
            featuresFieldArray={featuresFieldArray}
          />

          <PortfolioStatsSection
            form={form}
            customStatsFieldArray={customStatsFieldArray}
          />
        </div>

        {/* ── Section 7: Store Services Offered ── */}
        <PortfolioServicesSection
          form={form}
          servicesFieldArray={servicesFieldArray}
        />

        {/* ── Section 8: Team & Staff Showcase ── */}
        <PortfolioTeamSection
          form={form}
          teamFieldArray={teamFieldArray}
          onAddTeam={handleAddTeam}
          onRemoveTeam={handleRemoveTeam}
          onTeamFileSelected={handleTeamFileSelected}
        />

        {/* ── Section 9: Photo Gallery Showcase ── */}
        <PortfolioGallerySection
          form={form}
          galleryFieldArray={galleryFieldArray}
          onAddGallery={handleAddGallery}
          onRemoveGallery={handleRemoveGallery}
          onGalleryFileSelected={handleGalleryFileSelected}
        />

        {/* ── Floating / Bottom Save Action Bar ── */}
        <div className="sticky bottom-4 z-40 rounded-[16px] border border-border/80 bg-card/90 backdrop-blur-md p-3 px-5 flex items-center justify-between shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">
            {form.formState.isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">● Unsaved changes detected</span>
            ) : (
              "All portfolio changes saved"
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

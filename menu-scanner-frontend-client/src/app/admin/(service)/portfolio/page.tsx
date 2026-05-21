"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Globe, Building2 } from "lucide-react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showToast } from "@/components/shared/common/show-toast";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { usePortfolioProfileState } from "@/features/portfolio/store/state/portfolio-profile-state";
import { fetchAdminPortfolioProfileThunk, saveAdminPortfolioProfileThunk } from "@/features/portfolio/store/thunks/portfolio-thunks";
import { resetState } from "@/features/portfolio/store/slice/portfolio-profile-slice";
import {
  PortfolioProfileSaveRequest,
  PortfolioHoursRequest,
  PortfolioGalleryItemRequest,
  PortfolioServiceItemRequest,
  PortfolioTeamMemberRequest,
  PortfolioCustomStatRequest,
  PortfolioAdminProfile,
} from "@/features/portfolio/store/models/portfolio-types";

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"] as const;

function buildFormFromProfile(p: PortfolioAdminProfile): PortfolioProfileSaveRequest {
  return {
    slug: p.slug || "",
    tagline: p.tagline || "",
    description: p.description || "",
    logoUrl: p.logoUrl || "",
    coverImageUrl: p.coverImageUrl || "",
    industry: p.industry || "",
    contactEmail: p.contact.email || "",
    contactPhone: p.contact.phone || "",
    contactPhones: p.contact.phones ?? [],
    contactWhatsapp: p.contact.whatsapp || "",
    contactTelegram: p.contact.telegram || "",
    addressStreet: p.contact.address.street || "",
    addressCity: p.contact.address.city || "",
    addressState: p.contact.address.state || "",
    addressCountry: p.contact.address.country || "",
    addressPostalCode: p.contact.address.postalCode || "",
    mapLink: p.contact.mapLink || "",
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
  isPublished: false,
  businessHours: DAYS.map((d) => ({ day: d, isOpen: false, openTime: "08:00", closeTime: "18:00", is24Hours: false })),
  gallery: [],
  services: [],
  team: [],
});

export default function PortfolioPage() {
  useAdminCleanup(resetState);

  const { profile, isLoading, isSaving, dispatch } = usePortfolioProfileState();
  const [form, setForm] = useState<PortfolioProfileSaveRequest>(emptyForm);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    dispatch(fetchAdminPortfolioProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setForm(buildFormFromProfile(profile));
  }, [profile]);

  function setField<K extends keyof PortfolioProfileSaveRequest>(key: K, value: PortfolioProfileSaveRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Business Hours ──────────────────────────────────────────────
  function setHour(idx: number, update: Partial<PortfolioHoursRequest>) {
    setForm((f) => {
      const hours = [...(f.businessHours ?? [])];
      hours[idx] = { ...hours[idx], ...update };
      return { ...f, businessHours: hours };
    });
  }

  // ── Phone list ──────────────────────────────────────────────────
  function addPhone() {
    setForm((f) => ({ ...f, contactPhones: [...(f.contactPhones ?? []), ""] }));
  }
  function setPhone(i: number, v: string) {
    setForm((f) => { const p = [...(f.contactPhones ?? [])]; p[i] = v; return { ...f, contactPhones: p }; });
  }
  function removePhone(i: number) {
    setForm((f) => ({ ...f, contactPhones: (f.contactPhones ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Features ────────────────────────────────────────────────────
  function addFeature() {
    const v = featureInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, features: [...(f.features ?? []), v] }));
    setFeatureInput("");
  }
  function removeFeature(i: number) {
    setForm((f) => ({ ...f, features: (f.features ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Gallery ─────────────────────────────────────────────────────
  function addGallery() {
    setForm((f) => ({ ...f, gallery: [...(f.gallery ?? []), { url: "", title: "", description: "", displayOrder: (f.gallery?.length ?? 0) + 1 }] }));
  }
  function setGallery(i: number, update: Partial<PortfolioGalleryItemRequest>) {
    setForm((f) => { const g = [...(f.gallery ?? [])]; g[i] = { ...g[i], ...update }; return { ...f, gallery: g }; });
  }
  function removeGallery(i: number) {
    setForm((f) => ({ ...f, gallery: (f.gallery ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Services ────────────────────────────────────────────────────
  function addService() {
    setForm((f) => ({ ...f, services: [...(f.services ?? []), { name: "", description: "" }] }));
  }
  function setService(i: number, update: Partial<PortfolioServiceItemRequest>) {
    setForm((f) => { const s = [...(f.services ?? [])]; s[i] = { ...s[i], ...update }; return { ...f, services: s }; });
  }
  function removeService(i: number) {
    setForm((f) => ({ ...f, services: (f.services ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Team ────────────────────────────────────────────────────────
  function addTeam() {
    setForm((f) => ({ ...f, team: [...(f.team ?? []), { name: "", position: "", bio: "", photoUrl: "" }] }));
  }
  function setTeam(i: number, update: Partial<PortfolioTeamMemberRequest>) {
    setForm((f) => { const t = [...(f.team ?? [])]; t[i] = { ...t[i], ...update }; return { ...f, team: t }; });
  }
  function removeTeam(i: number) {
    setForm((f) => ({ ...f, team: (f.team ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Custom Stats ────────────────────────────────────────────────
  function addCustomStat() {
    setForm((f) => ({ ...f, customStats: [...(f.customStats ?? []), { label: "", value: "" }] }));
  }
  function setCustomStat(i: number, update: Partial<PortfolioCustomStatRequest>) {
    setForm((f) => { const c = [...(f.customStats ?? [])]; c[i] = { ...c[i], ...update }; return { ...f, customStats: c }; });
  }
  function removeCustomStat(i: number) {
    setForm((f) => ({ ...f, customStats: (f.customStats ?? []).filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slug?.trim()) { showToast.error("Slug is required"); return; }
    if (!form.description?.trim()) { showToast.error("Description is required"); return; }
    if (!form.contactEmail?.trim()) { showToast.error("Contact email is required"); return; }
    if (!form.contactPhone?.trim()) { showToast.error("Contact phone is required"); return; }

    const result = await dispatch(saveAdminPortfolioProfileThunk(form));
    if (saveAdminPortfolioProfileThunk.fulfilled.match(result)) {
      showToast.success("Portfolio profile saved successfully");
    } else {
      showToast.error((result.payload as string) || "Failed to save portfolio profile");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-2 pb-8">
        <CardHeaderSection title="Portfolio Profile" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-2 pb-8">
      <CardHeaderSection title="Portfolio Profile" />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

        {/* ── Basic Info ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="golden-dragon-restaurant" />
                <p className="text-xs text-muted-foreground">URL-friendly identifier (no spaces)</p>
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input value={form.industry} onChange={(e) => setField("industry", e.target.value)} placeholder="Food & Beverage" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} placeholder="Authentic Khmer & Asian Cuisine" />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-destructive">*</span></Label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Tell visitors about your business..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Logo URL</Label>
                <Input value={form.logoUrl} onChange={(e) => setField("logoUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image URL</Label>
                <Input value={form.coverImageUrl} onChange={(e) => setField("coverImageUrl", e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isPublished ?? false}
                onCheckedChange={(v) => setField("isPublished", v)}
              />
              <Label>Published (visible to public)</Label>
            </div>
          </CardContent>
        </Card>

        {/* ── Contact ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} placeholder="info@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Primary Phone <span className="text-destructive">*</span></Label>
                <Input value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} placeholder="+855 23 456 789" />
              </div>
            </div>

            {/* Additional phones */}
            <div className="space-y-2">
              <Label>Additional Phone Numbers</Label>
              {(form.contactPhones ?? []).map((phone, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={phone} onChange={(e) => setPhone(i, e.target.value)} placeholder="+855 12 345 678" />
                  <Button type="button" variant="outline" size="sm" onClick={() => removePhone(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addPhone} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Phone
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Telegram</Label>
                <Input value={form.contactTelegram} onChange={(e) => setField("contactTelegram", e.target.value)} placeholder="+85523456789" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input value={form.contactWhatsapp} onChange={(e) => setField("contactWhatsapp", e.target.value)} placeholder="+85523456789" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Street</Label>
                <Input value={form.addressStreet} onChange={(e) => setField("addressStreet", e.target.value)} placeholder="123 Norodom Boulevard" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.addressCity} onChange={(e) => setField("addressCity", e.target.value)} placeholder="Phnom Penh" />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.addressCountry} onChange={(e) => setField("addressCountry", e.target.value)} placeholder="Cambodia" />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input value={form.addressPostalCode} onChange={(e) => setField("addressPostalCode", e.target.value)} placeholder="12000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Google Maps Link</Label>
              <Input value={form.mapLink} onChange={(e) => setField("mapLink", e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </CardContent>
        </Card>

        {/* ── Social Media ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["socialFacebook","socialInstagram","socialTwitter","socialLinkedin","socialYoutube","socialTiktok","socialWebsite"] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label>{key.replace("social", "")}</Label>
                  <Input value={(form[key] as string) ?? ""} onChange={(e) => setField(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Business Hours ────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(form.businessHours ?? []).map((h, i) => (
              <div key={h.day} className="flex flex-wrap items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-24 text-sm font-medium text-foreground">
                  {h.day.charAt(0) + h.day.slice(1).toLowerCase()}
                </span>
                <Switch checked={h.isOpen} onCheckedChange={(v) => setHour(i, { isOpen: v })} />
                {h.isOpen && (
                  <>
                    <Switch checked={h.is24Hours ?? false} onCheckedChange={(v) => setHour(i, { is24Hours: v })} />
                    <span className="text-xs text-muted-foreground">24h</span>
                    {!h.is24Hours && (
                      <>
                        <Input type="time" value={h.openTime ?? "08:00"} onChange={(e) => setHour(i, { openTime: e.target.value })} className="w-32" />
                        <span className="text-sm text-muted-foreground">–</span>
                        <Input type="time" value={h.closeTime ?? "18:00"} onChange={(e) => setHour(i, { closeTime: e.target.value })} className="w-32" />
                      </>
                    )}
                  </>
                )}
                {!h.isOpen && <span className="text-sm text-destructive">Closed</span>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Years in Business</Label>
                <Input type="number" value={form.yearsInBusiness ?? ""} onChange={(e) => setField("yearsInBusiness", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="10" />
              </div>
              <div className="space-y-1.5">
                <Label>Customers Served</Label>
                <Input type="number" value={form.customersServed ?? ""} onChange={(e) => setField("customersServed", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="50000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Custom Stats</Label>
              {(form.customStats ?? []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={s.label} onChange={(e) => setCustomStat(i, { label: e.target.value })} placeholder="Menu Items" className="flex-1" />
                  <Input value={s.value} onChange={(e) => setCustomStat(i, { value: e.target.value })} placeholder="80+" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeCustomStat(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addCustomStat} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Stat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Features ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Features &amp; Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="e.g. Free Wi-Fi" />
              <Button type="button" variant="outline" onClick={addFeature} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.features ?? []).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} className="hover:opacity-70"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Gallery ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Gallery</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addGallery} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(form.gallery ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No gallery items. Click &quot;Add Item&quot; to begin.</p>
            )}
            {(form.gallery ?? []).map((g, i) => (
              <div key={i} className="p-4 rounded-lg border border-border space-y-3 relative">
                <button type="button" onClick={() => removeGallery(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div className="space-y-1.5">
                    <Label>Image URL</Label>
                    <Input value={g.url} onChange={(e) => setGallery(i, { url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={g.title ?? ""} onChange={(e) => setGallery(i, { title: e.target.value })} placeholder="Dish Name" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Description</Label>
                    <Input value={g.description ?? ""} onChange={(e) => setGallery(i, { description: e.target.value })} placeholder="Brief description" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Services ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Services</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addService} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(form.services ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No services added yet.</p>
            )}
            {(form.services ?? []).map((s, i) => (
              <div key={i} className="p-4 rounded-lg border border-border space-y-3 relative">
                <button type="button" onClick={() => removeService(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 gap-3 pr-8">
                  <div className="space-y-1.5">
                    <Label>Service Name</Label>
                    <Input value={s.name} onChange={(e) => setService(i, { name: e.target.value })} placeholder="Dine In" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input value={s.description} onChange={(e) => setService(i, { description: e.target.value })} placeholder="Brief description of this service" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Team ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Team Members</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTeam} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(form.team ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No team members added yet.</p>
            )}
            {(form.team ?? []).map((m, i) => (
              <div key={i} className="p-4 rounded-lg border border-border space-y-3 relative">
                <button type="button" onClick={() => removeTeam(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input value={m.name} onChange={(e) => setTeam(i, { name: e.target.value })} placeholder="Chef Visal Sok" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Position</Label>
                    <Input value={m.position} onChange={(e) => setTeam(i, { position: e.target.value })} placeholder="Head Chef" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Photo URL</Label>
                    <Input value={m.photoUrl ?? ""} onChange={(e) => setTeam(i, { photoUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Bio</Label>
                    <Input value={m.bio ?? ""} onChange={(e) => setTeam(i, { bio: e.target.value })} placeholder="Short bio about this team member" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Save button ───────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2 min-w-32">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving…" : "Save Profile"}
          </Button>
        </div>

      </form>
    </div>
  );
}

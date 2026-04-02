"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialMedia {
  name: string;
  imageUrl: string;
  linkUrl: string;
}

interface BusinessSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  taxPercentage: number | null;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
}

interface FormData {
  taxPercentage: string;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
}

export default function BusinessSettingsPage() {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSocialMedia, setNewSocialMedia] = useState<SocialMedia>({
    name: "",
    imageUrl: "",
    linkUrl: "",
  });

  const form = useForm<FormData>({
    mode: "onChange",
  });

  // Fetch business settings
  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  const fetchBusinessSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/business-settings/current");
      if (!response.ok) throw new Error("Failed to fetch business settings");

      const data = await response.json();
      setBusinessSettings(data.data || data);

      // Initialize form with current data
      form.reset({
        taxPercentage: data.data?.taxPercentage?.toString() || "",
        logoBusinessUrl: data.data?.logoBusinessUrl || "",
        enableStock: data.data?.enableStock || "DISABLED",
        socialMedia: data.data?.socialMedia || [],
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSocialMedia = () => {
    if (!newSocialMedia.name || !newSocialMedia.imageUrl || !newSocialMedia.linkUrl) {
      showToast.error("Please fill in all social media fields");
      return;
    }

    const currentSocialMedia = form.getValues("socialMedia") || [];
    form.setValue("socialMedia", [...currentSocialMedia, newSocialMedia]);
    setNewSocialMedia({ name: "", imageUrl: "", linkUrl: "" });
    showToast.success("Social media account added");
  };

  const handleRemoveSocialMedia = (index: number) => {
    const currentSocialMedia = form.getValues("socialMedia") || [];
    form.setValue(
      "socialMedia",
      currentSocialMedia.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      const payload = {
        taxPercentage: data.taxPercentage ? parseFloat(data.taxPercentage) : null,
        logoBusinessUrl: data.logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: data.socialMedia,
      };

      const response = await fetch("/api/v1/business-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      const result = await response.json();
      setBusinessSettings(result.data || result);
      showToast.success("Business settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast.error("Failed to update business settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your business configuration and social media presence
            </p>
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      {businessSettings && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{businessSettings.businessName}</span>
              <Badge variant="outline" className="text-xs">
                {businessSettings.businessId}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(businessSettings.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated By:</span>
              <span>{businessSettings.updatedBy}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Configure core business settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tax Percentage */}
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Tax Percentage</Label>
                <div className="relative">
                  <Input
                    id="taxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    className="pr-8"
                    {...form.register("taxPercentage")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tax rate applied to all transactions (0-100%)
                </p>
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <Label htmlFor="enableStock">Stock Management</Label>
                <Select
                  value={form.watch("enableStock")}
                  onValueChange={(value) =>
                    form.setValue("enableStock", value as "ENABLED" | "DISABLED")
                  }
                >
                  <SelectTrigger id="enableStock">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENABLED">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Enabled
                      </span>
                    </SelectItem>
                    <SelectItem value="DISABLED">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Disabled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Enable or disable stock management system
                </p>
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoBusinessUrl">Business Logo</Label>
              <Input
                id="logoBusinessUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                {...form.register("logoBusinessUrl")}
              />
              <p className="text-xs text-muted-foreground">
                Upload your business logo image URL (PNG, JPG recommended)
              </p>
              {form.watch("logoBusinessUrl") && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed">
                  <p className="text-xs text-muted-foreground mb-3">Logo Preview:</p>
                  <img
                    src={form.watch("logoBusinessUrl")}
                    alt="Logo preview"
                    className="h-20 w-20 rounded border object-cover"
                    onError={() => {
                      console.error("Failed to load logo image");
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <p className="text-sm text-muted-foreground">
                {form.watch("socialMedia")?.length > 0
                  ? `${form.watch("socialMedia").length} account${
                      form.watch("socialMedia").length > 1 ? "s" : ""
                    } added`
                  : "No social media accounts added"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSocialMedia = form.getValues("socialMedia") || [];
                form.setValue("socialMedia", [
                  ...currentSocialMedia,
                  { name: "", imageUrl: "", linkUrl: "" },
                ]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {form.watch("socialMedia")?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No social media accounts added
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.watch("socialMedia")?.map((social, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 relative lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Platform Name</Label>
                          <Input
                            placeholder="e.g., Facebook"
                            value={social.name}
                            onChange={(e) => {
                              const updated = [...(form.getValues("socialMedia") || [])];
                              updated[index].name = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Icon/Logo URL</Label>
                          <Input
                            placeholder="https://example.com/icon.png"
                            type="url"
                            value={social.imageUrl}
                            onChange={(e) => {
                              const updated = [...(form.getValues("socialMedia") || [])];
                              updated[index].imageUrl = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Profile URL</Label>
                          <Input
                            placeholder="https://facebook.com/yourprofile"
                            type="url"
                            value={social.linkUrl}
                            onChange={(e) => {
                              const updated = [...(form.getValues("socialMedia") || [])];
                              updated[index].linkUrl = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveSocialMedia(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={fetchBusinessSettings}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !form.formState.isDirty}
            className="min-w-[150px]"
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

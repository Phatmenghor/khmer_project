"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchCurrentBusinessSettings,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type SocialMedia,
} from "@/redux/features/business/store/services/business-settings-service";

interface FormData {
  taxPercentage: string;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function BusinessSettingsPage() {
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      const data = await fetchCurrentBusinessSettings();
      setBusinessSettings(data);

      // Initialize form with current data
      form.reset({
        taxPercentage: data?.taxPercentage?.toString() || "",
        logoBusinessUrl: data?.logoBusinessUrl || "",
        enableStock: data?.enableStock || "DISABLED",
        socialMedia: data?.socialMedia || [],
        primaryColor: data?.primaryColor || "#57823D",
        secondaryColor: data?.secondaryColor || "#404040",
        accentColor: data?.accentColor || "#2E74D0",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      const payload = {
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : null,
        logoBusinessUrl: data.logoBusinessUrl,
        enableStock: data.enableStock,
        socialMedia: data.socialMedia,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
      };

      const result = await updateCurrentBusinessSettings(payload);
      setBusinessSettings(result);
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
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media accounts
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
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
                    form.setValue(
                      "enableStock",
                      value as "ENABLED" | "DISABLED",
                    )
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
                Business logo image URL
              </p>
              {form.watch("logoBusinessUrl") && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Preview:
                  </span>
                  <img
                    src={form.watch("logoBusinessUrl")}
                    alt="Logo preview"
                    className="h-10 w-10 rounded border object-cover"
                    onError={() => {
                      console.error("Failed to load logo image");
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your brand colors (applies site-wide)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("primaryColor") || "#57823D"}
                    onChange={(e) => form.setValue("primaryColor", e.target.value)}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder="#57823D"
                    value={form.watch("primaryColor") || "#57823D"}
                    onChange={(e) => form.setValue("primaryColor", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Main brand color
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("secondaryColor") || "#404040"}
                    onChange={(e) => form.setValue("secondaryColor", e.target.value)}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder="#404040"
                    value={form.watch("secondaryColor") || "#404040"}
                    onChange={(e) => form.setValue("secondaryColor", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Secondary brand color
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("accentColor") || "#2E74D0"}
                    onChange={(e) => form.setValue("accentColor", e.target.value)}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder="#2E74D0"
                    value={form.watch("accentColor") || "#2E74D0"}
                    onChange={(e) => form.setValue("accentColor", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Accent color for highlights
                </p>
              </div>
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
              disabled={isSaving}
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
                          <Label className="text-sm font-medium">
                            Platform Name
                          </Label>
                          <Input
                            placeholder="e.g., Facebook"
                            value={social.name}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].name = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Icon/Logo URL
                          </Label>
                          <Input
                            placeholder="https://example.com/icon.png"
                            type="url"
                            value={social.imageUrl}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].imageUrl = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Profile URL
                          </Label>
                          <Input
                            placeholder="https://facebook.com/yourprofile"
                            type="url"
                            value={social.linkUrl}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].linkUrl = e.target.value;
                              form.setValue("socialMedia", updated);
                            }}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      {!isSaving && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const currentSocialMedia =
                              form.getValues("socialMedia") || [];
                            form.setValue(
                              "socialMedia",
                              currentSocialMedia.filter((_, i) => i !== index),
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
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

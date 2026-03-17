"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Save,
  Eye,
  Upload,
  Plus,
  Trash2,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { demoBusinessProfile } from "@/data/business-profile-template";
import {
  BusinessProfile,
  BusinessType,
  DayOfWeek,
} from "@/types/business-profile";
import Link from "next/link";

export default function BusinessProfileEditorPage() {
  const [profile, setProfile] = useState<BusinessProfile>(demoBusinessProfile);
  const [activeTab, setActiveTab] = useState<string>("basic");

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      businessName: profile.businessName,
      tagline: profile.tagline || "",
      description: profile.description,
      businessType: profile.businessType,
      industry: profile.industry,
      email: profile.contact.email,
      phone: profile.contact.phone,
      whatsapp: profile.contact.whatsapp || "",
      street: profile.contact.address.street,
      city: profile.contact.address.city,
      state: profile.contact.address.state || "",
      country: profile.contact.address.country,
      postalCode: profile.contact.address.postalCode || "",
      facebook: profile.socialMedia?.facebook || "",
      instagram: profile.socialMedia?.instagram || "",
      twitter: profile.socialMedia?.twitter || "",
      linkedin: profile.socialMedia?.linkedin || "",
      website: profile.socialMedia?.website || "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Saving profile:", data);
    showToast.success("Business profile updated successfully!");
    // TODO: API call to save profile
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact & Hours" },
    { id: "media", label: "Images & Gallery" },
    { id: "services", label: "Services & Products" },
    { id: "team", label: "Team & Testimonials" },
    { id: "social", label: "Social Media" },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Business Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Customize your business portfolio and showcase your brand
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/business-profile" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant={profile.isPublished ? "default" : "secondary"}>
          {profile.isPublished ? "✓ Published" : "Draft"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Name *
                  </label>
                  <Controller
                    name="businessName"
                    control={control}
                    rules={{ required: "Business name is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="My Amazing Business" />
                    )}
                  />
                  {errors.businessName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tagline
                  </label>
                  <Controller
                    name="tagline"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Your catchy tagline here" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Business Type *
                    </label>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full border rounded-md px-3 py-2"
                        >
                          {Object.values(BusinessType).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Industry *
                    </label>
                    <Controller
                      name="industry"
                      control={control}
                      rules={{ required: "Industry is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="e.g., Food & Beverage" />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    About Your Business *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Tell your customers about your business, what makes you unique, your story..."
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact & Hours Tab */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="contact@business.com"
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    WhatsApp (optional)
                  </label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="+1234567890" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <Controller
                    name="street"
                    control={control}
                    rules={{ required: "Address is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="123 Main Street" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: "City is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="San Francisco" />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State/Province
                    </label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="California" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <Controller
                      name="country"
                      control={control}
                      rules={{ required: "Country is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="United States" />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="94102" />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.businessHours?.map((hours, index) => (
                    <div key={hours.day} className="flex flex-wrap items-center gap-2">
                      <div className="w-24 font-medium text-sm">
                        {hours.day.charAt(0) + hours.day.slice(1).toLowerCase()}
                      </div>
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        className="rounded"
                        onChange={() => {
                          // Handle toggle
                        }}
                      />
                      {hours.isOpen && (
                        <>
                          <Input
                            type="time"
                            value={hours.openTime}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.closeTime}
                            className="w-32"
                          />
                        </>
                      )}
                      {!hours.isOpen && (
                        <span className="text-gray-500 text-sm">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Images & Gallery Tab */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cover Image & Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1200x400px
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Logo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Square image, 400x400px
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gallery</span>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Photo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.gallery?.map((item, index) => (
                    <div key={item.id} className="relative group aspect-square">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 rounded-full text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">Add Photo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <Input {...field} placeholder="https://yourwebsite.com" />
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Facebook
                </label>
                <Controller
                  name="facebook"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://facebook.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Instagram
                </label>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://instagram.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Twitter
                </label>
                <Controller
                  name="twitter"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://twitter.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  LinkedIn
                </label>
                <Controller
                  name="linkedin"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/company/yourpage"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === "services" || activeTab === "team") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "services"
                  ? "Services & Products"
                  : "Team & Testimonials"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">
                  This section will allow you to manage your{" "}
                  {activeTab === "services"
                    ? "services, products, and features"
                    : "team members and customer testimonials"}
                  .
                </p>
                <Button className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Add {activeTab === "services" ? "Service" : "Team Member"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

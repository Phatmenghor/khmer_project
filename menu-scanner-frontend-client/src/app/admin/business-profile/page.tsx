"use client";

import { Messages } from "@/constants/messages";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Save, Eye, Upload, Plus, Trash2, Globe, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
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
      email: profile.contact.email,
      phone: profile.contact.phone,
      whatsapp: profile.contact.whatsapp || "",
      address: profile.contact.address || "",
      facebook: profile.socialMedia?.facebook || "",
      instagram: profile.socialMedia?.instagram || "",
      twitter: profile.socialMedia?.twitter || "",
      linkedin: profile.socialMedia?.linkedin || "",
      website: profile.socialMedia?.website || "",
    },
  });

  const onSubmit = (data: Record<string, unknown>) => {
    showToast.success(Messages.business.profileUpdated);
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
    <div className="container mx-auto px-2 sm:px-3 py-3 sm:py-5 max-w-7xl">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-5">
        <div>
          <h1 className="text-xs sm:text-xs font-bold">Business Profile</h1>
          <p className="text-xs text-gray-600 mt-1">
            Customize your business portfolio and showcase your brand
          </p>
        </div>
        <div className="flex gap-1">
          <Link href="/business-profile" target="_blank">
            <CustomButton variant="outline" size="sm" className="gap-1">
              <Eye className="w-3 h-3" />
              Preview
            </CustomButton>
          </Link>
          <CustomButton
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty}
            className="gap-1"
          >
            <Save className="w-3 h-3" />
            Save Changes
          </CustomButton>
        </div>
      </div>

      {}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-3 overflow-x-auto">
          {tabs.map((tab) => (
            <CustomButton variant="unstyled" size="unstyled"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </CustomButton>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
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
                    <p className="text-red-600 text-xs mt-1">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Business Type *
                    </label>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full border rounded px-2 py-1"
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

                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
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
                    <p className="text-red-600 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
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
                    <p className="text-red-600 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
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
                  <label className="block text-xs font-medium mb-1">
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
                  <label className="block text-xs font-medium mb-1">
                    Address *
                  </label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: "Address is required" }}
                    render={({ field }) => (
                      <Textarea {...field} rows={3} placeholder="123 Main Street, San Francisco, California, United States, 94102" />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.businessHours?.map((hours, index) => (
                    <div key={hours.day} className="flex flex-wrap items-center gap-1">
                      <div className="w-16 font-medium text-xs">
                        {hours.day.charAt(0) + hours.day.slice(1).toLowerCase()}
                      </div>
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        className="rounded"
                        onChange={() => {

                        }}
                      />
                      {hours.isOpen && (
                        <>
                          <Input
                            type="time"
                            value={hours.openTime}
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.closeTime}
                            className="w-24"
                          />
                        </>
                      )}
                      {!hours.isOpen && (
                        <span className="text-gray-500 text-xs">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cover Image & Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed rounded p-5 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1200x400px
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Business Logo
                  </label>
                  <div className="border-2 border-dashed rounded p-5 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
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
                  <CustomButton size="sm" className="gap-1">
                    <Plus className="w-3 h-3" />
                    Add Photo
                  </CustomButton>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {profile.gallery?.map((item, index) => (
                    <div key={item.id} className="relative group aspect-square">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded flex items-center justify-center">
                        <CustomButton variant="unstyled" size="unstyled" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 rounded-full text-white">
                          <Trash2 className="w-3 h-3" />
                        </CustomButton>
                      </div>
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                    <div className="text-center">
                      <Plus className="w-4 h-4 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">Add Photo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {}
        {activeTab === "social" && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-w-2xl">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <Input {...field} placeholder="https://yourwebsite.com" />
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
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
                <label className="block text-xs font-medium mb-1">
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
                <label className="block text-xs font-medium mb-1">
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
                <label className="block text-xs font-medium mb-1">
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

        {}
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
              <div className="text-center py-8">
                <p className="text-gray-500">
                  This section will allow you to manage your{" "}
                  {activeTab === "services"
                    ? "services, products, and features"
                    : "team members and customer testimonials"}
                  .
                </p>
                <CustomButton className="mt-3 gap-1">
                  <Plus className="w-3 h-3" />
                  Add {activeTab === "services" ? "Service" : "Team Member"}
                </CustomButton>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

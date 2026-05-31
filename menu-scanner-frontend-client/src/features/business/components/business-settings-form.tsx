"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "../store/thunks/business-settings-thunks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { showToast } from "@/components/shared/common/show-toast";
import Loading from "@/components/shared/common/loading";
import { RefreshCw, Save } from "lucide-react";

interface BusinessSettingsFormProps {
  businessId?: string;
}

export function BusinessSettingsForm({
  businessId: propBusinessId,
}: BusinessSettingsFormProps) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(
    (state) => state.businessSettings.data
  );
  const isLoading = useAppSelector(
    (state) => state.businessSettings.isLoading
  );
  const error = useAppSelector(
    (state) => state.businessSettings.error
  );

  const [isSaving, setIsSaving] = useState(false);
  const [businessId, setBusinessId] = useState(
    propBusinessId || localStorage.getItem("businessId") || ""
  );

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      businessName: "",
      taxPercentage: 0,
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      primaryColor: "#000000",
      lowStockThreshold: 5,
      enableStock: "DISABLED",
    },
  });

  // Load settings on mount or when businessId changes
  useEffect(() => {
    if (businessId) {
      dispatch(fetchBusinessSettingsThunk(businessId));
    }
  }, [businessId, dispatch]);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        businessName: settings.businessName || "",
        taxPercentage: settings.taxPercentage || 0,
        contactAddress: settings.contactAddress || "",
        contactPhone: settings.contactPhone || "",
        contactEmail: settings.contactEmail || "",
        primaryColor: settings.primaryColor || "#000000",
        lowStockThreshold: settings.lowStockThreshold || 5,
        enableStock: settings.enableStock || "DISABLED",
      });
    }
  }, [settings, reset]);

  // Handle save
  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      await dispatch(
        updateBusinessSettingsThunk(data)
      ).unwrap();
      showToast.success("Business settings updated successfully");
    } catch (err: any) {
      showToast.error(err || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await dispatch(fetchBusinessSettingsThunk(businessId)).unwrap();
      showToast.success("Settings refreshed");
    } catch (err: any) {
      showToast.error(err || "Failed to refresh settings");
    }
  };

  if (isLoading && !settings) {
    return <Loading />;
  }

  if (error && !settings) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your business information and preferences
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Business Info */}
      {settings && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Business ID:</strong> {settings.businessId}
            </p>
            <p className="text-sm">
              <strong>Last Updated:</strong> {new Date(settings.updatedAt).toLocaleString()}
            </p>
            <p className="text-sm">
              <strong>Updated By:</strong> {settings.updatedBy || "System"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              control={control}
              name="businessName"
              label="Business Name"
              placeholder="Enter business name"
            />

            <TextField
              control={control}
              name="taxPercentage"
              label="Tax Percentage (%)"
              type="number"
              placeholder="0"
            />

            <TextField
              control={control}
              name="contactAddress"
              label="Contact Address"
              placeholder="Enter address"
            />

            <TextField
              control={control}
              name="contactPhone"
              label="Contact Phone"
              placeholder="Enter phone"
            />

            <TextField
              control={control}
              name="contactEmail"
              label="Contact Email"
              placeholder="Enter email"
              type="email"
            />

            <TextField
              control={control}
              name="primaryColor"
              label="Primary Color"
              type="color"
            />

            <TextField
              control={control}
              name="lowStockThreshold"
              label="Low Stock Threshold"
              type="number"
              placeholder="5"
            />

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> If you don't see updates made by other admins, click the "Refresh" button at the top to get the latest data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessSettingsForm;

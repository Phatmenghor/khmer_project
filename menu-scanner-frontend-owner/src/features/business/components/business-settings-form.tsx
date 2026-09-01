"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "../store/thunks/business-settings-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { DefaultShiftRosterSection } from "@/features/business/components/default-shift-roster-section";
import { showToast } from "@/components/shared/common/show-toast";
import { Loading } from "@/components/shared/common/loading";
import { RefreshCw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayShiftDto } from "@/features/hr/store/models/hr-models";

interface BusinessSettingsFormProps {
  businessId?: string;
}

import { BASE_WEEK_DAYS, EMPTY_WORK_SHIFT_ROSTER } from "@/constants/week-days";

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
  const [businessId] = useState(
    propBusinessId || AppDefault.BUSINESS_ID
  );

  const [dayConfigs, setDayConfigs] = useState<DayShiftDto[]>(() => EMPTY_WORK_SHIFT_ROSTER);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      businessName: "",
      taxPercentage: 0,
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
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
        lowStockThreshold: settings.lowStockThreshold || 5,
        enableStock: settings.enableStock || "DISABLED",
      });

      if (settings.defaultDayShifts && settings.defaultDayShifts.length > 0) {
        const mapped = BASE_WEEK_DAYS.map((d) => {
          const found = settings.defaultDayShifts?.find(
            (ds: any) => ds.dayOfWeek === d.day
          );
          if (found) {
            return {
              dayOfWeek: d.day as any,
              enabled: Boolean(found.enabled),
              startTime: found.startTime ? found.startTime.substring(0, 5) : "",
              endTime: found.endTime ? found.endTime.substring(0, 5) : "",
              breakStartTime: found.breakStartTime ? found.breakStartTime.substring(0, 5) : "",
              breakEndTime: found.breakEndTime ? found.breakEndTime.substring(0, 5) : "",
              enableCheckIn: Boolean(found.enableCheckIn),
              scanMode: found.scanMode || "FULL_TIME",
            };
          }
          return {
            dayOfWeek: d.day as any,
            enabled: false,
            startTime: "",
            endTime: "",
            breakStartTime: "",
            breakEndTime: "",
            enableCheckIn: false,
            scanMode: "FULL_TIME",
          };
        });
        setDayConfigs(mapped);
      }
    }
  }, [settings, reset]);

  const handleUpdateDayShift = (index: number, field: keyof DayShiftDto, value: any) => {
    setDayConfigs((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        const item = { ...updated[index], [field]: value };
        if (field === "enabled" && value === true) {
          if (!item.startTime) item.startTime = "08:00";
          if (!item.endTime) item.endTime = "17:00";
          if (!item.breakStartTime) item.breakStartTime = "12:00";
          if (!item.breakEndTime) item.breakEndTime = "13:00";
          if (item.enableCheckIn === undefined || item.enableCheckIn === false) item.enableCheckIn = true;
          if (!item.scanMode) item.scanMode = "FULL_TIME";
        }
        if (field === "enableCheckIn" && value === true) {
          if (!item.scanMode) item.scanMode = "FULL_TIME";
        }
        updated[index] = item;
      }
      return updated;
    });
  };

  // Handle save
  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      const cleanedDayShifts = (dayConfigs || []).map((ds) => ({
        dayOfWeek: ds.dayOfWeek,
        enabled: Boolean(ds.enabled),
        startTime: ds.startTime && ds.startTime.trim() !== "" ? ds.startTime : null,
        endTime: ds.endTime && ds.endTime.trim() !== "" ? ds.endTime : null,
        breakStartTime: ds.breakStartTime && ds.breakStartTime.trim() !== "" ? ds.breakStartTime : null,
        breakEndTime: ds.breakEndTime && ds.breakEndTime.trim() !== "" ? ds.breakEndTime : null,
        enableCheckIn: Boolean(ds.enableCheckIn),
        scanMode: ds.scanMode || "FULL_TIME",
      }));

      const payload = {
        ...data,
        defaultDayShifts: cleanedDayShifts,
      };
      await dispatch(updateBusinessSettingsThunk(payload)).unwrap();
      showToast.success("Business settings and staff default schedule roster updated successfully");
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
        <CardContent className="p-4">
          <p className="text-destructive mb-3">{error}</p>
          <CustomButton onClick={handleRefresh}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </CustomButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-sm md:text-base font-extrabold text-foreground">Business Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure business profile, staff working time defaults, and attendance scan rules
          </p>
        </div>
        <CustomButton
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-1 text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </CustomButton>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
        {/* 1. Basic Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs md:text-sm font-extrabold text-foreground">
              Basic Information
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              General business details and store profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            </div>

            <TextField
              control={control}
              name="lowStockThreshold"
              label="Low Stock Threshold"
              type="number"
              placeholder="5"
            />
          </CardContent>
        </Card>

        {/* 2. Staff Working Time / Default Working Schedule Configuration (Dynamic 7-Day Shift Roster with Per-Day Scan Rules) */}
        <DefaultShiftRosterSection
          dayShifts={dayConfigs}
          onUpdateDayShift={handleUpdateDayShift}
          disabled={isSaving}
        />

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <CustomButton
            type="submit"
            disabled={isSaving || isLoading}
            className="gap-1 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Business Settings"}
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </CustomButton>
        </div>
      </form>
    </div>
  );
}

export default BusinessSettingsForm;

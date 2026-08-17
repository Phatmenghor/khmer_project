"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Loader2, Save, RotateCcw } from "lucide-react";
import { hrSettingsSchema, HRSettingsFormValues } from "@/features/hr/store/models/schema/hr-settings.schema";
import { DefaultShiftRosterSection } from "@/features/business/components/default-shift-roster-section";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selectors";
import { fetchBusinessSettingsThunk, updateBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { BASE_WEEK_DAYS } from "@/constants/week-days";

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
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60 text-left">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-foreground leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function HRSettingsPageInner() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);

  const [isLoading, setIsLoading] = useState(!businessSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCustomRosterChanges, setHasCustomRosterChanges] = useState(false);

  // Default day shifts state (Mon - Sun)
  const [dayShifts, setDayShifts] = useState(() => {
    return BASE_WEEK_DAYS.map((wDay) => ({
      dayOfWeek: wDay.day,
      enabled: wDay.day !== "SATURDAY" && wDay.day !== "SUNDAY",
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      enableCheckIn: true,
      scanMode: "QR",
    }));
  });

  const form = useForm<HRSettingsFormValues>({
    resolver: zodResolver(hrSettingsSchema),
    mode: "onChange",
    defaultValues: {
      annualLeaveDaysPerYear: "18",
      sickLeaveDaysPerYear: "10",
      specialLeaveDaysPerYear: "5",
      dayShifts: [],
    },
  });

  const { isDirty } = form.formState;

  // Fetch business settings directly from backend API
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const action = await dispatch(fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID));
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const data: any = action.payload;
        form.reset({
          annualLeaveDaysPerYear: data.annualLeaveDaysPerYear?.toString() || "18",
          sickLeaveDaysPerYear: data.sickLeaveDaysPerYear?.toString() || "10",
          specialLeaveDaysPerYear: data.specialLeaveDaysPerYear?.toString() || "5",
        });

        if (Array.isArray(data.businessHours) && data.businessHours.length > 0) {
          const loadedShifts = BASE_WEEK_DAYS.map((wDay) => {
            const found = data.businessHours.find((bh: any) => bh.day?.toUpperCase() === wDay.day);
            return {
              dayOfWeek: wDay.day,
              enabled: Boolean(found),
              startTime: found?.openTime || "08:00",
              endTime: found?.closeTime || "17:00",
              breakStartTime: "12:00",
              breakEndTime: "13:00",
              enableCheckIn: true,
              scanMode: "QR",
            };
          });
          setDayShifts(loadedShifts);
        }
        setHasCustomRosterChanges(false);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle shift roster updates
  const handleUpdateDayShift = (index: number, field: string, value: any) => {
    setDayShifts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setHasCustomRosterChanges(true);
  };

  const onSubmit = async (data: HRSettingsFormValues) => {
    if (!isDirty && !hasCustomRosterChanges) {
      showToast.info("No changes were made to HR settings");
      return;
    }

    try {
      setIsSaving(true);
      const businessHoursPayload = dayShifts
        .filter((ds) => ds.enabled)
        .map((ds) => ({
          day: ds.dayOfWeek,
          openTime: ds.startTime || "08:00",
          closeTime: ds.endTime || "17:00",
        }));

      await dispatch(
        updateBusinessSettingsThunk({
          businessId: AppDefault.BUSINESS_ID,
          businessHours: businessHoursPayload,
          annualLeaveDaysPerYear: parseInt(data.annualLeaveDaysPerYear, 10),
          sickLeaveDaysPerYear: parseInt(data.sickLeaveDaysPerYear, 10),
          specialLeaveDaysPerYear: parseInt(data.specialLeaveDaysPerYear, 10),
        } as any)
      ).unwrap();

      showToast.success("HR settings & Staff Working Time saved successfully via API!");
      setHasCustomRosterChanges(false);
      dispatch(fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID));
    } catch (err: any) {
      showToast.error(err?.message || "Failed to save HR settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading HR settings from API...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-1 pb-10 pt-2 text-left">
      {/* Top Header */}
      <div className="space-y-1">
        <h1 className="text-base font-extrabold text-foreground">HR Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure staff annual leave entitlements, yearly quotas, and default shift rosters
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Staff Leave Entitlement & Allowances */}
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
          <SectionHeader
            icon={ShieldCheck}
            title="Staff Leave Entitlements & Yearly Quotas"
            subtitle="API-managed staff leave quotas per year (Calculated and reset annually per staff member on backend)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField<HRSettingsFormValues>
              control={form.control}
              name="annualLeaveDaysPerYear"
              label="Annual Leave (Days / Year)"
              placeholder="e.g. 18"
              disabled={isSaving}
              pattern="[0-9]"
              required
            />
            <TextField<HRSettingsFormValues>
              control={form.control}
              name="sickLeaveDaysPerYear"
              label="Sick Leave (Days / Year)"
              placeholder="e.g. 10"
              disabled={isSaving}
              pattern="[0-9]"
              required
            />
            <TextField<HRSettingsFormValues>
              control={form.control}
              name="specialLeaveDaysPerYear"
              label="Special Leave (Days / Year)"
              placeholder="e.g. 5"
              disabled={isSaving}
              pattern="[0-9]"
              required
            />
          </div>
        </div>

        {/* Section 2: Staff Working Time (Default Per-Day Shift Roster) */}
        <DefaultShiftRosterSection
          dayShifts={dayShifts}
          onUpdateDayShift={handleUpdateDayShift}
          disabled={isSaving}
        />

        {/* Floating / Bottom Save Action Bar */}
        <div className="sticky bottom-4 z-40 rounded-[16px] border border-border/80 bg-card/90 backdrop-blur-md p-3 px-4 sm:px-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-lg">
          <p className="text-xs font-medium text-muted-foreground text-center sm:text-left">
            {isDirty || hasCustomRosterChanges ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">● Unsaved changes detected</span>
            ) : (
              "All HR configurations saved"
            )}
          </p>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={isSaving}
              className="gap-1 font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || (!isDirty && !hasCustomRosterChanges)}
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

export default function HRSettingsPage() {
  return (
    <Suspense>
      <HRSettingsPageInner />
    </Suspense>
  );
}

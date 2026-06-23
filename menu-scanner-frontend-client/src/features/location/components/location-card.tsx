"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Edit2,
  Trash2,
  Star,
  Crown,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import {
  getLabelIcon,
  isLocationPrimary,
} from "../utils/location-helpers";

interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
}


const LABEL_THEME: Record<string, { bg: string; text: string; accent: string; iconBg: string }> = {
  home:      { bg: "bg-blue-50 dark:bg-blue-950/20",      text: "text-blue-600 dark:text-blue-400",    accent: "bg-blue-500",    iconBg: "bg-blue-100 dark:bg-blue-900/40"    },
  house:     { bg: "bg-blue-50 dark:bg-blue-950/20",      text: "text-blue-600 dark:text-blue-400",    accent: "bg-blue-500",    iconBg: "bg-blue-100 dark:bg-blue-900/40"    },
  office:    { bg: "bg-violet-50 dark:bg-violet-950/20",  text: "text-violet-600 dark:text-violet-400",accent: "bg-violet-500",  iconBg: "bg-violet-100 dark:bg-violet-900/40"},
  work:      { bg: "bg-violet-50 dark:bg-violet-950/20",  text: "text-violet-600 dark:text-violet-400",accent: "bg-violet-500",  iconBg: "bg-violet-100 dark:bg-violet-900/40"},
  shop:      { bg: "bg-orange-50 dark:bg-orange-950/20",  text: "text-orange-600 dark:text-orange-400",accent: "bg-orange-500",  iconBg: "bg-orange-100 dark:bg-orange-900/40"},
  store:     { bg: "bg-orange-50 dark:bg-orange-950/20",  text: "text-orange-600 dark:text-orange-400",accent: "bg-orange-500",  iconBg: "bg-orange-100 dark:bg-orange-900/40"},
  building:  { bg: "bg-slate-50 dark:bg-slate-950/20",    text: "text-slate-600 dark:text-slate-400",  accent: "bg-slate-500",   iconBg: "bg-slate-100 dark:bg-slate-900/40" },
  apartment: { bg: "bg-slate-50 dark:bg-slate-950/20",    text: "text-slate-600 dark:text-slate-400",  accent: "bg-slate-500",   iconBg: "bg-slate-100 dark:bg-slate-900/40" },
  family:    { bg: "bg-rose-50 dark:bg-rose-950/20",      text: "text-rose-600 dark:text-rose-400",    accent: "bg-rose-500",    iconBg: "bg-rose-100 dark:bg-rose-900/40"   },
  love:      { bg: "bg-rose-50 dark:bg-rose-950/20",      text: "text-rose-600 dark:text-rose-400",    accent: "bg-rose-500",    iconBg: "bg-rose-100 dark:bg-rose-900/40"   },
};

function getLabelTheme(label?: string | null) {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, t] of Object.entries(LABEL_THEME)) {
    if (lower.includes(key)) return t;
  }
  return null;
}

export function LocationCard({
  location,
  settingPrimaryId,
  onEdit,
  onDelete,
  onSetPrimary,
}: LocationCardProps) {
  const LabelIcon = getLabelIcon(location.label);
  const isPrimary = isLocationPrimary(location);
  const isSettingPrimary = settingPrimaryId === location.id;
  const theme = getLabelTheme(location.label);
  const hasCoordinates = location.hasCoordinates && location.latitude && location.longitude;

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/${location.latitude},${location.longitude}`
    : null;

  const handleViewMap = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded border bg-card overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md p-4 flex gap-3 text-left",
        isPrimary
          ? "border-amber-300/70 dark:border-amber-700/50"
          : "border-border/60"
      )}
    >
      {/* Side bar accent */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          isPrimary
            ? "bg-gradient-to-b from-amber-400 to-amber-500"
            : theme
            ? theme.accent
            : "bg-primary/40"
        )}
      />

      {/* Left Icon Block — like the Education thumbnail block */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded border flex items-center justify-center",
          isPrimary
            ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-700/50 dark:text-amber-400"
            : theme
            ? `${theme.bg} border-border/40 ${theme.text}`
            : "bg-muted border border-border/40 text-muted-foreground"
        )}
      >
        <LabelIcon className="h-6 w-6" strokeWidth={1.5} />
      </div>

      {/* Right Content Block */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-xs font-bold leading-tight",
                isPrimary
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-foreground"
              )}
            >
              {location.label || "Location"}
            </span>
            {isPrimary && (
              <Badge className="h-3.5 px-1 text-[9px] font-bold tracking-wide bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 shrink-0 flex items-center gap-1">
                <Crown className="h-2 w-2" />
                Default
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {!isPrimary && (
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => onSetPrimary(location)}
                disabled={isSettingPrimary}
                className="h-5 text-[10px] gap-1 rounded px-1.5"
              >
                <Star className="h-2.5 w-2.5" />
                <span>Default</span>
              </CustomButton>
            )}
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-5 w-5 p-0 rounded"
              title="Edit"
            >
              <Edit2 className="h-2.5 w-2.5" />
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => onDelete(location)}
              className="h-5 w-5 p-0 rounded text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </CustomButton>
          </div>
        </div>

        {/* Structured Grid Info — exactly like Education card */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">House / Street</span>
            <span className="text-foreground truncate font-medium">
              {location.houseNumber && location.streetNumber
                ? `${location.houseNumber} / ${location.streetNumber}`
                : location.houseNumber || location.streetNumber || "-"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">Village</span>
            <span className="text-foreground truncate font-medium">{location.village || "-"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">Commune</span>
            <span className="text-foreground truncate font-medium">{location.commune || "-"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">District</span>
            <span className="text-foreground truncate font-medium">{location.district || "-"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">Province</span>
            <span className="text-foreground truncate font-medium">{location.province || "-"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground">Country</span>
            <span className="text-foreground truncate font-medium">{location.country || "-"}</span>
          </div>

          {location.note && (
            <div className="flex flex-col gap-0.5 col-span-2">
              <span className="font-semibold text-muted-foreground">Note</span>
              <span className="text-foreground font-medium break-words line-clamp-1">{location.note}</span>
            </div>
          )}

          {hasCoordinates && (
            <div className="col-span-2 pt-1 border-t border-border/40 mt-1">
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={handleViewMap}
                className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View location on Google Maps</span>
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

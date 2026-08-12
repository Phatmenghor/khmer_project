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
  MapPin,
  ExternalLink,
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
        "group relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-md p-4 sm:p-4.5 flex gap-3 text-left",
        isPrimary
          ? "border-amber-400/80 dark:border-amber-600/50 bg-gradient-to-br from-amber-500/5 via-card to-card"
          : "border-border/80 hover:border-primary/40"
      )}
    >
      {/* Side bar accent */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
          isPrimary
            ? "bg-gradient-to-b from-amber-400 to-amber-500"
            : theme
            ? theme.accent
            : "bg-primary"
        )}
      />

      {/* Left Icon Block */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center shadow-2xs",
          isPrimary
            ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-700/50 dark:text-amber-400"
            : theme
            ? `${theme.bg} border-border/40 ${theme.text}`
            : "bg-primary/10 border border-primary/20 text-primary"
        )}
      >
        <LabelIcon className="h-5 w-5" strokeWidth={2} />
      </div>

      {/* Right Content Block */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-xs font-extrabold leading-tight",
                isPrimary
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-foreground"
              )}
            >
              {location.label || "Location"}
            </span>
            {isPrimary && (
              <Badge className="h-4 px-2 text-[9px] font-extrabold tracking-wide bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700/60 rounded-full shrink-0 flex items-center gap-1 shadow-2xs">
                <Crown className="h-2.5 w-2.5" />
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
                className="h-6 text-[10px] gap-1 rounded-xl px-2 font-bold border-border/60 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 cursor-pointer"
              >
                <Star className="h-3 w-3" />
                <span>Default</span>
              </CustomButton>
            )}
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-6 w-6 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit location"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(location)}
              className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Delete location"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </CustomButton>
          </div>
        </div>

        {/* Structured Grid Info */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">House / Street</span>
            <span className="text-foreground truncate font-extrabold">
              {location.houseNumber && location.streetNumber
                ? `${location.houseNumber} / ${location.streetNumber}`
                : location.houseNumber || location.streetNumber || "-"}
            </span>
          </div>

          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">Village</span>
            <span className="text-foreground truncate font-extrabold">{location.village || "-"}</span>
          </div>

          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">Commune</span>
            <span className="text-foreground truncate font-extrabold">{location.commune || "-"}</span>
          </div>

          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">District</span>
            <span className="text-foreground truncate font-extrabold">{location.district || "-"}</span>
          </div>

          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">Province</span>
            <span className="text-foreground truncate font-extrabold">{location.province || "-"}</span>
          </div>

          <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">Country</span>
            <span className="text-foreground truncate font-extrabold">{location.country || "-"}</span>
          </div>

          {location.note && (
            <div className="bg-muted/30 border border-border/40 p-1.5 rounded-xl flex flex-col gap-0.5 col-span-2">
              <span className="font-semibold text-muted-foreground text-[9px] uppercase tracking-wider">Note</span>
              <span className="text-foreground font-bold break-words line-clamp-1">{location.note}</span>
            </div>
          )}

          {hasCoordinates && (
            <div className="col-span-2 pt-1.5 border-t border-border/30 mt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleViewMap}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer group/pin"
                title="View on Google Maps"
              >
                <MapPin className="h-3 w-3 text-red-500 fill-red-500/20 shrink-0 group-hover/pin:scale-110 transition-transform" />
                <span>Map Pin</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </button>
              <span className="text-[9px] font-mono text-muted-foreground/80 truncate">
                {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

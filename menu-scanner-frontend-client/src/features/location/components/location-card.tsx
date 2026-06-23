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
        "group relative rounded border bg-background overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
        isPrimary
          ? "border-amber-300/70 dark:border-amber-700/50"
          : "border-border"
      )}
    >
      {}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
          isPrimary
            ? "bg-gradient-to-b from-amber-400 to-amber-500"
            : theme
            ? theme.accent
            : "bg-primary/40"
        )}
      />

      <div className="pl-3 pr-2 py-3">
        {}
        <div className="flex items-start gap-2">
          {}
          <div
            className={cn(
              "p-1 rounded shrink-0 mt-0.5",
              isPrimary
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                : theme
                ? `${theme.iconBg} ${theme.text}`
                : "bg-primary/10 text-primary"
            )}
          >
            <LabelIcon className="h-3 w-3" />
          </div>

          {}
          <div className="flex-1 min-w-0">
            {}
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <span
                className={cn(
                  "text-xs font-semibold leading-tight",
                  isPrimary
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-foreground"
                )}
              >
                {location.label || "Location"}
              </span>
              {isPrimary && (
                <Badge className="h-3 px-1 text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 shrink-0 flex items-center gap-1">
                  <Crown className="h-2 w-2" />
                  Default
                </Badge>
              )}
            </div>

            {}
            <CustomButton variant="unstyled" size="unstyled"
              onClick={handleViewMap}
              disabled={!hasCoordinates}
              className={cn(
                "text-left w-full transition-colors",
                hasCoordinates && "hover:text-primary cursor-pointer",
                !hasCoordinates && "cursor-default"
              )}
              title={hasCoordinates ? "Click to view on Google Maps" : ""}
            >
              <p className="text-xs font-medium text-foreground line-clamp-2">
                {location.fullAddress || "No address provided"}
              </p>
            </CustomButton>


          </div>

          {}
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            {!isPrimary && (
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => onSetPrimary(location)}
                disabled={isSettingPrimary}
                className="h-5 text-xs gap-1 rounded"
              >
                <Star className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">Default</span>
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
              className="h-5 w-5 p-0 rounded"
              title="Delete"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Edit2,
  Trash2,
  Star,
  StickyNote,
  Loader2,
  Crown,
  X,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import {
  getLabelIcon,
  formatLocationAddress,
  isLocationPrimary,
} from "../utils/location-helpers";

interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
}

// Label → theme colours
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
  const images = location.locationImages ?? [];
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black/85 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Location"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 rounded-full bg-white/20 text-white p-2 hover:bg-white/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          "group relative rounded-xl border bg-background overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
          isPrimary
            ? "border-amber-300/70 dark:border-amber-700/50"
            : "border-border"
        )}
      >
        {/* Left accent strip */}
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

        <div className="pl-4 pr-3 py-3">
          {/* ── Main row: icon + content + action buttons ── */}
          <div className="flex items-start gap-2.5">
            {/* Icon bubble */}
            <div
              className={cn(
                "p-2 rounded-lg shrink-0 mt-0.5",
                isPrimary
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                  : theme
                  ? `${theme.iconBg} ${theme.text}`
                  : "bg-primary/10 text-primary"
              )}
            >
              <LabelIcon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Label + Primary badge */}
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isPrimary
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-foreground"
                  )}
                >
                  {location.label || "Location"}
                </span>
                {isPrimary && (
                  <Badge className="h-4 px-1.5 text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 shrink-0">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    Primary
                  </Badge>
                )}
              </div>

              {/* Address */}
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {formatLocationAddress(location)}
              </p>

              {/* Coords + Note — inline */}
              {(location.hasCoordinates || location.note) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  {location.hasCoordinates && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                      <span className="text-[11px] font-mono text-muted-foreground/70">
                        {(location.latitude || 0).toFixed(4)},{" "}
                        {(location.longitude || 0).toFixed(4)}
                      </span>
                    </div>
                  )}
                  {location.note && (
                    <div className="flex items-center gap-1 max-w-[200px]">
                      <StickyNote className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span className="text-[11px] text-muted-foreground italic truncate">
                        {location.note}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Edit + Delete icon buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg"
                onClick={() => onEdit(location)}
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={() => onDelete(location)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Image thumbnails ── */}
          {images.length > 0 && (
            <div className="mt-2 ml-[38px] flex gap-1.5">
              {images.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-10 w-10 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:opacity-75 hover:scale-105 transition-all duration-150 shadow-sm"
                  onClick={() => setLightbox(img.imageUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 4 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">+{images.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Set as Primary button OR primary indicator ── */}
          <div className="mt-2.5 ml-[38px]">
            {!isPrimary ? (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-0 rounded-lg"
                onClick={() => onSetPrimary(location)}
                disabled={isSettingPrimary}
              >
                {isSettingPrimary ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Star className="h-3 w-3" />
                )}
                {isSettingPrimary ? "Setting..." : "Set as Primary"}
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Default delivery address
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

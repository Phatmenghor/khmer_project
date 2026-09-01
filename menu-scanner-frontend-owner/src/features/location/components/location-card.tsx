"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import {
  Edit2,
  Trash2,
  Star,
  Crown,
  MapPin,
  ExternalLink,
  ImageIcon,
  FileText,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import { isLocationPrimary } from "../utils/location-helpers";
import { getLabelIcon, getLabelTheme } from "../utils/location-theme";

interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
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

  const images = location.locationImages ?? [];
  const primaryImage = images.find((img) => Boolean(img.imageUrl))?.imageUrl;

  const fullAddress = [
    location.houseNumber ? `#${location.houseNumber}` : null,
    location.streetNumber ? `St ${location.streetNumber}` : null,
    location.village ? `Phum ${location.village}` : null,
    location.commune,
    location.district,
    location.province,
    location.country || "Cambodia",
  ]
    .filter(Boolean)
    .join(", ");

  const googleMapsUrl =
    location.googleMapsUrl ||
    (hasCoordinates
      ? `https://www.google.com/maps/search/${location.latitude},${location.longitude}`
      : null);

  const handleViewMap = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card overflow-hidden transition-colors duration-200 shadow-2xs flex flex-col sm:flex-row items-stretch text-left",
        isPrimary
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 hover:border-primary"
          : "border-border/80 hover:border-primary"
      )}
    >
      {/* Side Bar Accent Indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 z-10 hidden sm:block",
          isPrimary
            ? "bg-primary"
            : theme
            ? theme.accent
            : "bg-primary/40"
        )}
      />

      {/* Left Column: Image or Icon Block (Compact Size) */}
      <div className="relative w-full sm:w-28 lg:w-32 shrink-0 bg-muted/40 overflow-hidden flex items-center justify-center min-h-[100px] sm:min-h-[110px] border-b sm:border-b-0 sm:border-r border-border/60">
        {primaryImage ? (
          <div className="w-full h-full relative overflow-hidden min-h-[100px]">
            <SmartImage
              src={primaryImage}
              alt={location.label || "Location image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 128px"
            />
            {images.length > 1 && (
              <Badge className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-background/90 text-foreground backdrop-blur-md border border-border/60 gap-0.5 px-1 py-0">
                <ImageIcon className="h-2.5 w-2.5" />
                +{images.length - 1}
              </Badge>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-muted/60 via-muted/30 to-muted/80 text-center">
            <div
              className={cn(
                "p-2.5 rounded-xl border flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110",
                isPrimary
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : theme
                  ? `${theme.bg} border-border/40 ${theme.text}`
                  : "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              <LabelIcon className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Address Details & Controls */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 min-w-0">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Badge
              className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-xl border shadow-2xs flex items-center gap-1.5",
                isPrimary
                  ? "bg-primary text-primary-foreground border-primary"
                  : theme
                  ? `${theme.bg} ${theme.text} border-border/60`
                  : "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <LabelIcon className="h-3.5 w-3.5" />
              <span>{location.label || "Location"}</span>
            </Badge>
            {isPrimary && (
              <Badge
                variant="outline"
                className="h-5 px-2.5 text-[10px] font-extrabold tracking-wide bg-primary/10 hover:bg-primary/10 text-primary hover:text-primary border border-primary/40 hover:border-primary rounded-full shrink-0 flex items-center gap-1 shadow-2xs transition-colors duration-200"
              >
                <Crown className="h-3 w-3 fill-primary text-primary" />
                <span>Default</span>
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
                className="h-7 text-[11px] gap-1 rounded-xl px-2.5 font-bold border border-border/70 bg-transparent hover:bg-transparent hover:border-primary hover:text-primary cursor-pointer transition-colors"
              >
                <Star className="h-3 w-3" />
                <span>Set Default</span>
              </CustomButton>
            )}
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-7 w-7 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Edit location"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(location)}
              className="h-7 w-7 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
              title="Delete location"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </CustomButton>
          </div>
        </div>

        {/* Address Body */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-xs text-foreground font-medium leading-relaxed">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="line-clamp-2">{fullAddress || "No address specified"}</p>
          </div>

          {location.note && (
            <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-xl p-2 mt-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="line-clamp-1 italic">{location.note}</span>
            </div>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
          {hasCoordinates ? (
            <button
              type="button"
              onClick={handleViewMap}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer group/pin"
              title="View on Google Maps"
            >
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 group-hover/pin:scale-110 transition-transform" />
              <span>Google Maps</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">No GPS coordinates set</span>
          )}

          {hasCoordinates && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


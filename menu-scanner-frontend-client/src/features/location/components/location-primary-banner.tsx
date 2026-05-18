"use client";

import React from "react";
import { Star, MapPin, Navigation } from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import { formatLocationAddress } from "../utils/location-helpers";
import { getLabelIcon } from "../utils/location-helpers";

interface LocationPrimaryBannerProps {
  location: LocationResponseModel;
}

export function LocationPrimaryBanner({ location }: LocationPrimaryBannerProps) {
  const LabelIcon = getLabelIcon(location.label);

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/70 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-700/40 overflow-hidden shadow-sm">
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 shrink-0">
          <LabelIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Primary Delivery Address
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-0.5">
            {location.label}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {formatLocationAddress(location)}
          </p>
          {location.hasCoordinates && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Navigation className="h-3 w-3 text-amber-500/70 shrink-0" />
              <p className="text-xs font-mono text-muted-foreground/70">
                {(location.latitude || 0).toFixed(5)},{" "}
                {(location.longitude || 0).toFixed(5)}
              </p>
            </div>
          )}
        </div>

        {/* Pin icon right side */}
        <div className="hidden sm:flex items-center justify-center shrink-0">
          <MapPin className="h-10 w-10 text-amber-300/60 dark:text-amber-700/40" />
        </div>
      </div>
    </div>
  );
}

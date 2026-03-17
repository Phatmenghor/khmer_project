"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Loader2,
  Maximize2,
  LocateFixed,
  AlertTriangle,
  Minimize2,
} from "lucide-react";

interface MapTabProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  fullscreenSearchInputRef: React.RefObject<HTMLInputElement>;
  isMapReady: boolean;
  isFullScreen: boolean;
  isDragging: boolean;
  isReverseGeocoding: boolean;
  mapError: string | null;
  latitude: number;
  longitude: number;
  onMyLocation: () => void;
  onToggleFullscreen: () => void;
}

function MapErrorBanner() {
  return (
    <div className="absolute top-2 left-2 right-2 z-20 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
      <div className="text-xs text-yellow-800">
        <p className="font-medium">Google Maps API key issue</p>
        <p className="mt-0.5">
          Enable Maps JavaScript API, Geocoding API &amp; Places API in your{" "}
          <span className="font-medium">Google Cloud Console</span> with billing
          active.
        </p>
      </div>
    </div>
  );
}

function CenterPin({
  size = "h-9 w-9",
  isDragging,
}: {
  size?: string;
  isDragging: boolean;
}) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
      <div
        className={`transition-transform duration-150 ${
          isDragging ? "-translate-y-3 scale-110" : "translate-y-0 scale-100"
        }`}
      >
        <MapPin
          className={`${size} text-red-500 drop-shadow-lg`}
          fill="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <div
        className={`h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${
          isDragging ? "w-3 opacity-40" : "w-2 opacity-60"
        }`}
      />
    </div>
  );
}

function CoordsBadge({
  latitude,
  longitude,
  isReverseGeocoding,
  className = "",
}: {
  latitude: number;
  longitude: number;
  isReverseGeocoding: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
      <span className="font-mono">
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </span>
      {isReverseGeocoding && (
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
      )}
    </div>
  );
}

export function LocationMapTab({
  mapContainerRef,
  searchInputRef,
  fullscreenSearchInputRef,
  isMapReady,
  isFullScreen,
  isDragging,
  isReverseGeocoding,
  mapError,
  latitude,
  longitude,
  onMyLocation,
  onToggleFullscreen,
}: MapTabProps) {
  const hasCoords = latitude !== 0 || longitude !== 0;

  return (
    <>
      {/* ── Fullscreen controls overlay (rendered on top of fixed map) ── */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[201] flex flex-col pointer-events-none">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-sm pointer-events-auto shrink-0">
            <h2 className="text-base font-semibold">Select Location on Map</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMyLocation}
              >
                <LocateFixed className="h-4 w-4 mr-1" />
                My Location
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onToggleFullscreen}
              >
                <Minimize2 className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          </div>

          {/* Fullscreen search */}
          <div className="px-4 py-2 border-b bg-background/95 backdrop-blur-sm pointer-events-auto shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={fullscreenSearchInputRef}
                type="text"
                placeholder="Search for a place..."
                className="pl-10"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Coords badge at bottom */}
          <div className="flex-1 relative">
            <CenterPin size="h-10 w-10" isDragging={isDragging} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg pointer-events-auto">
              <CoordsBadge
                latitude={latitude}
                longitude={longitude}
                isReverseGeocoding={isReverseGeocoding}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Normal map view (search + controls) ── */}
      <div className="space-y-3">
        {!isFullScreen && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a place..."
                className="pl-10"
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onMyLocation}
              title="Use my location"
            >
              <LocateFixed className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleFullscreen}
              title="Fullscreen map"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/*
          Map container — always rendered so Google Maps ref stays valid.
          When fullscreen: fixed inset-0 z-[200] (behind the controls overlay).
          When normal: relative, rounded border.
        */}
        <div
          className={`relative ${
            isFullScreen
              ? "fixed inset-0 z-[200]"
              : "rounded-lg overflow-hidden border"
          }`}
        >
          <div
            ref={mapContainerRef}
            className={isFullScreen ? "w-full h-full" : "w-full h-[260px]"}
          />
          {!isFullScreen && <CenterPin isDragging={isDragging} />}
          {!isFullScreen && !isMapReady && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Loading map...
                </span>
              </div>
            </div>
          )}
          {!isFullScreen && mapError && <MapErrorBanner />}
        </div>

        {/* Coords bar */}
        {!isFullScreen && hasCoords && (
          <div className="bg-muted/50 px-3 py-2 rounded-md flex items-center justify-between">
            <CoordsBadge
              latitude={latitude}
              longitude={longitude}
              isReverseGeocoding={isReverseGeocoding}
              className="text-muted-foreground"
            />
            <Badge variant="secondary" className="text-xs">
              Pin dropped
            </Badge>
          </div>
        )}
      </div>
    </>
  );
}

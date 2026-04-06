"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  Navigation2,
  CheckCircle2,
} from "lucide-react";
import {
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";
import { ComboboxSelectProvince } from "@/components/shared/combobox/combobox_select_province";
import { ComboboxSelectDistrict } from "@/components/shared/combobox/combobox_select_district";
import { ComboboxSelectCommune } from "@/components/shared/combobox/combobox_select_commune";
import { ComboboxSelectVillage } from "@/components/shared/combobox/combobox_select_village";

interface LocationSelectTabProps {
  // Selected values
  selectedProvince: ProvinceResponseModel | null;
  selectedDistrict: DistrictResponseModel | null;
  selectedCommune: CommuneResponseModel | null;
  selectedVillage: VillageResponseModel | null;

  // Geocode state
  isGeocodingAddress: boolean;
  geocodedCoords: { lat: number; lng: number } | null;
  geocodeSuccess: boolean;

  // Address preview text
  addressPreview: string | null;

  // Handlers
  onProvinceChange: (province: ProvinceResponseModel | null) => void;
  onDistrictChange: (district: DistrictResponseModel | null) => void;
  onCommuneChange: (commune: CommuneResponseModel | null) => void;
  onVillageChange: (village: VillageResponseModel | null) => void;
  onGetCoordinates: () => void;
}

export function LocationSelectTab({
  selectedProvince,
  selectedDistrict,
  selectedCommune,
  selectedVillage,
  isGeocodingAddress,
  geocodedCoords,
  geocodeSuccess,
  addressPreview,
  onProvinceChange,
  onDistrictChange,
  onCommuneChange,
  onVillageChange,
  onGetCoordinates,
}: LocationSelectTabProps) {
  return (
    <div className="space-y-4">
      {/* ── Hierarchy selectors ── */}
      <div className="bg-muted/40 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Navigation2 className="h-4 w-4 text-primary shrink-0" />
          <p>Select your location hierarchy</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Province */}
          <div>
            <ComboboxSelectProvince
              dataSelect={selectedProvince}
              onChangeSelected={onProvinceChange}
              label="Province / City"
              required
            />
          </div>

          {/* District */}
          <div>
            <ComboboxSelectDistrict
              dataSelect={selectedDistrict}
              onChangeSelected={onDistrictChange}
              provinceCode={selectedProvince?.provinceCode}
              label="District / Khan"
            />
          </div>

          {/* Commune — required */}
          <div>
            <ComboboxSelectCommune
              dataSelect={selectedCommune}
              onChangeSelected={onCommuneChange}
              districtCode={selectedDistrict?.districtCode}
              label="Commune / Sangkat"
              required
            />
          </div>

          {/* Village — optional */}
          <div>
            <ComboboxSelectVillage
              dataSelect={selectedVillage}
              onChangeSelected={onVillageChange}
              communeCode={selectedCommune?.communeCode}
              label="Village / Phum"
            />
          </div>
        </div>
      </div>

      {/* ── Address preview ── */}
      {addressPreview && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary mb-1">
                Selected Address
              </p>
              <p className="text-sm text-foreground leading-relaxed break-words">
                {addressPreview}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Get coordinates ── */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="default"
          className="w-full"
          onClick={onGetCoordinates}
          disabled={!selectedProvince || isGeocodingAddress}
        >
          {isGeocodingAddress ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Coordinates...
            </>
          ) : (
            <>
              <Navigation2 className="h-4 w-4 mr-2" />
              Get Coordinates
            </>
          )}
        </Button>

        {geocodeSuccess && geocodedCoords && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                Coordinates Resolved
              </p>
              <p className="text-xs font-mono text-green-600 dark:text-green-500 mt-1">
                {geocodedCoords.lat.toFixed(6)}, {geocodedCoords.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

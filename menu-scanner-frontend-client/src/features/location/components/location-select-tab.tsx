"use client";

import React from "react";
import {
  MapPin,
  Loader2,
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
  selectedProvince: ProvinceResponseModel | null;
  selectedDistrict: DistrictResponseModel | null;
  selectedCommune: CommuneResponseModel | null;
  selectedVillage: VillageResponseModel | null;

  isGeocodingAddress: boolean;
  geocodedCoords: { lat: number; lng: number } | null;
  geocodeSuccess: boolean;

  addressPreview: string | null;

  onProvinceChange: (province: ProvinceResponseModel | null) => void;
  onDistrictChange: (district: DistrictResponseModel | null) => void;
  onCommuneChange: (commune: CommuneResponseModel | null) => void;
  onVillageChange: (village: VillageResponseModel | null) => void;
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
}: LocationSelectTabProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <ComboboxSelectProvince
            dataSelect={selectedProvince}
            onChangeSelected={onProvinceChange}
            label="Province / City"
            required
          />
        </div>

        <div>
          <ComboboxSelectDistrict
            dataSelect={selectedDistrict}
            onChangeSelected={onDistrictChange}
            provinceCode={selectedProvince?.provinceCode}
            label="District / Khan"
          />
        </div>

        <div>
          <ComboboxSelectCommune
            dataSelect={selectedCommune}
            onChangeSelected={onCommuneChange}
            districtCode={selectedDistrict?.districtCode}
            label="Commune / Sangkat"
            required
          />
        </div>

        <div>
          <ComboboxSelectVillage
            dataSelect={selectedVillage}
            onChangeSelected={onVillageChange}
            communeCode={selectedCommune?.communeCode}
            label="Village / Phum"
          />
        </div>
      </div>

      {addressPreview && (
        <div className="bg-primary/5 border border-primary/20 rounded px-3 py-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                Selected Address
                {isGeocodingAddress && <Loader2 className="h-2 w-2 animate-spin text-primary/60" />}
              </p>
              <p className="text-xs text-foreground leading-relaxed break-words">
                {addressPreview}
              </p>
            </div>
          </div>
        </div>
      )}

      {geocodeSuccess && geocodedCoords && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
          <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500 shrink-0" />
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
  );
}

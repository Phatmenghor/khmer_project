"use client";

declare global {
  interface Window {
    google?: {
      maps?: {
        Map?: unknown;
        [key: string]: unknown;
      };
    };
  }
}

import { Messages } from "@/constants/messages";
import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";

import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { SmartImage } from "@/components/shared/image/smart-image";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Map,
  ListFilter,
  Star,
  Upload,
  X,
  ImageIcon,
  LocateFixed,
  Maximize2,
  Minimize2,
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Check,
  Lock,
} from "lucide-react";

import { useLocationState } from "../store/state/location-state";
import { usePublicLocationState } from "../store/state/public-location-state";
import {
  fetchProvincesService,
  fetchDistrictsService,
  fetchCommunesService,
  fetchVillagesService,
} from "../store/thunks/public-location-thunks";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import {
  LocationResponseModel,
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";
import { LocationSelectTab } from "./location-select-tab";
import { LocationLabelPresets } from "./location-label-presets";
import { LocationPrimaryToggle } from "./location-primary-toggle";
import { MultiImageUpload } from "./multi-image-upload";


let gmapLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (gmapLoadPromise) return gmapLoadPromise;
  gmapLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.Map) { resolve(); return; }
    const existing = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => { if (window.google?.maps?.Map) { clearInterval(id); resolve(); } }, 100);
      setTimeout(() => { clearInterval(id); if (window.google?.maps?.Map) resolve(); else reject(new Error("Timeout")); }, 10000);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured")); return; }
    const callbackName = "__googleMapsReady";
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => { gmapLoadPromise = null; reject(new Error("Failed to load Google Maps")); };
    document.head.appendChild(script);
  });
  gmapLoadPromise.catch(() => { gmapLoadPromise = null; });
  return gmapLoadPromise;
}


type SelectionMode = "map" | "select";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
}


function CenterPin({ size = "h-6 w-6", isDragging }: { size?: string; isDragging: boolean }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
      <div className={`transition-transform duration-150 ${isDragging ? "-translate-y-2 scale-110" : ""}`}>
        <MapPin className={`${size} text-red-500 drop-shadow-lg`} fill="currentColor" strokeWidth={1.5} />
      </div>
      <div className={`h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${isDragging ? "w-2 opacity-40" : "w-1 opacity-60"}`} />
    </div>
  );
}





export default function LocationModal({ isOpen, onClose, editData, initialCoords }: LocationModalProps) {

  useEffect(() => {
  }, [isOpen, editData]);

  const isCreate = !editData;
  const { locations, create, update, operations, error: reduxError, clearError } = useLocationState();
  const {
    selectedProvince, selectedDistrict, selectedCommune,
    selectProvince, selectDistrict, selectCommune,
    reset: resetPublicLocation,
    dispatch,
  } = usePublicLocationState();

  const { isCreating, isUpdating } = operations;
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const isSubmitting = isLocalSubmitting || (isCreate ? isCreating : isUpdating);

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("map");


  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenMapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const fullscreenMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const fullscreenSearchContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenAutocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<typeof setValue>(null!);
  const dropdownInitRef = useRef(false);
  const tabHeaderRef = useRef<HTMLDivElement>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFullScreenMapReady, setIsFullScreenMapReady] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedVillage, setSelectedVillage] = useState<VillageResponseModel | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors, isDirty } } = useForm<LocationFormData>({
    resolver: zodResolver(createLocationSchema) as any,
    defaultValues: {
      label: "", latitude: 0, longitude: 0,
      houseNumber: "", streetNumber: "", village: "", commune: "",
      district: "", province: "", country: "", note: "",
      isPrimary: false, locationImages: [],
    },
    mode: "onChange",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "locationImages" });
  setValueRef.current = setValue;
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const isPrimaryValue = watch("isPrimary");
  const hasCoords = latitude !== 0 || longitude !== 0;

  const addressPreview = useMemo(() => {
    const parts = [watch("houseNumber"), watch("streetNumber"), watch("village"), watch("commune"), watch("district"), watch("province")].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [watch("houseNumber"), watch("streetNumber"), watch("village"), watch("commune"), watch("district"), watch("province")]);


  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      reset({
        label: editData.label ?? "", latitude: editData.latitude ?? 0, longitude: editData.longitude ?? 0,
        houseNumber: editData.houseNumber ?? "", streetNumber: editData.streetNumber ?? "",
        village: editData.village ?? "", commune: editData.commune ?? "",
        district: editData.district ?? "", province: editData.province ?? "",
        country: editData.country ?? "", note: editData.note ?? "",
        isPrimary: editData.isPrimary || editData.isDefault || false,
        locationImages: editData.locationImages ?? [],
      });
    } else {
      const autoPrimary = locations.length === 0;
      reset({ label: "", latitude: 0, longitude: 0, houseNumber: "", streetNumber: "", village: "", commune: "", district: "", province: "", country: "", note: "", isPrimary: autoPrimary, locationImages: [] });
    }
    clearError();
  }, [isOpen, editData, reset, clearError, locations.length]);


  useEffect(() => {
    if (!isOpen) {
      setIsMapReady(false);
      setIsFullScreen(false);
      setMapError(null);
      dropdownInitRef.current = false;

      googleMapRef.current = null;
      geocoderRef.current = null;
      fullscreenAutocompleteRef.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleMapsScript();
        if (!cancelled) setIsMapReady(true);
      } catch (err: unknown) {
        if (!cancelled) setMapError((err as { message?: string })?.message ?? "Failed to load map");
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Pre-populate dropdowns when editing an existing location
  useEffect(() => {
    if (!isOpen || isCreate || dropdownInitRef.current) return;
    dropdownInitRef.current = true;

    const initDropdowns = async () => {
      try {
        if (!editData?.province) return;

        const provRes = await dispatch(fetchProvincesService({ search: editData.province, pageNo: 1, pageSize: 20 })).unwrap();
        const province = provRes?.content?.find((p) => p.provinceEn === editData.province);
        if (!province) return;
        selectProvince(province);

        if (!editData.district) return;
        const distRes = await dispatch(fetchDistrictsService({ search: editData.district, provinceCode: province.provinceCode, pageNo: 1, pageSize: 20 })).unwrap();
        const district = distRes?.content?.find((d) => d.districtEn === editData.district);
        if (!district) return;
        selectDistrict(district);

        if (!editData.commune) return;
        const commRes = await dispatch(fetchCommunesService({ search: editData.commune, districtCode: district.districtCode, pageNo: 1, pageSize: 20 })).unwrap();
        const commune = commRes?.content?.find((c) => c.communeEn === editData.commune);
        if (!commune) return;
        selectCommune(commune);

        if (!editData.village) return;
        const villRes = await dispatch(fetchVillagesService({ search: editData.village, communeCode: commune.communeCode, pageNo: 1, pageSize: 20 })).unwrap();
        const village = villRes?.content?.find((v) => v.villageEn === editData.village);
        if (village) setSelectedVillage(village);
      } catch {
        // silently fail — user can re-select manually
      }
    };

    initDropdowns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isCreate]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setIsReverseGeocoding(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      setIsReverseGeocoding(false);
      if (status !== "OK" || !results?.length) return;

      const sv = setValueRef.current;
      sv("latitude", lat, { shouldDirty: true });
      sv("longitude", lng, { shouldDirty: true });

      let houseNumber = "";
      let streetNumber = "";
      let village = "";
      let commune = "";
      let district = "";
      let province = "";
      let country = "";
      let poiName = "";

      // Iterate through all geocode results to ensure full administrative hierarchy is captured
      for (const result of results) {
        const comps = result.address_components || [];
        for (const comp of comps) {
          const t = comp.types;
          const name = comp.long_name || comp.short_name || "";
          if (!name) continue;

          if (t.includes("street_number")) {
            if (!houseNumber) houseNumber = name;
          } else if (t.includes("subpremise") || t.includes("premise") || t.includes("building")) {
            if (!houseNumber) houseNumber = name;
          } else if (t.includes("establishment") || t.includes("point_of_interest")) {
            if (!poiName) poiName = name;
          } else if (t.includes("route")) {
            if (!streetNumber) streetNumber = name;
          } else if (t.includes("sublocality_level_2") || t.includes("neighborhood")) {
            if (!village) village = name;
          } else if (t.includes("sublocality_level_1") || t.includes("sublocality") || t.includes("administrative_area_level_3")) {
            if (!commune) commune = name;
          } else if (t.includes("locality")) {
            if (!commune && name.toLowerCase() !== province.toLowerCase()) {
              commune = name;
            }
          } else if (t.includes("administrative_area_level_2")) {
            if (!district) district = name;
          } else if (t.includes("administrative_area_level_1")) {
            if (!province) province = name;
            if (commune && commune.toLowerCase() === province.toLowerCase()) {
              commune = "";
            }
          } else if (t.includes("country")) {
            if (!country) country = name;
          }
        }
      }

      // If house number is empty, fallback to landmark / establishment name
      if (!houseNumber && poiName) {
        houseNumber = poiName;
      }

      // Regex fallback from formatted_address for any missing hierarchy (e.g. Sangkat / Khan)
      const formattedAddress = results[0]?.formatted_address || "";
      if (formattedAddress) {
        const parts = formattedAddress.split(",").map((s: string) => s.trim()).filter(Boolean);

        if (!district) {
          const foundDistrict = parts.find((p: string) => /khan|district|krong/i.test(p));
          if (foundDistrict) district = foundDistrict;
        }

        if (!commune) {
          const foundCommune = parts.find((p: string) => /sangkat|commune/i.test(p));
          if (foundCommune) commune = foundCommune;
        }

        if (!village) {
          const foundVillage = parts.find((p: string) => /phum|village/i.test(p));
          if (foundVillage) village = foundVillage;
        }

        if (!province && parts.length >= 2) {
          province = parts[parts.length - 2].replace(/\d+/g, "").trim();
        }

        if (!country && parts.length >= 1) {
          country = parts[parts.length - 1].replace(/\d+/g, "").trim();
        }
      }

      // Clean up: Ensure commune is not set to Province name
      if (commune && province && commune.toLowerCase() === province.toLowerCase()) {
        commune = "";
      }

      sv("houseNumber", houseNumber, { shouldDirty: true });
      sv("streetNumber", streetNumber, { shouldDirty: true });
      sv("village", village, { shouldDirty: true });
      sv("commune", commune, { shouldDirty: true });
      sv("district", district, { shouldDirty: true });
      sv("province", province, { shouldDirty: true });
      sv("country", country, { shouldDirty: true });
    });
  }, []);

  const setupAutocomplete = useCallback((container: HTMLDivElement, ref: React.MutableRefObject<google.maps.places.PlaceAutocompleteElement | null>, mapInstance: google.maps.Map) => {
    if (!mapInstance || !google.maps.places?.PlaceAutocompleteElement) return;
    if (ref.current) ref.current.remove();
    container.innerHTML = "";

    // @types/google.maps doesn't yet model PlaceAutocompleteElement's
    // `types` option or the `gmp-placeselect` event payload. We narrow
    // through unknown rather than reach for any.
    const ac = new google.maps.places.PlaceAutocompleteElement(
      { types: ["geocode", "establishment"] } as unknown as google.maps.places.PlaceAutocompleteElementOptions
    );
    container.appendChild(ac as unknown as Node);

    mapInstance.addListener("bounds_changed", () => {
      const bounds = mapInstance.getBounds();
      if (bounds) (ac as unknown as { locationBias: google.maps.LatLngBounds }).locationBias = bounds;
    });

    ac.addEventListener("gmp-placeselect", async (event: Event) => {
      // @types/google.maps lags the new Place class — narrow shape locally.
      type PlaceWithGeometry = google.maps.places.Place & {
        geometry?: { location?: google.maps.LatLng };
      };
      const place = (event as unknown as { place?: PlaceWithGeometry }).place;
      if (!place) return;
      await place.fetchFields({ fields: ["geometry"] });
      const location = place.geometry?.location;
      if (location) {
        mapInstance.setCenter(location);
        mapInstance.setZoom(17);
        const lat = location.lat();
        const lng = location.lng();
        setValueRef.current("latitude", lat, { shouldDirty: true });
        setValueRef.current("longitude", lng, { shouldDirty: true });
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
      }
    });

    ref.current = ac;
  }, [reverseGeocode]);

  const initMap = useCallback((container: HTMLDivElement, lat: number, lng: number) => {
    const map = new google.maps.Map(container, {
      center: { lat, lng }, zoom: 15,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      zoomControl: false,
      gestureHandling: "none",
      disableDefaultUI: true,
      clickableIcons: false,
      keyboardShortcuts: false,
    });
    googleMapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    setValueRef.current("latitude", lat, { shouldDirty: true });
    setValueRef.current("longitude", lng, { shouldDirty: true });
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current) return;
    if (googleMapRef.current) return;
    const lat = editData?.latitude || initialCoords?.lat || 11.5564;
    const lng = editData?.longitude || initialCoords?.lng || 104.9282;
    initMap(mapContainerRef.current, lat, lng);
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, [isMapReady]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !isMapReady) return;

    if (isFullScreen && fullscreenMapContainerRef.current) {
      setIsFullScreenMapReady(false);

      const center = map.getCenter();
      const zoom = map.getZoom();


      const fullscreenMap = new google.maps.Map(fullscreenMapContainerRef.current, {
        center: center || { lat: 11.5564, lng: 104.9282 },
        zoom: zoom || 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
      });


      fullscreenMap.addListener("dragstart", () => setIsDragging(true));
      fullscreenMap.addListener("dragend", () => {
        const c = fullscreenMap.getCenter();
        if (!c) return;
        const lat = c.lat();
        const lng = c.lng();
        setValueRef.current("latitude", lat, { shouldDirty: true });
        setValueRef.current("longitude", lng, { shouldDirty: true });
        setIsDragging(false);
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 400);
      });

      fullscreenMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const clickLat = e.latLng.lat();
        const clickLng = e.latLng.lng();
        fullscreenMap.panTo({ lat: clickLat, lng: clickLng });
        setValueRef.current("latitude", clickLat, { shouldDirty: true });
        setValueRef.current("longitude", clickLng, { shouldDirty: true });
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(clickLat, clickLng), 200);
      });

      fullscreenMapRef.current = fullscreenMap;


      const t = setTimeout(() => {
        google.maps.event.trigger(fullscreenMap, "resize");
        if (center) fullscreenMap.setCenter(center);
        setIsFullScreenMapReady(true);
        if (fullscreenSearchContainerRef.current && google.maps.places?.PlaceAutocompleteElement) {
          setupAutocomplete(fullscreenSearchContainerRef.current, fullscreenAutocompleteRef, fullscreenMap);
        }
      }, 100);

      return () => clearTimeout(t);
    } else if (!isFullScreen) {
      setIsFullScreenMapReady(false);

      fullscreenMapRef.current = null;


      const t = setTimeout(() => {
        if (mapContainerRef.current) {

          mapContainerRef.current.innerHTML = "";

          const currentLat = latitude || map.getCenter()?.lat() || 11.5564;
          const currentLng = longitude || map.getCenter()?.lng() || 104.9282;

          googleMapRef.current = null;
          initMap(mapContainerRef.current, currentLat, currentLng);
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isFullScreen, isMapReady, setupAutocomplete, reverseGeocode]);


  useEffect(() => {
    if (selectionMode === "map" && googleMapRef.current) {
      const t = setTimeout(() => {
        google.maps.event.trigger(googleMapRef.current!, "resize");
        const center = googleMapRef.current?.getCenter();
        if (center) googleMapRef.current?.setCenter(center);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [selectionMode]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) { showToast.error(Messages.location.geolocationUnsupported); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = googleMapRef.current;
        if (map) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.panTo({ lat, lng });
          map.setZoom(17);
          setValueRef.current("latitude", lat, { shouldDirty: true });
          setValueRef.current("longitude", lng, { shouldDirty: true });
          if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
          geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
        }
      },
      () => showToast.error(Messages.location.geolocationFailed)
    );
  }, [reverseGeocode]);

  const handleGetCoordinates = useCallback(async () => {
    const parts = [watch("houseNumber"), watch("streetNumber"), watch("village"), watch("commune"), watch("district"), watch("province")].filter(Boolean);
    if (!parts.length) return;
    setIsGeocodingAddress(true); setGeocodeSuccess(false);
    try {
      await loadGoogleMapsScript();
      new google.maps.Geocoder().geocode({ address: parts.join(", ") }, (results: any, status: any) => {
        setIsGeocodingAddress(false);
        if (status === "OK" && results?.length) {
          const loc = results[0].geometry.location;
          const lat = loc.lat(); const lng = loc.lng();
          setValue("latitude", lat, { shouldDirty: true }); setValue("longitude", lng, { shouldDirty: true });
          setGeocodedCoords({ lat, lng }); setGeocodeSuccess(true);
        } else { showToast.error(Messages.location.coordinatesFailed); }
      });
    } catch (err: unknown) { setIsGeocodingAddress(false); showToast.error((err as { message?: string })?.message ?? Messages.location.geocodeFailed); }
  }, [watch, setValue]);

  const handleProvinceChange = useCallback((province: ProvinceResponseModel | null) => {
    if (!province) return;
    selectProvince(province); selectDistrict(null); selectCommune(null);
    setSelectedVillage(null); setGeocodeSuccess(false); setGeocodedCoords(null);
    setValue("province", province.provinceEn, { shouldDirty: true });
    setValue("district", "", { shouldDirty: true }); setValue("commune", "", { shouldDirty: true });
    setValue("village", "", { shouldDirty: true }); setValue("latitude", 0, { shouldDirty: true }); setValue("longitude", 0, { shouldDirty: true });
    handleGetCoordinates();
  }, [selectProvince, selectDistrict, selectCommune, setValue, handleGetCoordinates]);

  const handleDistrictChange = useCallback((district: DistrictResponseModel | null) => {
    if (!district) return;
    selectDistrict(district); selectCommune(null);
    setSelectedVillage(null); setGeocodeSuccess(false); setGeocodedCoords(null);
    setValue("district", district.districtEn, { shouldDirty: true });
    setValue("commune", "", { shouldDirty: true }); setValue("village", "", { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true }); setValue("longitude", 0, { shouldDirty: true });
    handleGetCoordinates();
  }, [selectDistrict, selectCommune, setValue, handleGetCoordinates]);

  const handleCommuneChange = useCallback((commune: CommuneResponseModel | null) => {
    if (!commune) return;
    selectCommune(commune); setSelectedVillage(null); setGeocodeSuccess(false); setGeocodedCoords(null);
    setValue("commune", commune.communeEn, { shouldDirty: true });
    setValue("village", "", { shouldDirty: true }); setValue("latitude", 0, { shouldDirty: true }); setValue("longitude", 0, { shouldDirty: true });
    handleGetCoordinates();
  }, [selectCommune, setValue, handleGetCoordinates]);

  const handleVillageChange = useCallback((village: VillageResponseModel | null) => {
    setSelectedVillage(village); setGeocodeSuccess(false); setGeocodedCoords(null);
    setValue("village", village?.villageEn ?? "", { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true }); setValue("longitude", 0, { shouldDirty: true });
    handleGetCoordinates();
  }, [setValue, handleGetCoordinates]);

  const onSubmit = async (data: LocationFormData) => {
    if (isSubmitting) return;
    setIsLocalSubmitting(true);
    try {
      const processedImages = await Promise.all(
        (data.locationImages ?? []).map(async (img) => {
          let imageUrl = img.imageUrl;
          if (imageUrl && isBase64Image(imageUrl)) {
            try {
              imageUrl = await uploadImage(imageUrl);
            } catch (error) {
              return null;
            }
          }
          return { imageUrl };
        })
      );

      const validImages = processedImages.filter((img) => img !== null);

      const payload = {
        label: data.label, latitude: data.latitude, longitude: data.longitude,
        houseNumber: data.houseNumber || "", streetNumber: data.streetNumber || "",
        village: data.village || "", commune: data.commune || "",
        district: data.district || "", province: data.province || "",
        country: data.country || "", note: data.note || "",
        isPrimary: data.isPrimary, locationImages: validImages,
      };
      if (isCreate) { await create(payload).unwrap(); showToast.success(Messages.location.created); }
      else { await update({ locationId: editData!.id, locationData: payload }).unwrap(); showToast.success(Messages.location.updated); }
      handleClose();
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message ?? `Failed to ${isCreate ? "create" : "update"} location`);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    setIsFullScreen(false); setSelectionMode("map"); setSelectedVillage(null);
    setGeocodedCoords(null); setGeocodeSuccess(false); setIsLocalSubmitting(false);
    dropdownInitRef.current = false;
    resetPublicLocation(); reset(); clearError(); onClose();
  }, [reset, clearError, onClose, resetPublicLocation]);

  const handleModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "select") {
      setValue("latitude", 0, { shouldDirty: true }); setValue("longitude", 0, { shouldDirty: true });
      setGeocodeSuccess(false); setGeocodedCoords(null);
    }
    setTimeout(() => {
      tabHeaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };


  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[250] flex flex-col bg-background select-none animate-in fade-in duration-300">
        {/* Sleek Floating Glass Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card/90 backdrop-blur-xl shrink-0 gap-3 shadow-md z-30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shrink-0 shadow-md ring-2 ring-primary/20">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground block truncate">Interactive Map Location Selector</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              {hasCoords ? (
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                  {isReverseGeocoding && <Loader2 className="inline-block h-3 w-3 ml-1 animate-spin text-primary" />}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Drag pin to target location</span>
              )}
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMyLocation}
              className="gap-1.5 h-9 rounded-xl border-border/80 font-semibold shadow-2xs hover:border-primary/40 cursor-pointer"
            >
              <LocateFixed className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">My Location</span>
            </CustomButton>

            <CustomButton
              type="button"
              variant="default"
              size="sm"
              onClick={() => { setIsFullScreen(false); }}
              className="gap-1.5 h-9 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirm & Done</span>
            </CustomButton>

            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              title="Close Fullscreen Map"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Embedded Search Autocomplete Bar */}
        <div className="px-4 py-2.5 border-b border-border/60 bg-muted/40 backdrop-blur-md shrink-0 shadow-2xs">
          <div className="max-w-2xl mx-auto relative">
            <div ref={fullscreenSearchContainerRef} className="gmap-autocomplete-container w-full" />
          </div>
        </div>

        {/* Main Map Viewport */}
        <div className="flex-1 relative bg-muted/30">
          {!isFullScreenMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-20">
              <div className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-card border border-border/80 shadow-2xl">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs font-semibold text-foreground">Loading Full Map Viewport…</span>
              </div>
            </div>
          )}

          {/* Center Target Pin */}
          <CenterPin isDragging={isDragging} size="h-9 w-9" />

          {/* Google Map Container */}
          <div ref={fullscreenMapContainerRef} className="w-full h-full" />

          {/* Floating Bottom Location Address Card */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-[24px] p-4 sm:p-5 shadow-2xl w-[92%] max-w-xl z-20 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5 shadow-2xs">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-primary">Selected Address</span>
                  {isReverseGeocoding ? (
                    <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary bg-primary/5">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> Resolving…
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-none">
                      GPS LOCKED
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed break-words line-clamp-2">
                  {addressPreview || "Drag map or use search bar above to pinpoint address..."}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1.5 flex items-center gap-1.5">
                  <span>Lat: {latitude.toFixed(6)}</span>
                  <span>•</span>
                  <span>Lng: {longitude.toFixed(6)}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center gap-2">
              <CustomButton
                type="button"
                variant="default"
                size="default"
                onClick={() => setIsFullScreen(false)}
                className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Use This Location</span>
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      className="max-h-[92vh] gap-0 p-0 flex flex-col overflow-hidden rounded-[24px]"
      disableScrollWrapper={true}
    >
      <FormHeader
        title={isCreate ? "Add Location" : "Edit Location"}
        description={isCreate ? "Pin on map or select from address list" : "Update your location details"}
        isCreate={isCreate}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <FormBody contentClassName="space-y-4 p-4 sm:p-5">
            {}
            {reduxError && (
              <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive font-medium">
                {reduxError}
              </div>
            )}

            {/* Sticky Modern Segmented Control Header */}
            <div ref={tabHeaderRef} className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-2 pt-1 border-b border-border/40 -mx-4 px-4 sm:-mx-5 sm:px-5">
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/60 dark:bg-muted/30 border border-border/80 shadow-2xs gap-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("map")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
                    selectionMode === "map"
                      ? "bg-card text-foreground shadow-sm border border-border/80 scale-[1.01]"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                  )}
                >
                  <div className={cn("p-1 rounded-lg transition-colors", selectionMode === "map" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-none">Pin on Map</span>
                    <span className="text-[10px] text-muted-foreground font-normal mt-0.5">Interactive GPS</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("select")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
                    selectionMode === "select"
                      ? "bg-card text-foreground shadow-sm border border-border/80 scale-[1.01]"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                  )}
                >
                  <div className={cn("p-1 rounded-lg transition-colors", selectionMode === "select" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <ListFilter className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-none">Address List</span>
                    <span className="text-[10px] text-muted-foreground font-normal mt-0.5">Select Dropdowns</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Map Mode Content */}
            <div className={cn(selectionMode !== "map" && "hidden")}>
              <div className="space-y-3">
                <div className="relative h-56 sm:h-64 rounded-[22px] overflow-hidden border border-border/80 shadow-sm bg-muted ring-1 ring-primary/10 group">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  {!isMapReady && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/60 backdrop-blur-xs">
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card/80 border border-border/60 shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Loading interactive map…</span>
                      </div>
                    </div>
                  )}
                  {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-amber-50/90 dark:bg-amber-950/90">
                      <div className="text-center p-3 rounded-2xl bg-card border border-amber-200 shadow-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Map unavailable</p>
                      </div>
                    </div>
                  )}

                  {/* Expand map button */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={() => setIsFullScreen(true)}
                      className="bg-card/90 hover:bg-card text-foreground border border-border/80 shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Maximize2 className="h-3 w-3 text-primary" />
                      <span>Expand Map</span>
                    </button>
                  </div>

                  <CenterPin isDragging={isDragging} size="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  {hasCoords ? (
                    <div className="flex-1 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs font-mono text-emerald-700 dark:text-emerald-300 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="flex-1 truncate">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border-none px-2 py-0.5">GPS SET</Badge>
                    </div>
                  ) : (
                    <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Drag map to set position or click 'Use My Location'</span>
                    </div>
                  )}

                  <CustomButton type="button" variant="outline" onClick={handleMyLocation} className="gap-1.5 h-9 rounded-xl border-border/80 shrink-0 font-medium" disabled={isSubmitting}>
                    <LocateFixed className="h-3.5 w-3.5 text-primary" />
                    <span>My Location</span>
                  </CustomButton>
                </div>
              </div>
            </div>

            {}
            {selectionMode === "select" && (
              <LocationSelectTab
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                selectedCommune={selectedCommune}
                selectedVillage={selectedVillage}
                isGeocodingAddress={isGeocodingAddress}
                geocodedCoords={geocodedCoords}
                geocodeSuccess={geocodeSuccess}
                addressPreview={addressPreview}
                onProvinceChange={handleProvinceChange}
                onDistrictChange={handleDistrictChange}
                onCommuneChange={handleCommuneChange}
                onVillageChange={handleVillageChange}
              />
            )}

            {/* Address Details & Custom Form Fields */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div>
                <LocationLabelPresets
                  currentValue={watch("label")}
                  onSelect={(preset) => setValue("label", preset, { shouldDirty: true, shouldValidate: true })}
                  disabled={isSubmitting}
                />
                <TextField control={control} name="label" label="Location Label" placeholder="Enter location label (e.g. Home, Work, Office)" required disabled={isSubmitting} error={errors.label} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField control={control} name="houseNumber" label="House / Building Number" placeholder="Enter house or building number" disabled={isSubmitting} error={errors.houseNumber} />
                <TextField control={control} name="streetNumber" label="Street Name or Number" placeholder="Enter street name or number" disabled={isSubmitting} error={errors.streetNumber} />
                {selectionMode === "map" && (
                  <>
                    <TextField control={control} name="village" label="Village / Phum" placeholder="Enter village or phum name" disabled={isSubmitting} error={errors.village} />
                    <TextField control={control} name="commune" label="Commune / Sangkat" placeholder="Enter commune or sangkat name" required disabled={isSubmitting} error={errors.commune} />
                    <TextField control={control} name="district" label="District / Khan" placeholder="Enter district or khan name" disabled={isSubmitting} error={errors.district} />
                    <TextField control={control} name="province" label="Province / City" placeholder="Enter province or city name" required disabled={isSubmitting} error={errors.province} />
                  </>
                )}
              </div>

              <TextareaField control={control} name="note" label="Delivery Instructions & Notes" placeholder="Enter delivery instructions or notes (e.g. Leave at front door, call upon arrival...)" rows={2} disabled={isSubmitting} error={errors.note} />

              {/* Primary Location Selector Card */}
              <LocationPrimaryToggle
                isPrimary={isPrimaryValue}
                onToggle={() => setValue("isPrimary", !isPrimaryValue, { shouldDirty: true })}
                disabled={isSubmitting}
              />

              {/* Location Image Attachments */}
              <MultiImageUpload
                images={imageFields.map((f: { id: string; imageUrl: string }) => ({ imageUrl: f.imageUrl }))}
                onAdd={(url) => appendImage({ imageUrl: url })}
                onRemove={(idx) => removeImage(idx)}
                disabled={isSubmitting}
              />
            </div>
          </FormBody>

          <FormFooter isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createMessage="Creating location…" updateMessage="Updating location…">
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createText="Add Location" updateText="Update" submittingCreateText="Creating…" submittingUpdateText="Updating…" />
          </FormFooter>
        </form>
    </CustomModal>
  );
}

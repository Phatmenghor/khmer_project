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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";

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


interface MultiImageUploadProps {
  images: { imageUrl: string }[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  disabled?: boolean;
}

function MultiImageUpload({ images, onAdd, onRemove, disabled }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const MAX_IMAGES = 5;
  const canAddMore = images.length < MAX_IMAGES;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (images.length >= MAX_IMAGES) {
        showToast.warning(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === "string") onAdd(reader.result); };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1">
      {lightbox && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl" />
          <CustomButton variant="unstyled" size="unstyled" type="button" onClick={() => setLightbox(null)} className="absolute top-3 right-3 rounded-full bg-white/20 text-white p-1 hover:bg-white/40 transition-colors">
            <X className="h-3 w-3" />
          </CustomButton>
        </div>
      )}

      <Label className="text-xs font-medium flex items-center gap-1">
        <ImageIcon className="h-3 w-3 text-muted-foreground" />
        Location Images
        <span className="text-muted-foreground text-xs font-normal">({images.length}/{MAX_IMAGES})</span>
      </Label>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setLightbox(img.imageUrl)}>
            <img src={img.imageUrl} alt={`Location ${idx + 1}`} className="w-full h-full object-cover" />
            {!disabled && (
              <CustomButton variant="unstyled" size="unstyled" type="button" onClick={(e) => { e.stopPropagation(); onRemove(idx); }} className="absolute top-0.5 right-0.5 rounded-full bg-destructive/90 text-white p-0.5 hover:bg-destructive transition-colors">
                <X className="h-2 w-2" />
              </CustomButton>
            )}
          </div>
        ))}
        {!disabled && canAddMore && (
          <CustomButton variant="unstyled" size="unstyled" type="button" onClick={() => inputRef.current?.click()} className="aspect-square rounded border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-primary">
            <Upload className="h-2.5 w-2.5" />
            <span className="text-[10px] font-medium">Add</span>
          </CustomButton>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}


export default function LocationModal({ isOpen, onClose, editData, initialCoords }: LocationModalProps) {

  useEffect(() => {
  }, [isOpen, editData]);

  const isCreate = !editData;
  const { create, update, operations, error: reduxError, clearError } = useLocationState();
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
      reset({ label: "", latitude: 0, longitude: 0, houseNumber: "", streetNumber: "", village: "", commune: "", district: "", province: "", country: "", note: "", isPrimary: false, locationImages: [] });
    }
    clearError();
  }, [isOpen, editData, reset, clearError]);


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
      const comps = results[0].address_components || [];
      let streetNumber = "", village = "", commune = "", district = "", province = "", country = "";
      for (const comp of comps) {
        const t = comp.types;
        if (t.includes("street_number")) streetNumber = comp.long_name;
        else if (t.includes("route")) streetNumber = streetNumber ? `${streetNumber} ${comp.long_name}` : comp.long_name;
        else if (t.includes("sublocality_level_1") || t.includes("sublocality")) village = comp.long_name;
        else if (t.includes("locality")) commune = comp.long_name;
        else if (t.includes("administrative_area_level_2")) district = comp.long_name;
        else if (t.includes("administrative_area_level_1")) province = comp.long_name;
        else if (t.includes("country")) country = comp.long_name;
      }
      const sv = setValueRef.current;
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
    });
    googleMapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    map.addListener("dragstart", () => setIsDragging(true));
    map.addListener("dragend", () => {
      const center = map.getCenter();
      if (!center) return;
      const lat = center.lat(); const lng = center.lng();
      setValueRef.current("latitude", lat, { shouldDirty: true });
      setValueRef.current("longitude", lng, { shouldDirty: true });
      setIsDragging(false);
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 400);
    });

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
  };


  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[201] flex flex-col bg-white">
        {}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-background shrink-0 gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-primary/10 shrink-0">
              <MapPin className="h-3 w-3 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold block">Select on Map</span>
              {hasCoords && (
                <span className="text-xs font-mono text-muted-foreground">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  {isReverseGeocoding && <Loader2 className="inline-block h-2 w-2 ml-1 animate-spin" />}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <CustomButton type="button" variant="outline" size="sm" onClick={handleMyLocation} className="gap-1 h-6">
              <LocateFixed className="h-3 w-3" />
              <span className="hidden sm:inline">My Location</span>
            </CustomButton>
            <CustomButton type="button" variant="default" size="sm" onClick={() => { setIsFullScreen(false); }} className="gap-1 h-6">
              <Minimize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Done</span>
            </CustomButton>
          </div>
        </div>

        {}
        <div className="px-3 py-2 border-b bg-background/95 backdrop-blur shrink-0">
          <div ref={fullscreenSearchContainerRef} className="gmap-autocomplete-container w-full" />
        </div>

        {}
        <div className="flex-1 relative bg-gray-100">
          {!isFullScreenMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading map…</span>
              </div>
            </div>
          )}
          <CenterPin isDragging={isDragging} size="h-7 w-7" />
          <div ref={fullscreenMapContainerRef} className="w-full h-full bg-white" />
          {}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded px-4 py-3 shadow-lg w-[90%] max-w-2xl">
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                {addressPreview && (
                  <p className="text-xs font-semibold text-foreground leading-relaxed break-words">
                    {addressPreview}
                  </p>
                )}
                <p className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-1">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  {isReverseGeocoding && <Loader2 className="h-2 w-2 animate-spin shrink-0" />}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col w-full sm:max-w-2xl lg:max-w-4xl max-h-[95vh] rounded"
        onInteractOutside={(e) => { const t = e.target as HTMLElement; if (t.closest(".pac-container") || t.closest("gmp-placeautocomplete")) e.preventDefault(); }}
        onPointerDownOutside={(e) => { const t = e.target as HTMLElement; if (t.closest(".pac-container") || t.closest("gmp-placeautocomplete")) e.preventDefault(); }}
      >
        <FormHeader
          title={isCreate ? "Add Location" : "Edit Location"}
          description={isCreate ? "Pin on map or select from address list" : "Update your location details"}
          isCreate={isCreate}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-visible">
          <FormBody contentClassName="space-y-3">
            {}
            {reduxError && (
              <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive font-medium">
                {reduxError}
              </div>
            )}

            {}
            <div className="flex border-b -mx-4 px-4">
              {(["map", "select"] as SelectionMode[]).map((mode) => (
                <CustomButton variant="unstyled" size="unstyled"
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1 text-xs font-medium transition-all border-b-2 -mb-px rounded-t-lg",
                    selectionMode === mode
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {mode === "map" ? <><Map className="h-3 w-3" /> Map</> : <><ListFilter className="h-3 w-3" /> Select</>}
                </CustomButton>
              ))}
            </div>

            {}
            <div className={cn(selectionMode !== "map" && "hidden")}>
              <div className="space-y-2">
                <div className="relative h-44 rounded overflow-hidden border bg-muted">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  {!isMapReady && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Loading map…</span>
                      </div>
                    </div>
                  )}
                  {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-50/90">
                      <div className="text-center">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-yellow-800">Map unavailable</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 group cursor-pointer" onClick={() => setIsFullScreen(true)}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded px-2 py-1 text-xs text-foreground flex items-center gap-1 shadow-sm group-hover:shadow-md transition-all">
                      <Maximize2 className="h-2.5 w-2.5 text-primary" />
                      Click to expand
                    </div>
                  </div>
                  <CenterPin isDragging={isDragging} size="h-5 w-5" />
                </div>

                {hasCoords && (
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded px-2 py-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-xs font-mono text-green-700 dark:text-green-400 flex-1">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                    <Badge variant="secondary" className="text-xs">Set</Badge>
                  </div>
                )}

                <CustomButton type="button" variant="outline" onClick={handleMyLocation} className="w-full gap-1" disabled={isSubmitting}>
                  <LocateFixed className="h-3 w-3" />
                  Use My Location
                </CustomButton>
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

            {}
            <div className="space-y-3 pt-2 border-t">
              <TextField control={control} name="label" label="Label" placeholder="e.g., Home, Office, Shop" required disabled={isSubmitting} error={errors.label} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField control={control} name="houseNumber" label="House Number" placeholder="Enter house number" disabled={isSubmitting} error={errors.houseNumber} />
                <TextField control={control} name="streetNumber" label="Street" placeholder="Enter street" disabled={isSubmitting} error={errors.streetNumber} />
                {selectionMode === "map" && (
                  <>
                    <TextField control={control} name="village" label="Village / Sangkat" placeholder="Auto-filled" disabled={isSubmitting} error={errors.village} />
                    <TextField control={control} name="commune" label="Commune / City" placeholder="Auto-filled" required disabled={isSubmitting} error={errors.commune} />
                    <TextField control={control} name="district" label="District / Khan" placeholder="Auto-filled" disabled={isSubmitting} error={errors.district} />
                    <TextField control={control} name="province" label="Province" placeholder="Auto-filled" disabled={isSubmitting} error={errors.province} />
                  </>
                )}
              </div>

              <TextareaField control={control} name="note" label="Notes" placeholder="Delivery instructions…" rows={2} disabled={isSubmitting} error={errors.note} />

              {}
              <CustomButton variant="unstyled" size="unstyled"
                type="button"
                onClick={() => setValue("isPrimary", !isPrimaryValue, { shouldDirty: true })}
                disabled={isSubmitting}
                className={cn(
                  "w-full flex items-center gap-2 rounded border-2 p-2 text-left transition-all focus:outline-none",
                  isPrimaryValue
                    ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className={cn("p-1 rounded shrink-0", isPrimaryValue ? "bg-amber-100 dark:bg-amber-900/40" : "bg-muted")}>
                  <Star className={cn("h-3 w-3", isPrimaryValue ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold", isPrimaryValue ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
                    {isPrimaryValue ? "Primary Location" : "Set as Primary"}
                  </p>
                  <p className="text-xs text-muted-foreground">Default address for deliveries</p>
                </div>
                {isPrimaryValue && <CheckCircle2 className="h-3 w-3 text-amber-500 shrink-0" />}
              </CustomButton>

              {}
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
      </DialogContent>
    </Dialog>
  );
}

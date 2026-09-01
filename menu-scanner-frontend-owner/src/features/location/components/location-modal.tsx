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
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton, CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useDebounce } from "@/utils/debounce/debounce";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  LocateFixed,
  Maximize2,
  X,
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  Compass,
  Upload,
} from "lucide-react";

import { useLocationState } from "../store/state/location-state";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import {
  LocationResponseModel,
} from "../store/models/response/location-response";
import { LocationLabelPresets } from "./location-label-presets";
import { LocationPrimaryToggle } from "./location-primary-toggle";
import { LocationPermissionModal } from "./location-permission-modal";
import { loadGoogleMapsScript } from "../utils/google-maps-loader";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { uploadImage } from "@/services/spaces-service";







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
  const { locations, create, update, reverseGeocode: reverseGeocodeThunk, geocodeSearch: geocodeSearchThunk, operations, error: reduxError, clearError } = useLocationState();
  const { isCreating, isUpdating } = operations;
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const isSubmitting = isLocalSubmitting || (isCreate ? isCreating : isUpdating);


  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenMapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const fullscreenMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const fullscreenSearchInputRef = useRef<HTMLInputElement>(null);
  const fullscreenLegacyACRef = useRef<google.maps.places.Autocomplete | null>(null);
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
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [mapSearchText, setMapSearchText] = useState("");
  const debouncedSearchText = useDebounce(mapSearchText, 450);

  const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors, isDirty } } = useForm<LocationFormData>({
    resolver: zodResolver(createLocationSchema) as any,
    defaultValues: {
      label: "", latitude: 0, longitude: 0,
      houseNumber: "", streetNumber: "", village: "", commune: "",
      district: "", province: "", country: "Cambodia", note: "",
      isPrimary: false, locationImages: [],
    },
    mode: "onChange",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "locationImages" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFilesRef = useRef<Map<number, File>>(new Map());

  const handleMultiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const maxCount = 5;
    const currentLength = imageFields.length;
    const remainingSlots = Math.max(0, maxCount - currentLength);
    const selectedFiles = fileList.slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      showToast.error(`Maximum limit of ${maxCount} photos reached`);
      return;
    }

    selectedFiles.forEach((file, index) => {
      const blobUrl = URL.createObjectURL(file);
      const newIndex = currentLength + index;
      pendingFilesRef.current.set(newIndex, file);
      appendImage({ imageUrl: blobUrl });
    });

    if (e.target) e.target.value = "";
  };
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
      fullscreenLegacyACRef.current = null;
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



  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const data = await reverseGeocodeThunk(lat, lng).unwrap();
      const sv = setValueRef.current;
      sv("latitude", lat, { shouldDirty: true });
      sv("longitude", lng, { shouldDirty: true });

      if (data) {
        sv("houseNumber", data.houseNumber || "", { shouldDirty: true });
        sv("streetNumber", data.streetNumber || "", { shouldDirty: true });
        sv("village", data.village || "", { shouldDirty: true });
        sv("commune", data.commune || "", { shouldDirty: true });
        sv("district", data.district || "", { shouldDirty: true });
        sv("province", data.province || "", { shouldDirty: true });
        sv("country", data.country || "Cambodia", { shouldDirty: true });
      }
    } catch (err: unknown) {
      // Ignore
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [reverseGeocodeThunk]);

  /** Attach legacy Autocomplete to the real <input> ref so we can style it */
  const setupAutocomplete = useCallback((inputEl: HTMLInputElement, mapInstance: google.maps.Map) => {
    if (!inputEl || !mapInstance || !google.maps.places?.Autocomplete) return;
    if (fullscreenLegacyACRef.current) {
      google.maps.event.clearInstanceListeners(fullscreenLegacyACRef.current);
    }
    const ac = new google.maps.places.Autocomplete(inputEl, {
      types: ["geocode", "establishment"],
      fields: ["geometry", "name", "formatted_address"],
    });
    ac.bindTo("bounds", mapInstance);
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place?.name || place?.formatted_address) {
        setMapSearchText(place.name || place.formatted_address || "");
      }
      const location = place?.geometry?.location;
      if (!location) return;
      mapInstance.setCenter(location);
      mapInstance.setZoom(17);
      const lat = location.lat();
      const lng = location.lng();
      setValueRef.current("latitude", lat, { shouldDirty: true });
      setValueRef.current("longitude", lng, { shouldDirty: true });
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
    });
    fullscreenLegacyACRef.current = ac;
  }, [reverseGeocode]);

  const initMap = useCallback((container: HTMLDivElement, lat: number, lng: number) => {
    const map = new google.maps.Map(container, {
      center: { lat, lng }, zoom: 15,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      zoomControl: false,
      gestureHandling: "greedy",
      disableDefaultUI: true,
      clickableIcons: false,
      keyboardShortcuts: false,
    });
    googleMapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    setValueRef.current("latitude", lat, { shouldDirty: true });
    setValueRef.current("longitude", lng, { shouldDirty: true });
    reverseGeocode(lat, lng);

    // Wire up drag & click so the inline map is directly editable
    map.addListener("dragstart", () => setIsDragging(true));
    map.addListener("dragend", () => {
      const c = map.getCenter();
      if (!c) return;
      const newLat = c.lat();
      const newLng = c.lng();
      setValueRef.current("latitude", newLat, { shouldDirty: true });
      setValueRef.current("longitude", newLng, { shouldDirty: true });
      setIsDragging(false);
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => reverseGeocode(newLat, newLng), 400);
    });
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const clickLat = e.latLng.lat();
      const clickLng = e.latLng.lng();
      map.panTo({ lat: clickLat, lng: clickLng });
      setValueRef.current("latitude", clickLat, { shouldDirty: true });
      setValueRef.current("longitude", clickLng, { shouldDirty: true });
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => reverseGeocode(clickLat, clickLng), 200);
    });
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
        zoomControl: false,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        clickableIcons: false,
        keyboardShortcuts: false,
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
        if (fullscreenSearchInputRef.current) {
          setupAutocomplete(fullscreenSearchInputRef.current, fullscreenMap);
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
    if (isFullScreen && isFullScreenMapReady && fullscreenSearchInputRef.current && fullscreenMapRef.current) {
      setupAutocomplete(fullscreenSearchInputRef.current, fullscreenMapRef.current);
    }
  }, [isFullScreen, isFullScreenMapReady, setupAutocomplete]);



  const handleGeocodeQuery = useCallback(async (query: string) => {
    if (!query || !query.trim()) return;
    const targetMap = fullscreenMapRef.current || googleMapRef.current;
    if (!targetMap) return;

    try {
      const data = await geocodeSearchThunk(query.trim()).unwrap();
      if (data && data.latitude && data.longitude) {
        const lat = data.latitude;
        const lng = data.longitude;
        targetMap.panTo({ lat, lng });
        targetMap.setZoom(17);
        setValueRef.current("latitude", lat, { shouldDirty: true });
        setValueRef.current("longitude", lng, { shouldDirty: true });
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
      }
    } catch (err: unknown) {
      // Ignore
    }
  }, [geocodeSearchThunk, reverseGeocode]);

  useEffect(() => {
    if (debouncedSearchText && debouncedSearchText.trim().length >= 3) {
      handleGeocodeQuery(debouncedSearchText);
    }
  }, [debouncedSearchText, handleGeocodeQuery]);

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleMyLocation = useCallback(() => {
    const PHNOM_PENH = { lat: 11.5564, lng: 104.9282 };

    const setPhnomPenhFallback = () => {
      const map = fullscreenMapRef.current || googleMapRef.current;
      if (map) {
        map.panTo(PHNOM_PENH);
        map.setZoom(15);
        setValueRef.current("latitude", PHNOM_PENH.lat, { shouldDirty: true });
        setValueRef.current("longitude", PHNOM_PENH.lng, { shouldDirty: true });
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(PHNOM_PENH.lat, PHNOM_PENH.lng), 200);
      }
    };

    if (!navigator.geolocation) {
      setPhnomPenhFallback();
      showToast.error(Messages.location.geolocationUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = fullscreenMapRef.current || googleMapRef.current;
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
      (err) => {
        setPhnomPenhFallback();
        if (err.code === err.PERMISSION_DENIED) {
          setShowPermissionModal(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          showToast.error("Location position unavailable. Defaulting to Phnom Penh.");
        } else if (err.code === err.TIMEOUT) {
          showToast.error("Location request timed out. Defaulting to Phnom Penh.");
        } else {
          showToast.error(Messages.location.geolocationFailed);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  const onSubmit = async (data: LocationFormData) => {
    if (isSubmitting) return;
    setIsLocalSubmitting(true);
    try {
      const finalImages: { imageUrl: string }[] = [];
      const rawImages = data.locationImages ?? [];

      for (let i = 0; i < rawImages.length; i++) {
        const img = rawImages[i];
        if (!img) continue;
        const pendingFile = pendingFilesRef.current.get(i);
        if (pendingFile) {
          const res = await uploadImage(pendingFile, AppDefault.BUSINESS_ID);
          if (res?.url) {
            finalImages.push({ imageUrl: res.url });
          }
        } else if (img.imageUrl && !img.imageUrl.startsWith("blob:")) {
          finalImages.push({ imageUrl: img.imageUrl });
        }
      }

      const payload = {
        label: data.label, latitude: data.latitude, longitude: data.longitude,
        houseNumber: data.houseNumber || "", streetNumber: data.streetNumber || "",
        village: data.village || "", commune: data.commune || "",
        district: data.district || "", province: data.province || "",
        country: data.country?.trim() || "Cambodia", note: data.note || "",
        isPrimary: data.isPrimary, locationImages: finalImages,
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
    setIsFullScreen(false);
    setGeocodedCoords(null); setGeocodeSuccess(false); setIsLocalSubmitting(false);
    dropdownInitRef.current = false;
    pendingFilesRef.current.clear();
    reset(); clearError(); onClose();
  }, [reset, clearError, onClose]);


  if (isFullScreen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex flex-col bg-background text-foreground select-none"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* ── HEADER ── */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 bg-card border-b border-border/60 shadow-xs z-20">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground truncate">Pin Your Location</span>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              {hasCoords ? (
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                  {isReverseGeocoding && <Loader2 className="h-2.5 w-2.5 ml-0.5 animate-spin text-primary" />}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Drag or tap the map to drop your pin</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            aria-label="Close map"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── SEARCH BAR + CONFIRM BUTTON ── */}
        <div className="shrink-0 px-4 sm:px-5 py-2 bg-background border-b border-border/60 z-10 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <CustomInput
              ref={fullscreenSearchInputRef}
              value={mapSearchText}
              onChange={(e) => setMapSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGeocodeQuery(mapSearchText);
                }
              }}
              rightIcon={mapSearchText ? <X className="h-3.5 w-3.5" /> : undefined}
              onRightIconClick={mapSearchText ? () => setMapSearchText("") : undefined}
              placeholder="Search for a place or address…"
              leftIcon={<MapPin className="h-3.5 w-3.5" />}
              size="md"
              className="w-full"
              autoComplete="off"
            />
          </div>
          <CustomButton
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsFullScreen(false)}
            className="shrink-0 h-[36px] px-4 rounded-[8px] text-xs font-bold bg-primary text-primary-foreground border border-primary hover:border-primary/60 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Confirm</span>
          </CustomButton>
        </div>

        {/* ── MAP VIEWPORT (fills all remaining space) ── */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          {!isFullScreenMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-card border border-border/80 shadow-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-semibold text-foreground">Loading Map…</span>
              </div>
            </div>
          )}
          <CenterPin isDragging={isDragging} size="h-9 w-9" />
          <div ref={fullscreenMapContainerRef} className="w-full h-full" />

          {/* Floating Current Location Button on Map Canvas */}
          {/* Floating Address Pill (wraps around text only) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 max-w-[90%] sm:max-w-md pointer-events-none">
            <div className="inline-flex items-center justify-center bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl px-4 py-2 shadow-lg text-center pointer-events-auto">
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug break-words">
                {isReverseGeocoding ? (
                  <span className="text-muted-foreground flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-primary inline shrink-0" />
                    Resolving address…
                  </span>
                ) : (
                  addressPreview || "Drag map or search above to pinpoint address…"
                )}
              </p>
            </div>
          </div>

          {/* Floating Current Location Button */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              onClick={handleMyLocation}
              className="h-9 px-3 bg-card/95 hover:bg-card text-foreground border border-border/80 hover:border-primary/50 shadow-md rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LocateFixed className="h-3.5 w-3.5 text-primary" />
              <span>Current Location</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
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

            {/* Map Location Selector */}
            <div>
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
                      className="bg-card/90 hover:bg-card text-foreground border border-border/80 hover:border-primary/50 shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Maximize2 className="h-3 w-3 text-primary" />
                      <span>Expand Map</span>
                    </button>
                  </div>

                  <CenterPin isDragging={isDragging} size="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  {hasCoords ? (
                    <div className={cn(
                      "flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 text-xs font-mono shadow-2xs transition-all duration-200",
                      isReverseGeocoding
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40 text-primary"
                        : "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    )}>
                      {isReverseGeocoding ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary shrink-0 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="flex-1 truncate">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                      {isReverseGeocoding ? (
                        <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary bg-primary/5 font-bold px-2 py-0.5">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" /> Resolving…
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-transparent text-emerald-700 dark:text-emerald-300 font-bold border-none px-2 py-0.5">GPS SET</Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Drag map to set position or click 'Use My Location'</span>
                    </div>
                  )}

                  <CustomButton type="button" variant="outline" onClick={handleMyLocation} className="gap-1.5 h-9 rounded-xl border-border/80 hover:border-primary shrink-0 font-medium transition-colors" disabled={isSubmitting}>
                    <LocateFixed className="h-3.5 w-3.5 text-primary" />
                    <span>My Location</span>
                  </CustomButton>
                </div>
              </div>
            </div>

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
                <TextField control={control} name="village" label="Village / Phum" placeholder="Enter village or phum name" disabled={isSubmitting} error={errors.village} />
                <TextField control={control} name="commune" label="Commune / Sangkat" placeholder="Enter commune or sangkat name" required disabled={isSubmitting} error={errors.commune} />
                <TextField control={control} name="district" label="District / Khan" placeholder="Enter district or khan name" disabled={isSubmitting} error={errors.district} />
                <TextField control={control} name="province" label="Province / City" placeholder="Enter province or city name" required disabled={isSubmitting} error={errors.province} />
              </div>

              <TextareaField control={control} name="note" label="Delivery Instructions & Notes" placeholder="Enter delivery instructions or notes (e.g. Leave at front door, call upon arrival...)" rows={2} disabled={isSubmitting} error={errors.note} />

              {/* Primary Location Selector Card */}
              <LocationPrimaryToggle
                isPrimary={isPrimaryValue}
                onToggle={() => setValue("isPrimary", !isPrimaryValue, { shouldDirty: true })}
                disabled={isSubmitting}
              />

              {/* Location Image Attachments (0/5 max, deferred upload on submit like product modal) */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
                onChange={handleMultiFileSelect}
              />

              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Location Photos</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      ({imageFields.length}/5)
                    </span>
                  </Label>
                  {imageFields.length < 5 && (
                    <CustomButton
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 font-bold text-xs h-7 rounded-lg border-border/80 hover:border-primary shrink-0 transition-colors cursor-pointer"
                      disabled={isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 text-primary" />
                      <span>Upload Photos</span>
                    </CustomButton>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {imageFields.map((field, idx) => {
                    const imgUrl = watch(`locationImages.${idx}.imageUrl`);
                    return (
                      <div
                        key={field.id}
                        className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl border border-border/80 bg-card overflow-hidden shrink-0 group/img shadow-2xs"
                      >
                        {imgUrl ? (
                          <SmartImage
                            src={imgUrl}
                            alt={`Photo #${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 z-10 text-white bg-black/60 hover:bg-destructive h-5 w-5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          disabled={isSubmitting}
                          onClick={() => {
                            pendingFilesRef.current.delete(idx);
                            removeImage(idx);
                          }}
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}

                  {imageFields.length < 5 && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-[10px] font-bold">Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </FormBody>

          <FormFooter isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createMessage="Creating location…" updateMessage="Updating location…">
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createText="Add Location" updateText="Update" submittingCreateText="Creating…" submittingUpdateText="Updating…" />
          </FormFooter>
        </form>

      {/* Location Permission Guidance Modal */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRetry={() => {
          setShowPermissionModal(false);
          setTimeout(() => handleMyLocation(), 200);
        }}
      />
    </CustomModal>
  );
}

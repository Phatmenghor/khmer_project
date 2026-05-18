import {
  Home,
  Briefcase,
  ShoppingBag,
  Building2,
  Heart,
  MapPin,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";

const LABEL_ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  house: Home,
  office: Briefcase,
  work: Briefcase,
  shop: ShoppingBag,
  store: ShoppingBag,
  building: Building2,
  apartment: Building2,
  love: Heart,
  family: Heart,
};

/**
 * Returns a Lucide icon component based on the label string.
 * Falls back to MapPin if no keyword matches.
 */
export function getLabelIcon(label?: string | null): React.ElementType {
  if (!label) return MapPin;
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(LABEL_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return MapPin;
}

/**
 * Builds a comma-separated address string from location fields.
 */
export function formatLocationAddress(location: LocationResponseModel): string {
  const parts = [
    location.houseNumber,
    location.streetNumber,
    location.village,
    location.commune,
    location.district,
    location.province,
    location.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "No address details";
}

/**
 * Returns true if the location is set as primary/default.
 */
export function isLocationPrimary(location: LocationResponseModel): boolean {
  return location.isPrimary || location.isDefault;
}

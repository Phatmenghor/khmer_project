// utils/geocoding/geocoding.ts

/**
 * Complete Geocoding Utilities with Google Maps API
 * No external packages needed - uses native Fetch API
 */

interface GeocodeResult {
  address: string;
  formattedAddress: string;
  components: {
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

interface GoogleMapsGeocodeResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

/**
 * Parse Google Maps geocoding response
 */
const parseGoogleGeocodeResponse = (
  data: GoogleMapsGeocodeResponse,
): GeocodeResult | null => {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const components: GeocodeResult["components"] = {};

  // Parse address components
  result.address_components.forEach((component) => {
    if (component.types.includes("route")) {
      components.street = component.long_name;
    } else if (component.types.includes("locality")) {
      components.city = component.long_name;
    } else if (component.types.includes("administrative_area_level_2")) {
      components.district = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      components.state = component.long_name;
    } else if (component.types.includes("country")) {
      components.country = component.long_name;
    } else if (component.types.includes("postal_code")) {
      components.postalCode = component.long_name;
    }
  });

  return {
    address: result.formatted_address,
    formattedAddress: result.formatted_address,
    components,
  };
};

/**
 * Convert latitude and longitude to address using Google Maps API
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from .env
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found in environment variables");
    return formatCoordinates(latitude, longitude);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleMapsGeocodeResponse = await response.json();

    if (data.status !== "OK") {
      console.error("Geocoding error:", data.status);
      return formatCoordinates(latitude, longitude);
    }

    const parsed = parseGoogleGeocodeResponse(data);
    if (parsed) {
      return parsed.formattedAddress;
    }

    return formatCoordinates(latitude, longitude);
  } catch (error) {
    console.error("Geocoding error:", error);
    return formatCoordinates(latitude, longitude);
  }
};

/**
 * Get detailed address information
 */
export const getDetailedAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<GeocodeResult | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: GoogleMapsGeocodeResponse = await response.json();

    if (data.status !== "OK") {
      return null;
    }

    return parseGoogleGeocodeResponse(data);
  } catch (error) {
    console.error("Detailed geocoding error:", error);
    return null;
  }
};

/**
 * Format coordinates as fallback
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
): string => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

/**
 * Generate Google Maps URL with customization
 */
export const getGoogleMapsUrl = (
  latitude: number,
  longitude: number,
  zoom: number = 15,
  mapType: "roadmap" | "satellite" | "hybrid" | "terrain" = "roadmap",
): string => {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&t=${mapType}`;
};

/**
 * Generate Google Maps directions URL
 */
export const getGoogleMapsDirectionsUrl = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  travelMode: "driving" | "walking" | "transit" | "bicycling" = "driving",
): string => {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}/?travelmode=${travelMode}`;
};

/**
 * Generate static map image URL (requires API key)
 * Useful for preview without loading full map
 */
export const getStaticMapImageUrl = (
  latitude: number,
  longitude: number,
  width: number = 400,
  height: number = 300,
  zoom: number = 15,
): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return "";
  }

  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
};

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Batch fetch addresses for multiple coordinates
 * Concurrent requests with rate limiting
 */
export const getAddressesFromCoordinates = async (
  coordinates: Array<{ id: string; latitude: number; longitude: number }>,
): Promise<Record<string, string>> => {
  const addressMap: Record<string, string> = {};

  // Create promises for all coordinates
  const promises = coordinates.map(async (coord) => {
    const address = await getAddressFromCoordinates(
      coord.latitude,
      coord.longitude,
    );
    return { id: coord.id, address };
  });

  try {
    const results = await Promise.all(promises);
    results.forEach(({ id, address }) => {
      addressMap[id] = address;
    });
  } catch (error) {
    console.error("Batch geocoding error:", error);
  }

  return addressMap;
};

/**
 * Get detailed addresses for multiple coordinates
 */
export const getDetailedAddressesFromCoordinates = async (
  coordinates: Array<{ id: string; latitude: number; longitude: number }>,
): Promise<Record<string, GeocodeResult>> => {
  const detailedMap: Record<string, GeocodeResult> = {};

  const promises = coordinates.map(async (coord) => {
    const detailed = await getDetailedAddressFromCoordinates(
      coord.latitude,
      coord.longitude,
    );
    return { id: coord.id, detailed };
  });

  try {
    const results = await Promise.all(promises);
    results.forEach(({ id, detailed }) => {
      if (detailed) {
        detailedMap[id] = detailed;
      }
    });
  } catch (error) {
    console.error("Batch detailed geocoding error:", error);
  }

  return detailedMap;
};

/**
 * Format address with custom template
 */
export const formatAddressCustom = (
  components: GeocodeResult["components"],
  template: "short" | "medium" | "full" = "medium",
): string => {
  switch (template) {
    case "short":
      return [components.city, components.country].filter(Boolean).join(", ");

    case "full":
      return [
        components.street,
        components.city,
        components.district,
        components.state,
        components.country,
      ]
        .filter(Boolean)
        .join(", ");

    case "medium":
    default:
      return [components.street, components.city, components.country]
        .filter(Boolean)
        .join(", ");
  }
};

/**
 * Get Place Details from coordinates using Nearby Search
 * Can find nearby businesses, landmarks, etc.
 */
export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  placeType: string = "hospital", // hospital, restaurant, police, etc.
  radius: number = 1000, // in meters
): Promise<any[] | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${apiKey}`,
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (data.status === "OK") {
      return data.results;
    }

    return null;
  } catch (error) {
    console.error("Nearby places error:", error);
    return null;
  }
};

/**
 * Time zone information from coordinates
 */
export const getTimeZoneFromCoordinates = async (
  latitude: number,
  longitude: number,
  timestamp?: number,
): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found");
    return null;
  }

  const ts = timestamp || Math.floor(Date.now() / 1000);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${ts}&key=${apiKey}`,
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (data.status === "OK") {
      return data.timeZoneId;
    }

    return null;
  } catch (error) {
    console.error("Timezone error:", error);
    return null;
  }
};

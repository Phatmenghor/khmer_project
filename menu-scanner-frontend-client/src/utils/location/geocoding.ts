


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


const parseGoogleGeocodeResponse = (
  data: GoogleMapsGeocodeResponse,
): GeocodeResult | null => {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const components: GeocodeResult["components"] = {};


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


export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
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
      return formatCoordinates(latitude, longitude);
    }

    const parsed = parseGoogleGeocodeResponse(data);
    if (parsed) {
      return parsed.formattedAddress;
    }

    return formatCoordinates(latitude, longitude);
  } catch (error) {
    return formatCoordinates(latitude, longitude);
  }
};


export const getDetailedAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<GeocodeResult | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
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
    return null;
  }
};


export const formatCoordinates = (
  latitude: number,
  longitude: number,
): string => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};


export const getGoogleMapsUrl = (
  latitude: number,
  longitude: number,
  zoom: number = 15,
  mapType: "roadmap" | "satellite" | "hybrid" | "terrain" = "roadmap",
): string => {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&t=${mapType}`;
};


export const getGoogleMapsDirectionsUrl = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  travelMode: "driving" | "walking" | "transit" | "bicycling" = "driving",
): string => {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}/?travelmode=${travelMode}`;
};


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


export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
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


export const getAddressesFromCoordinates = async (
  coordinates: Array<{ id: string; latitude: number; longitude: number }>,
): Promise<Record<string, string>> => {
  const addressMap: Record<string, string> = {};


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
  }

  return addressMap;
};


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
  }

  return detailedMap;
};


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


export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  placeType: string = "hospital",
  radius: number = 1000,
): Promise<any[] | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
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
    return null;
  }
};


export const getTimeZoneFromCoordinates = async (
  latitude: number,
  longitude: number,
  timestamp?: number,
): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
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
    return null;
  }
};

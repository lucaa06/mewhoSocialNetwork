import { headers } from "next/headers";

export interface GeoLocation {
  country_code: string | null;
  city: string | null;
}

// Server-side: reads Vercel geo headers (no consent needed, country-level only)
export async function getServerGeo(): Promise<GeoLocation> {
  const headersList = await headers();
  return {
    country_code: headersList.get("x-vercel-ip-country") ?? null,
    city: headersList.get("x-vercel-ip-city")
      ? decodeURIComponent(headersList.get("x-vercel-ip-city")!)
      : null,
  };
}

// Client-side: requests precise GPS with user consent
export function requestPreciseLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ISO 3166-1 alpha-2 → display name
const COUNTRY_NAMES: Record<string, string> = {
  IT: "Italia",
  US: "United States",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  ES: "Spain",
  BR: "Brazil",
  IN: "India",
  // extend as needed
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

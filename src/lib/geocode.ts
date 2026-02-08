// Geocode a location string to lat/lng using OpenStreetMap Nominatim
// Free, no API key required. Rate limit: 1 request/second.

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeLocation(
  query: string
): Promise<GeoResult | null> {
  if (!query || query.trim().length < 3) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          // Nominatim requires a User-Agent identifying your app
          "User-Agent": "Vamos-App/1.0",
        },
      }
    );

    if (!res.ok) return null;

    const results = await res.json();
    if (!results || results.length === 0) return null;

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    };
  } catch {
    return null;
  }
}
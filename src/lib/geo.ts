// Haversine formula to calculate distance between two GPS coordinates in meters
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// 500 meter geofence radius for legitimate venue check-ins
export const CHECKIN_GEOFENCE_RADIUS_METERS = 500;

export interface MetroCityCoord {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
}

// Find closest metro city based on GPS coordinates
export function findClosestMetro<T extends MetroCityCoord>(
  lat: number,
  lon: number,
  cities?: T[]
): { city?: T; distanceMeters: number } {
  if (!cities || cities.length === 0) {
    return { city: undefined, distanceMeters: Infinity };
  }
  let closest = cities[0];
  let minDistance = calculateDistanceInMeters(lat, lon, closest.center[1], closest.center[0]);

  for (let i = 1; i < cities.length; i++) {
    const dist = calculateDistanceInMeters(lat, lon, cities[i].center[1], cities[i].center[0]);
    if (dist < minDistance) {
      minDistance = dist;
      closest = cities[i];
    }
  }

  return { city: closest, distanceMeters: minDistance };
}

// Generate Google Maps navigation URL for directions
export function getGoogleMapsUrl(lat: number, lng: number, venueName?: string): string {
  if (venueName) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueName)}&destination_place_id=&destination_coordinates=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Format approximate walking/travel time based on distance
export function formatWalkingTime(meters: number): string {
  if (meters <= 80) return 'At venue (<1 min)';
  const walkMins = Math.round(meters / 80); // average ~80m/min
  if (walkMins <= 45) {
    return `~${walkMins} min walk`;
  }
  const driveMins = Math.max(5, Math.round(meters / 350));
  return `~${driveMins} min ride`;
}



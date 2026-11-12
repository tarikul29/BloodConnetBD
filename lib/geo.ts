export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two lat/lng points
 * using the Haversine formula. Returns distance in kilometers.
 */
export function haversineDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);

  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export interface DonorLike extends Coordinates {
  [key: string]: unknown;
}

export interface DonorWithDistance<T extends DonorLike> {
  donor: T;
  distanceKm: number;
}

/**
 * Filters and sorts donors within a given radius (default 5km) of a
 * hospital/request location. Sorted nearest-first.
 */
export function findNearbyDonors<T extends DonorLike>(
  donors: T[],
  hospitalLocation: Coordinates,
  radiusKm: number = 5
): DonorWithDistance<T>[] {
  return donors
    .map((donor) => ({
      donor,
      distanceKm: haversineDistance(hospitalLocation, {
        latitude: donor.latitude,
        longitude: donor.longitude,
      }),
    }))
    .filter((entry) => entry.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

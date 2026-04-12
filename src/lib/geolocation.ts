//src/lib/geolocation.ts
/**
 * Geolocation utilities for nearest doctor search
 * Pure JavaScript implementation - no external dependencies
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get user's current location using browser Geolocation API
 * 
 * @returns Promise with coordinates or null if denied/unavailable
 * 
 * Usage:
 * const location = await getPatientLocation();
 * if (location) {
 *   console.log('Lat:', location.latitude, 'Lng:', location.longitude);
 * }
 */
export async function getPatientLocation(): Promise<Coordinates | null> {
  // Check if browser supports geolocation
  if (!navigator.geolocation) {
    console.warn('❌ Geolocation is not supported by this browser');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('✅ Location obtained:', coords);
        resolve(coords);
      },
      // Error callback
      (error) => {
        console.warn('⚠️ Location error:', error.message);
        resolve(null); // Return null instead of throwing error
      },
      // Options
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // Wait max 10 seconds
        maximumAge: 0, // Don't use cached location
      }
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param from - Starting point (e.g., patient location)
 * @param to - Destination point (e.g., doctor clinic)
 * @returns Distance in kilometers
 * 
 * Example:
 * const distance = calculateDistance(
 *   { latitude: 36.7538, longitude: 3.0588 },  // Algiers
 *   { latitude: 35.6976, longitude: -0.6333 }  // Oran
 * );
 * console.log(distance); // ~358 km
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const lat1 = degreesToRadians(from.latitude);
  const lat2 = degreesToRadians(to.latitude);
  const deltaLat = degreesToRadians(to.latitude - from.latitude);
  const deltaLon = degreesToRadians(to.longitude - from.longitude);

  // Haversine formula
  // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  // c = 2 ⋅ atan2(√a, √(1−a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance = R ⋅ c
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for user-friendly display
 * 
 * @param km - Distance in kilometers
 * @returns Formatted string
 * 
 * Examples:
 * formatDistance(0.5) → "500 m"
 * formatDistance(1.2) → "1.2 km"
 * formatDistance(15.789) → "15.8 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    // Less than 1km → show in meters
    return `${Math.round(km * 1000)} m`;
  }
  // 1km or more → show in km with 1 decimal
  return `${km.toFixed(1)} km`;
}

/**
 * Validate that coordinates are within valid ranges
 * 
 * Valid ranges:
 * - Latitude: -90 to +90 (South to North pole)
 * - Longitude: -180 to +180 (West to East around globe)
 */
export function isValidCoordinates(
  coords: Partial<Coordinates>
): coords is Coordinates {
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}
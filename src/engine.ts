/**
 * Distance computation engine -- pure TypeScript, zero dependencies, <1ms.
 *
 * Provides Haversine great-circle distance, bearing, midpoint, travel time
 * estimates, and unit conversions. All functions are stateless and thread-safe.
 */

import type { DistanceResult } from "./types.js";

// Earth radius in km (WGS84 mean radius)
const EARTH_RADIUS_KM = 6371.0088;

// Unit conversion factors
const KM_TO_MILES = 0.621371;
const KM_TO_NAUTICAL_MILES = 0.539957;

// ── Helpers ──────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ── Core Distance ────────────────────────────────────────────────

/**
 * Great-circle distance using the Haversine formula.
 *
 * @param lat1 - Latitude of point 1 in decimal degrees.
 * @param lon1 - Longitude of point 1 in decimal degrees.
 * @param lat2 - Latitude of point 2 in decimal degrees.
 * @param lon2 - Longitude of point 2 in decimal degrees.
 * @returns Distance in kilometers (rounded to integer).
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const lat1R = toRad(lat1);
  const lat2R = toRad(lat2);
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

// ── Bearing & Direction ──────────────────────────────────────────

/**
 * Initial bearing from point 1 to point 2.
 *
 * @param lat1 - Latitude of origin in decimal degrees.
 * @param lon1 - Longitude of origin in decimal degrees.
 * @param lat2 - Latitude of destination in decimal degrees.
 * @param lon2 - Longitude of destination in decimal degrees.
 * @returns Bearing in degrees (0-360), where 0=North, 90=East.
 */
export function bearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const lat1R = toRad(lat1);
  const lat2R = toRad(lat2);
  const dlon = toRad(lon2 - lon1);
  const x = Math.sin(dlon) * Math.cos(lat2R);
  const y =
    Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dlon);
  const brng = toDeg(Math.atan2(x, y));
  return (brng + 360) % 360;
}

const COMPASS_POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

const COMPASS_FULL: Record<string, string> = {
  N: "north",
  NNE: "north-northeast",
  NE: "northeast",
  ENE: "east-northeast",
  E: "east",
  ESE: "east-southeast",
  SE: "southeast",
  SSE: "south-southeast",
  S: "south",
  SSW: "south-southwest",
  SW: "southwest",
  WSW: "west-southwest",
  W: "west",
  WNW: "west-northwest",
  NW: "northwest",
  NNW: "north-northwest",
};

/**
 * Convert bearing to 16-point compass direction abbreviation.
 *
 * @param degrees - Bearing in degrees (0-360).
 * @returns Compass abbreviation (e.g., "NNE", "SW").
 */
export function compassDirection(degrees: number): string {
  const idx = Math.round(degrees / 22.5) % 16;
  return COMPASS_POINTS[idx];
}

/**
 * Convert bearing to full compass direction name.
 *
 * @param degrees - Bearing in degrees (0-360).
 * @returns Full direction name (e.g., "north-northeast", "southwest").
 */
export function compassDirectionFull(degrees: number): string {
  return COMPASS_FULL[compassDirection(degrees)] ?? "";
}

// ── Midpoint & Great Circle ──────────────────────────────────────

/**
 * Geographic midpoint between two coordinates.
 *
 * @param lat1 - Latitude of point 1 in decimal degrees.
 * @param lon1 - Longitude of point 1 in decimal degrees.
 * @param lat2 - Latitude of point 2 in decimal degrees.
 * @param lon2 - Longitude of point 2 in decimal degrees.
 * @returns Tuple of [latitude, longitude] of the midpoint.
 */
export function midpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): [number, number] {
  const lat1R = toRad(lat1);
  const lon1R = toRad(lon1);
  const lat2R = toRad(lat2);
  const lon2R = toRad(lon2);
  const bx = Math.cos(lat2R) * Math.cos(lon2R - lon1R);
  const by = Math.cos(lat2R) * Math.sin(lon2R - lon1R);
  const latM = Math.atan2(
    Math.sin(lat1R) + Math.sin(lat2R),
    Math.sqrt((Math.cos(lat1R) + bx) ** 2 + by ** 2),
  );
  const lonM = lon1R + Math.atan2(by, Math.cos(lat1R) + bx);
  return [
    Math.round(toDeg(latM) * 100000) / 100000,
    Math.round(toDeg(lonM) * 100000) / 100000,
  ];
}

/**
 * Generate points along the great circle arc.
 *
 * @param lat1 - Latitude of point 1.
 * @param lon1 - Longitude of point 1.
 * @param lat2 - Latitude of point 2.
 * @param lon2 - Longitude of point 2.
 * @param numPoints - Number of intermediate points (default 50).
 * @returns Array of [lat, lon] tuples along the arc.
 */
export function greatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints: number = 50,
): [number, number][] {
  const lat1R = toRad(lat1);
  const lon1R = toRad(lon1);
  const lat2R = toRad(lat2);
  const lon2R = toRad(lon2);
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2R - lat1R) / 2) ** 2 +
          Math.cos(lat1R) *
            Math.cos(lat2R) *
            Math.sin((lon2R - lon1R) / 2) ** 2,
      ),
    );
  if (d < 1e-10) {
    return [
      [lat1, lon1],
      [lat2, lon2],
    ];
  }
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x =
      a * Math.cos(lat1R) * Math.cos(lon1R) +
      b * Math.cos(lat2R) * Math.cos(lon2R);
    const y =
      a * Math.cos(lat1R) * Math.sin(lon1R) +
      b * Math.cos(lat2R) * Math.sin(lon2R);
    const z = a * Math.sin(lat1R) + b * Math.sin(lat2R);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([
      Math.round(lat * 100000) / 100000,
      Math.round(lon * 100000) / 100000,
    ]);
  }
  return points;
}

/**
 * Point on the exact opposite side of Earth.
 *
 * @param lat - Latitude in decimal degrees.
 * @param lon - Longitude in decimal degrees.
 * @returns Tuple of [latitude, longitude] of the antipodal point.
 */
export function antipodalPoint(lat: number, lon: number): [number, number] {
  const antiLon = lon <= 0 ? lon + 180 : lon - 180;
  return [-lat, antiLon];
}

// ── Travel Time Estimates ────────────────────────────────────────

/**
 * Estimated flight time in minutes.
 *
 * Uses variable speed by distance band plus 30-minute overhead
 * for takeoff/landing.
 *
 * @param distanceKm - Distance in kilometers.
 * @returns Estimated flight time in minutes.
 */
export function estimateFlightTime(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  let speed: number;
  if (distanceKm < 500) {
    speed = 600;
  } else if (distanceKm < 1500) {
    speed = 750;
  } else {
    speed = 850;
  }
  return Math.round((distanceKm / speed) * 60) + 30;
}

/**
 * Estimated driving time in minutes.
 *
 * Uses a 1.3x road distance factor and variable speed by distance.
 * Returns 0 for cross-ocean pairs.
 *
 * @param distanceKm - Straight-line distance in kilometers.
 * @param sameContinent - Whether both points are on the same continent.
 * @returns Estimated driving time in minutes, or 0 if not drivable.
 */
export function estimateDriveTime(
  distanceKm: number,
  sameContinent: boolean = true,
): number {
  if (!sameContinent || distanceKm <= 0) return 0;
  const roadDistance = Math.trunc(distanceKm * 1.3);
  let speed: number;
  if (roadDistance < 50) {
    speed = 40;
  } else if (roadDistance < 200) {
    speed = 70;
  } else if (roadDistance < 1000) {
    speed = 90;
  } else {
    speed = 100;
  }
  return Math.round((roadDistance / speed) * 60);
}

/**
 * Estimated walking time in minutes at 5 km/h.
 *
 * Returns 0 for distances over 100 km.
 *
 * @param distanceKm - Distance in kilometers.
 * @returns Estimated walking time in minutes.
 */
export function estimateWalkTime(distanceKm: number): number {
  if (distanceKm > 100 || distanceKm <= 0) return 0;
  return Math.round((distanceKm / 5) * 60);
}

// ── Unit Conversion ──────────────────────────────────────────────

/**
 * Convert kilometers to miles (rounded).
 */
export function kmToMiles(km: number): number {
  return Math.round(km * KM_TO_MILES);
}

/**
 * Convert kilometers to nautical miles (rounded).
 */
export function kmToNauticalMiles(km: number): number {
  return Math.round(km * KM_TO_NAUTICAL_MILES);
}

/**
 * Convert miles to kilometers (rounded).
 */
export function milesToKm(miles: number): number {
  return Math.round(miles / KM_TO_MILES);
}

// ── Formatting ───────────────────────────────────────────────────

/**
 * Format distance with thousands separator (e.g., "12,345 km").
 */
export function formatDistance(km: number): string {
  return `${km.toLocaleString("en-US")} km`;
}

/**
 * Format duration as human-readable string.
 *
 * @example "45m", "2h 30m", "3d 5h"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "\u2014";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.trunc(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins ? `${hours}h ${String(mins).padStart(2, "0")}m` : `${hours}h`;
  }
  const days = Math.trunc(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

// ── Full Computation ─────────────────────────────────────────────

/**
 * Compute complete distance information between two coordinates.
 *
 * Single call that returns all distance, bearing, midpoint, and
 * travel time data needed for display.
 *
 * @param lat1 - Latitude of point 1.
 * @param lon1 - Longitude of point 1.
 * @param lat2 - Latitude of point 2.
 * @param lon2 - Longitude of point 2.
 * @param sameContinent - Whether both points are on the same continent.
 * @returns DistanceResult with all computed fields.
 */
export function computeDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  sameContinent: boolean = true,
): DistanceResult {
  const distKm = haversineDistance(lat1, lon1, lat2, lon2);
  const brng = bearing(lat1, lon1, lat2, lon2);
  const [midLat, midLon] = midpoint(lat1, lon1, lat2, lon2);
  return {
    distanceKm: distKm,
    distanceMiles: kmToMiles(distKm),
    distanceNm: kmToNauticalMiles(distKm),
    bearingDegrees: Math.round(brng * 10) / 10,
    compassDirection: compassDirection(brng),
    compassDirectionFull: compassDirectionFull(brng),
    midpointLat: midLat,
    midpointLon: midLon,
    flightTimeMinutes: estimateFlightTime(distKm),
    driveTimeMinutes: estimateDriveTime(distKm, sameContinent),
    walkTimeMinutes: estimateWalkTime(distKm),
  };
}

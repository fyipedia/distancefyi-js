/**
 * TypeScript interfaces for the distancefyi distance engine.
 *
 * All coordinates use decimal degrees (WGS84).
 * Distances are in kilometers (rounded to integer).
 * Bearings are in degrees (0-360, where 0=North, 90=East).
 */

export interface DistanceResult {
  distanceKm: number;
  distanceMiles: number;
  distanceNm: number;
  bearingDegrees: number;
  compassDirection: string;
  compassDirectionFull: string;
  midpointLat: number;
  midpointLon: number;
  flightTimeMinutes: number;
  driveTimeMinutes: number;
  walkTimeMinutes: number;
}

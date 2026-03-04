/**
 * distancefyi -- Pure TypeScript distance engine for developers.
 *
 * Compute Haversine great-circle distance, initial bearing, geographic
 * midpoint, great-circle arc points, antipodal points, travel time
 * estimates, and unit conversions between km/miles/nautical miles.
 *
 * Zero dependencies. Works in Node.js, Deno, Bun, and browsers.
 *
 * @example
 * ```ts
 * import { computeDistance, haversineDistance, formatDistance } from "distancefyi";
 *
 * // Seoul to Tokyo
 * const result = computeDistance(37.5665, 126.978, 35.6762, 139.6503);
 * console.log(result.distanceKm);   // 1149
 * console.log(result.compassDirection); // "E"
 *
 * const km = haversineDistance(37.5665, 126.978, 35.6762, 139.6503);
 * console.log(formatDistance(km));   // "1,149 km"
 * ```
 *
 * @packageDocumentation
 */

// Types
export type { DistanceResult } from "./types.js";

// Engine -- distance computations
export {
  haversineDistance,
  bearing,
  compassDirection,
  compassDirectionFull,
  midpoint,
  greatCirclePoints,
  antipodalPoint,
  estimateFlightTime,
  estimateDriveTime,
  estimateWalkTime,
  kmToMiles,
  kmToNauticalMiles,
  milesToKm,
  formatDistance,
  formatDuration,
  computeDistance,
} from "./engine.js";

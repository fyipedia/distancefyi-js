import { describe, it, expect } from "vitest";
import {
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
} from "../src/index.js";

// ---------------------------------------------------------------------------
// Haversine Distance
// ---------------------------------------------------------------------------

describe("haversineDistance", () => {
  it("Seoul to Tokyo", () => {
    // ~1149 km
    const d = haversineDistance(37.5665, 126.978, 35.6762, 139.6503);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1200);
  });

  it("New York to London", () => {
    // ~5570 km
    const d = haversineDistance(40.7128, -74.006, 51.5074, -0.1278);
    expect(d).toBeGreaterThan(5500);
    expect(d).toBeLessThan(5600);
  });

  it("same point returns 0", () => {
    expect(haversineDistance(0, 0, 0, 0)).toBe(0);
    expect(haversineDistance(37.5665, 126.978, 37.5665, 126.978)).toBe(0);
  });

  it("antipodal points return ~20015 km (half circumference)", () => {
    const d = haversineDistance(0, 0, 0, 180);
    expect(d).toBeGreaterThan(20000);
    expect(d).toBeLessThan(20100);
  });

  it("equator distance is correct", () => {
    // 1 degree of longitude at equator ~ 111 km
    const d = haversineDistance(0, 0, 0, 1);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });

  it("returns integer", () => {
    const d = haversineDistance(37.5665, 126.978, 35.6762, 139.6503);
    expect(Number.isInteger(d)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bearing
// ---------------------------------------------------------------------------

describe("bearing", () => {
  it("north bearing is ~0", () => {
    const b = bearing(0, 0, 1, 0);
    expect(b).toBeCloseTo(0, 0);
  });

  it("east bearing is ~90", () => {
    const b = bearing(0, 0, 0, 1);
    expect(b).toBeCloseTo(90, 0);
  });

  it("south bearing is ~180", () => {
    const b = bearing(1, 0, 0, 0);
    expect(b).toBeCloseTo(180, 0);
  });

  it("west bearing is ~270", () => {
    const b = bearing(0, 1, 0, 0);
    expect(b).toBeCloseTo(270, 0);
  });

  it("returns value in 0-360 range", () => {
    const b = bearing(37.5665, 126.978, 35.6762, 139.6503);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(360);
  });
});

// ---------------------------------------------------------------------------
// Compass Direction
// ---------------------------------------------------------------------------

describe("compassDirection", () => {
  it("0 degrees is N", () => {
    expect(compassDirection(0)).toBe("N");
  });

  it("90 degrees is E", () => {
    expect(compassDirection(90)).toBe("E");
  });

  it("180 degrees is S", () => {
    expect(compassDirection(180)).toBe("S");
  });

  it("270 degrees is W", () => {
    expect(compassDirection(270)).toBe("W");
  });

  it("45 degrees is NE", () => {
    expect(compassDirection(45)).toBe("NE");
  });

  it("360 degrees wraps to N", () => {
    expect(compassDirection(360)).toBe("N");
  });

  it("returns all 16 points", () => {
    const all = new Set<string>();
    for (let d = 0; d < 360; d += 22.5) {
      all.add(compassDirection(d));
    }
    expect(all.size).toBe(16);
  });
});

describe("compassDirectionFull", () => {
  it("0 degrees is north", () => {
    expect(compassDirectionFull(0)).toBe("north");
  });

  it("45 degrees is northeast", () => {
    expect(compassDirectionFull(45)).toBe("northeast");
  });

  it("22.5 degrees is north-northeast", () => {
    expect(compassDirectionFull(22.5)).toBe("north-northeast");
  });

  it("225 degrees is southwest", () => {
    expect(compassDirectionFull(225)).toBe("southwest");
  });
});

// ---------------------------------------------------------------------------
// Midpoint
// ---------------------------------------------------------------------------

describe("midpoint", () => {
  it("midpoint of same point is itself", () => {
    const [lat, lon] = midpoint(37.5665, 126.978, 37.5665, 126.978);
    expect(lat).toBeCloseTo(37.5665, 3);
    expect(lon).toBeCloseTo(126.978, 3);
  });

  it("midpoint on equator", () => {
    const [lat, lon] = midpoint(0, 0, 0, 10);
    expect(lat).toBeCloseTo(0, 3);
    expect(lon).toBeCloseTo(5, 3);
  });

  it("midpoint of Seoul and Tokyo", () => {
    const [lat, lon] = midpoint(37.5665, 126.978, 35.6762, 139.6503);
    // Should be roughly between the two
    expect(lat).toBeGreaterThan(35);
    expect(lat).toBeLessThan(38);
    expect(lon).toBeGreaterThan(126);
    expect(lon).toBeLessThan(140);
  });

  it("returns 5 decimal places", () => {
    const [lat, lon] = midpoint(37.5665, 126.978, 35.6762, 139.6503);
    const latDecimals = lat.toString().split(".")[1]?.length ?? 0;
    const lonDecimals = lon.toString().split(".")[1]?.length ?? 0;
    expect(latDecimals).toBeLessThanOrEqual(5);
    expect(lonDecimals).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// Great Circle Points
// ---------------------------------------------------------------------------

describe("greatCirclePoints", () => {
  it("returns numPoints + 1 points", () => {
    const pts = greatCirclePoints(0, 0, 0, 10, 10);
    expect(pts).toHaveLength(11);
  });

  it("first point matches start", () => {
    const pts = greatCirclePoints(37.5665, 126.978, 35.6762, 139.6503);
    expect(pts[0][0]).toBeCloseTo(37.5665, 3);
    expect(pts[0][1]).toBeCloseTo(126.978, 3);
  });

  it("last point matches end", () => {
    const pts = greatCirclePoints(37.5665, 126.978, 35.6762, 139.6503);
    expect(pts[pts.length - 1][0]).toBeCloseTo(35.6762, 3);
    expect(pts[pts.length - 1][1]).toBeCloseTo(139.6503, 3);
  });

  it("default is 51 points (50 segments)", () => {
    const pts = greatCirclePoints(0, 0, 0, 10);
    expect(pts).toHaveLength(51);
  });

  it("returns 2 points for same location", () => {
    const pts = greatCirclePoints(0, 0, 0, 0);
    expect(pts).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Antipodal Point
// ---------------------------------------------------------------------------

describe("antipodalPoint", () => {
  it("antipode of (0, 0) is (0, 180)", () => {
    const [lat, lon] = antipodalPoint(0, 0);
    expect(lat).toBeCloseTo(0);
    expect(lon).toBe(180);
  });

  it("antipode of north pole is south pole", () => {
    const [lat, lon] = antipodalPoint(90, 0);
    expect(lat).toBe(-90);
    expect(lon).toBe(180);
  });

  it("antipode of Seoul", () => {
    const [lat, lon] = antipodalPoint(37.5665, 126.978);
    expect(lat).toBeCloseTo(-37.5665);
    expect(lon).toBeCloseTo(-53.022);
  });

  it("negative longitude flips to positive", () => {
    const [, lon] = antipodalPoint(0, -74);
    expect(lon).toBe(106);
  });
});

// ---------------------------------------------------------------------------
// Travel Time Estimates
// ---------------------------------------------------------------------------

describe("estimateFlightTime", () => {
  it("returns 0 for 0 km", () => {
    expect(estimateFlightTime(0)).toBe(0);
  });

  it("returns 0 for negative", () => {
    expect(estimateFlightTime(-100)).toBe(0);
  });

  it("short distance uses 600 km/h", () => {
    // 300 km at 600 km/h = 30 min + 30 min overhead = 60 min
    expect(estimateFlightTime(300)).toBe(60);
  });

  it("medium distance uses 750 km/h", () => {
    // 1000 km at 750 km/h = 80 min + 30 = 110 min
    expect(estimateFlightTime(1000)).toBe(110);
  });

  it("long distance uses 850 km/h", () => {
    // 5000 km at 850 km/h = ~353 min + 30 = 383 min
    const t = estimateFlightTime(5000);
    expect(t).toBeGreaterThan(380);
    expect(t).toBeLessThan(390);
  });

  it("includes 30 min overhead", () => {
    // Very short flight: 100 km at 600 km/h = 10 min + 30 = 40
    expect(estimateFlightTime(100)).toBe(40);
  });
});

describe("estimateDriveTime", () => {
  it("returns 0 if not same continent", () => {
    expect(estimateDriveTime(500, false)).toBe(0);
  });

  it("returns 0 for 0 km", () => {
    expect(estimateDriveTime(0)).toBe(0);
  });

  it("short distance uses 40 km/h", () => {
    // 30 km * 1.3 = 39 road km at 40 km/h = 58.5 min → 59 min (rounded)
    const t = estimateDriveTime(30);
    expect(t).toBe(59);
  });

  it("medium distance uses 70 km/h", () => {
    // 100 km * 1.3 = 130 road km at 70 km/h = 111.4 min → 111 min
    const t = estimateDriveTime(100);
    expect(t).toBe(111);
  });

  it("long distance uses 90 km/h", () => {
    // 500 km * 1.3 = 650 road km at 90 km/h = 433 min
    const t = estimateDriveTime(500);
    expect(t).toBe(433);
  });

  it("very long distance uses 100 km/h", () => {
    // 1000 km * 1.3 = 1300 road km at 100 km/h = 780 min
    const t = estimateDriveTime(1000);
    expect(t).toBe(780);
  });
});

describe("estimateWalkTime", () => {
  it("returns 0 for over 100 km", () => {
    expect(estimateWalkTime(101)).toBe(0);
  });

  it("returns 0 for 0 km", () => {
    expect(estimateWalkTime(0)).toBe(0);
  });

  it("10 km at 5 km/h = 120 min", () => {
    expect(estimateWalkTime(10)).toBe(120);
  });

  it("100 km at 5 km/h = 1200 min", () => {
    expect(estimateWalkTime(100)).toBe(1200);
  });

  it("returns 0 for negative", () => {
    expect(estimateWalkTime(-5)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Unit Conversion
// ---------------------------------------------------------------------------

describe("kmToMiles", () => {
  it("1 km ~ 0.62 miles", () => {
    expect(kmToMiles(1)).toBe(1);
  });

  it("100 km ~ 62 miles", () => {
    expect(kmToMiles(100)).toBe(62);
  });

  it("0 returns 0", () => {
    expect(kmToMiles(0)).toBe(0);
  });

  it("1609 km ~ 1000 miles", () => {
    expect(kmToMiles(1609)).toBeCloseTo(1000, -1);
  });
});

describe("kmToNauticalMiles", () => {
  it("1 km ~ 0.54 nm", () => {
    expect(kmToNauticalMiles(1)).toBe(1);
  });

  it("1852 km ~ 1000 nm", () => {
    expect(kmToNauticalMiles(1852)).toBeCloseTo(1000, -1);
  });

  it("0 returns 0", () => {
    expect(kmToNauticalMiles(0)).toBe(0);
  });
});

describe("milesToKm", () => {
  it("1 mile ~ 1.6 km", () => {
    expect(milesToKm(1)).toBe(2);
  });

  it("100 miles ~ 161 km", () => {
    expect(milesToKm(100)).toBe(161);
  });

  it("0 returns 0", () => {
    expect(milesToKm(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

describe("formatDistance", () => {
  it("formats with comma separator", () => {
    expect(formatDistance(12345)).toBe("12,345 km");
  });

  it("no comma for small numbers", () => {
    expect(formatDistance(100)).toBe("100 km");
  });

  it("zero", () => {
    expect(formatDistance(0)).toBe("0 km");
  });
});

describe("formatDuration", () => {
  it("returns em dash for 0", () => {
    expect(formatDuration(0)).toBe("\u2014");
  });

  it("returns em dash for negative", () => {
    expect(formatDuration(-10)).toBe("\u2014");
  });

  it("minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("hours and minutes", () => {
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("exact hours (no minutes)", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("pads minutes to 2 digits", () => {
    expect(formatDuration(65)).toBe("1h 05m");
  });

  it("days and hours", () => {
    expect(formatDuration(1500)).toBe("1d 1h");
  });

  it("multiple days", () => {
    expect(formatDuration(4320)).toBe("3d 0h");
  });
});

// ---------------------------------------------------------------------------
// computeDistance (full computation)
// ---------------------------------------------------------------------------

describe("computeDistance", () => {
  it("Seoul to Tokyo", () => {
    const r = computeDistance(37.5665, 126.978, 35.6762, 139.6503);
    expect(r.distanceKm).toBeGreaterThan(1100);
    expect(r.distanceKm).toBeLessThan(1200);
    expect(r.distanceMiles).toBeGreaterThan(700);
    expect(r.distanceNm).toBeGreaterThan(600);
    expect(r.bearingDegrees).toBeGreaterThan(0);
    expect(r.bearingDegrees).toBeLessThan(360);
    expect(r.compassDirection).toBeTruthy();
    expect(r.compassDirectionFull).toBeTruthy();
    expect(r.midpointLat).toBeGreaterThan(35);
    expect(r.midpointLat).toBeLessThan(38);
    expect(r.flightTimeMinutes).toBeGreaterThan(0);
    expect(r.driveTimeMinutes).toBeGreaterThan(0);
    expect(r.walkTimeMinutes).toBe(0); // > 100 km
  });

  it("short distance includes walk time", () => {
    // Two points ~10 km apart
    const r = computeDistance(37.5665, 126.978, 37.5665, 127.1);
    expect(r.distanceKm).toBeLessThan(100);
    expect(r.walkTimeMinutes).toBeGreaterThan(0);
  });

  it("cross-ocean has 0 drive time", () => {
    const r = computeDistance(37.5665, 126.978, 40.7128, -74.006, false);
    expect(r.driveTimeMinutes).toBe(0);
  });

  it("same point returns zeros", () => {
    const r = computeDistance(0, 0, 0, 0);
    expect(r.distanceKm).toBe(0);
    expect(r.distanceMiles).toBe(0);
    expect(r.distanceNm).toBe(0);
    expect(r.flightTimeMinutes).toBe(0);
    expect(r.driveTimeMinutes).toBe(0);
    expect(r.walkTimeMinutes).toBe(0);
  });

  it("returns all fields", () => {
    const r = computeDistance(37.5665, 126.978, 35.6762, 139.6503);
    expect(r).toHaveProperty("distanceKm");
    expect(r).toHaveProperty("distanceMiles");
    expect(r).toHaveProperty("distanceNm");
    expect(r).toHaveProperty("bearingDegrees");
    expect(r).toHaveProperty("compassDirection");
    expect(r).toHaveProperty("compassDirectionFull");
    expect(r).toHaveProperty("midpointLat");
    expect(r).toHaveProperty("midpointLon");
    expect(r).toHaveProperty("flightTimeMinutes");
    expect(r).toHaveProperty("driveTimeMinutes");
    expect(r).toHaveProperty("walkTimeMinutes");
  });

  it("bearing is rounded to 1 decimal", () => {
    const r = computeDistance(37.5665, 126.978, 35.6762, 139.6503);
    const decimals = r.bearingDegrees.toString().split(".")[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Cross-validation with Python engine
// ---------------------------------------------------------------------------

describe("cross-validation with Python engine", () => {
  it("haversine matches Python output for Seoul-Tokyo", () => {
    // Python: haversine_distance(37.5665, 126.978, 35.6762, 139.6503) = 1149
    expect(haversineDistance(37.5665, 126.978, 35.6762, 139.6503)).toBe(1149);
  });

  it("bearing matches Python output for Seoul-Tokyo", () => {
    // Python: bearing(37.5665, 126.978, 35.6762, 139.6503) = 96.6960907678685
    const b = bearing(37.5665, 126.978, 35.6762, 139.6503);
    expect(b).toBeCloseTo(96.696, 2);
  });

  it("km_to_miles matches Python", () => {
    // Python: km_to_miles(1149) = 714
    expect(kmToMiles(1149)).toBe(714);
  });

  it("km_to_nautical_miles matches Python", () => {
    // Python: km_to_nautical_miles(1149) = 620
    expect(kmToNauticalMiles(1149)).toBe(620);
  });

  it("miles_to_km matches Python", () => {
    // Python: miles_to_km(714) = 1149
    expect(milesToKm(714)).toBe(1149);
  });
});

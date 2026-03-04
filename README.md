# distancefyi

[![npm](https://img.shields.io/npm/v/distancefyi)](https://www.npmjs.com/package/distancefyi)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/distancefyi)

Pure TypeScript distance engine for developers. Compute [Haversine great-circle distance](https://distancefyi.com/), initial bearing, geographic midpoint, [great-circle arc points](https://distancefyi.com/), travel time estimates (flight, drive, walk), and unit conversions between km/miles/nautical miles -- all with zero dependencies.

> **Try the interactive tools at [distancefyi.com](https://distancefyi.com/)** -- distance calculator, travel time estimator, and city-to-city comparisons.

## Install

```bash
npm install distancefyi
```

Works in Node.js, Deno, Bun, and browsers (ESM).

## Quick Start

```typescript
import { computeDistance, haversineDistance, formatDistance, formatDuration } from "distancefyi";

// Full distance computation between Seoul and Tokyo
const result = computeDistance(37.5665, 126.978, 35.6762, 139.6503);
console.log(result.distanceKm);          // 1159
console.log(result.distanceMiles);       // 720
console.log(result.bearingDegrees);      // 91.2
console.log(result.compassDirection);    // "E"
console.log(result.flightTimeMinutes);   // 123
console.log(result.driveTimeMinutes);    // 0 (cross-ocean)

// Simple Haversine distance
const km = haversineDistance(40.7128, -74.006, 51.5074, -0.1278);
console.log(formatDistance(km));          // "5,570 km"
console.log(formatDuration(420));        // "7h"
```

## Understanding Great-Circle Distance

The Haversine formula calculates the shortest path over Earth's surface. Unlike Euclidean distance, it accounts for Earth's curvature using spherical trigonometry.

Given two points with latitudes and longitudes in radians, the formula computes:

```
a = sin²(dlat/2) + cos(lat1) * cos(lat2) * sin²(dlon/2)
c = 2 * atan2(sqrt(a), sqrt(1-a))
distance = R * c
```

where R is Earth's mean radius (6,371.0088 km, WGS84). This gives accuracy within 0.5% for most practical distances. The implementation uses `Math.atan2` for numerical stability near antipodal points.

## Bearing & Compass Direction

```typescript
import { bearing, compassDirection, compassDirectionFull } from "distancefyi";

// Initial bearing from New York to London
const brng = bearing(40.7128, -74.006, 51.5074, -0.1278);
console.log(brng);                      // 51.2 (degrees from north)
console.log(compassDirection(brng));     // "NE"
console.log(compassDirectionFull(brng)); // "northeast"
```

## Midpoint & Great Circle Arc

```typescript
import { midpoint, greatCirclePoints, antipodalPoint } from "distancefyi";

// Geographic midpoint between two cities
const [midLat, midLon] = midpoint(40.7128, -74.006, 51.5074, -0.1278);
console.log(midLat, midLon);  // 50.50164, -36.04498

// Generate points along the great circle for map rendering
const arcPoints = greatCirclePoints(40.7128, -74.006, 51.5074, -0.1278, 20);
console.log(arcPoints.length);  // 21

// Antipodal point (opposite side of Earth)
const [antiLat, antiLon] = antipodalPoint(40.7128, -74.006);
console.log(antiLat, antiLon);  // -40.7128, 105.994
```

## Travel Time Estimates

```typescript
import { estimateFlightTime, estimateDriveTime, estimateWalkTime, formatDuration } from "distancefyi";

// Variable speed by distance band + 30-min overhead
console.log(formatDuration(estimateFlightTime(1000)));   // "1h 50m"
console.log(formatDuration(estimateFlightTime(10000)));  // "12h 36m"

// Drive time with 1.3x road distance factor
console.log(formatDuration(estimateDriveTime(500)));     // "8h 40m"
console.log(estimateDriveTime(500, false));              // 0 (cross-ocean)

// Walking at 5 km/h (max 100 km)
console.log(formatDuration(estimateWalkTime(10)));       // "2h"
console.log(estimateWalkTime(200));                      // 0 (too far)
```

## API Reference

### Core Distance

| Function | Description |
|----------|-------------|
| `haversineDistance(lat1, lon1, lat2, lon2) -> number` | Great-circle distance in km (Haversine formula) |
| `computeDistance(lat1, lon1, lat2, lon2, sameContinent?) -> DistanceResult` | Full computation: distance, bearing, midpoint, travel times |

### Bearing & Direction

| Function | Description |
|----------|-------------|
| `bearing(lat1, lon1, lat2, lon2) -> number` | Initial bearing in degrees (0-360) |
| `compassDirection(degrees) -> string` | 16-point compass abbreviation (e.g., "NE", "SSW") |
| `compassDirectionFull(degrees) -> string` | Full compass name (e.g., "northeast", "south-southwest") |

### Midpoint & Great Circle

| Function | Description |
|----------|-------------|
| `midpoint(lat1, lon1, lat2, lon2) -> [number, number]` | Geographic midpoint [lat, lon] |
| `greatCirclePoints(lat1, lon1, lat2, lon2, numPoints?) -> [number, number][]` | Points along the great circle arc |
| `antipodalPoint(lat, lon) -> [number, number]` | Point on the opposite side of Earth |

### Travel Time Estimates

| Function | Description |
|----------|-------------|
| `estimateFlightTime(distanceKm) -> number` | Flight time in minutes (variable speed + 30min overhead) |
| `estimateDriveTime(distanceKm, sameContinent?) -> number` | Drive time in minutes (1.3x road factor) |
| `estimateWalkTime(distanceKm) -> number` | Walk time in minutes (5 km/h, max 100 km) |

### Unit Conversion & Formatting

| Function | Description |
|----------|-------------|
| `kmToMiles(km) -> number` | Kilometers to miles |
| `kmToNauticalMiles(km) -> number` | Kilometers to nautical miles |
| `milesToKm(miles) -> number` | Miles to kilometers |
| `formatDistance(km) -> string` | Format with thousands separator (e.g., "12,345 km") |
| `formatDuration(minutes) -> string` | Human-readable duration (e.g., "2h 30m", "3d 5h") |

## TypeScript Types

```typescript
import type { DistanceResult } from "distancefyi";
```

## Features

- **Haversine formula**: Great-circle distance using WGS84 mean radius (6,371.0088 km)
- **16-point compass**: Bearing to compass direction (N, NNE, NE, ENE, E, ...)
- **Geographic midpoint**: True geodesic midpoint between two coordinates
- **Great circle arc**: Generate intermediate points for map rendering
- **Travel time estimates**: Flight (variable speed bands), drive (road factor), walk (5 km/h)
- **Unit conversion**: km, miles, and nautical miles
- **Human-readable formatting**: Distance with thousands separators, duration as "2h 30m"
- **Zero dependencies**: Pure TypeScript, no runtime deps
- **Type-safe**: Full TypeScript with strict mode
- **Tree-shakeable**: ESM with named exports
- **Fast**: All computations under 1ms

## Also Available for Python

```bash
pip install distancefyi
```

See the [Python package on PyPI](https://pypi.org/project/distancefyi/).

## FYIPedia Developer Tools

Part of the [FYIPedia](https://github.com/fyipedia) open-source developer tools ecosystem:

| Package | Description |
|---------|-------------|
| [colorfyi](https://www.npmjs.com/package/colorfyi) | Color conversion, WCAG contrast, harmonies -- [colorfyi.com](https://colorfyi.com/) |
| [emojifyi](https://www.npmjs.com/package/emojifyi) | Emoji lookup, search, encoding -- [emojifyi.com](https://emojifyi.com/) |
| [symbolfyi](https://www.npmjs.com/package/symbolfyi) | Symbol encoding, Unicode properties -- [symbolfyi.com](https://symbolfyi.com/) |
| [unicodefyi](https://www.npmjs.com/package/unicodefyi) | Unicode character info, encodings -- [unicodefyi.com](https://unicodefyi.com/) |
| [fontfyi](https://www.npmjs.com/package/fontfyi) | Google Fonts metadata, CSS -- [fontfyi.com](https://fontfyi.com/) |
| **[distancefyi](https://www.npmjs.com/package/distancefyi)** | **Distance, bearing, travel times -- [distancefyi.com](https://distancefyi.com/)** |
| [timefyi](https://www.npmjs.com/package/timefyi) | Timezone ops, time differences -- [timefyi.com](https://timefyi.com/) |
| [namefyi](https://www.npmjs.com/package/namefyi) | Korean romanization, Five Elements -- [namefyi.com](https://namefyi.com/) |
| [unitfyi](https://www.npmjs.com/package/unitfyi) | Unit conversion, 200 units -- [unitfyi.com](https://unitfyi.com/) |
| [holidayfyi](https://www.npmjs.com/package/holidayfyi) | Holiday dates, Easter calculation -- [holidayfyi.com](https://holidayfyi.com/) |

## Links

- [Interactive Distance Calculator](https://distancefyi.com/) -- Calculate distance between any two places
- [Python Package](https://pypi.org/project/distancefyi/) -- Same engine, Python version
- [Source Code](https://github.com/fyipedia/distancefyi-js) -- MIT licensed

## License

MIT

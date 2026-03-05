import { computeDistance, midpoint, formatDuration } from './dist/index.js'

const C = { r: '\x1b[0m', b: '\x1b[1m', d: '\x1b[2m', y: '\x1b[33m', g: '\x1b[32m', c: '\x1b[36m' }

// 1. NYC → London
const d = computeDistance(40.7128, -74.006, 51.5074, -0.1278)
console.log(`${C.b}${C.y}New York → London${C.r}`)
console.log(`  ${C.c}Distance${C.r} ${C.g}${d.distanceKm.toLocaleString()} km${C.r} ${C.d}(${d.distanceMiles.toLocaleString()} mi)${C.r}`)
console.log(`  ${C.c}Nautical${C.r} ${C.g}${d.distanceNm.toLocaleString()} nm${C.r}`)
console.log(`  ${C.c}Bearing ${C.r} ${C.g}${d.bearingDegrees.toFixed(1)}°${C.r} ${C.d}${d.compassDirectionFull}${C.r}`)

console.log()

// 2. Travel times
console.log(`${C.b}${C.y}Travel Time Estimates${C.r}`)
console.log(`  ${C.c}Flight${C.r} ${C.g}${formatDuration(d.flightTimeMinutes)}${C.r}`)
console.log(`  ${C.c}Drive ${C.r} ${C.g}${formatDuration(d.driveTimeMinutes)}${C.r}`)

console.log()

// 3. Midpoint
const mid = midpoint(40.7128, -74.006, 51.5074, -0.1278)
console.log(`${C.b}${C.y}Midpoint${C.r}`)
console.log(`  ${C.c}Lat${C.r} ${C.g}${mid[0].toFixed(4)}${C.r}  ${C.c}Lon${C.r} ${C.g}${mid[1].toFixed(4)}${C.r}`)
console.log(`  ${C.d}(North Atlantic Ocean)${C.r}`)

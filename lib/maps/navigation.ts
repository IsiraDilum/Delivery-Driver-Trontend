import { distanceBetween } from './format'
import type { LatLng, RouteLeg } from './types'

/** Decodes Google's encoded polyline format (https://developers.google.com/maps/documentation/utilities/polylinealgorithm). */
export function decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = []
    let index = 0
    let lat = 0
    let lng = 0
    while (index < encoded.length) {
        for (let axis = 0; axis < 2; axis++) {
            let result = 0
            let shift = 0
            let byte: number
            do {
                byte = encoded.charCodeAt(index++) - 63
                result |= (byte & 0x1f) << shift
                shift += 5
            } while (byte >= 0x20)
            const delta = result & 1 ? ~(result >> 1) : result >> 1
            if (axis === 0) lat += delta
            else lng += delta
        }
        points.push({ lat: lat / 1e5, lng: lng / 1e5 })
    }
    return points
}

/**
 * Snaps a position onto a path.
 * `offset`: meters from the position to the path. `remaining`: meters along the path from the snapped point to its end.
 */
function projectOntoPath(path: LatLng[], pos: LatLng) {
    if (path.length === 0) return { offset: Infinity, remaining: 0 }
    if (path.length === 1) return { offset: distanceBetween(pos, path[0]), remaining: 0 }

    // Flat-earth approximation around `pos`, accurate enough over a few kilometres
    const kx = 111320 * Math.cos((pos.lat * Math.PI) / 180)
    const ky = 110540
    const toXY = (p: LatLng) => ({ x: (p.lng - pos.lng) * kx, y: (p.lat - pos.lat) * ky })

    let best = { offset: Infinity, segment: 0, t: 0 }
    for (let i = 0; i < path.length - 1; i++) {
        const a = toXY(path[i])
        const b = toXY(path[i + 1])
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len2 = dx * dx + dy * dy
        const t = len2 ? Math.min(1, Math.max(0, -(a.x * dx + a.y * dy) / len2)) : 0
        const offset = Math.hypot(a.x + t * dx, a.y + t * dy)
        if (offset < best.offset) best = { offset, segment: i, t }
    }

    let remaining = distanceBetween(path[best.segment], path[best.segment + 1]) * (1 - best.t)
    for (let i = best.segment + 1; i < path.length - 1; i++) remaining += distanceBetween(path[i], path[i + 1])
    return { offset: best.offset, remaining }
}

export type NavProgress = {
    /** Step the driver is currently driving along. Its *next* step holds the upcoming maneuver. */
    stepIndex: number
    /** Meters until the upcoming maneuver */
    toManeuver: number
    /** Meters until the end of the leg */
    remaining: number
    offRoute: boolean
}

// How many steps ahead to look for the driver. Small, so a later step passing nearby isn't picked by mistake.
const LOOKAHEAD_STEPS = 4
const OFF_ROUTE_M = 50

/** Works out where the driver is on the leg. Steps never move backwards past `fromStep`. */
export function trackProgress(
    leg: RouteLeg,
    stepPaths: LatLng[][],
    pos: LatLng,
    fromStep: number,
    accuracy = 0
): NavProgress {
    const last = Math.min(leg.steps.length - 1, fromStep + LOOKAHEAD_STEPS)
    let best = { stepIndex: fromStep, offset: Infinity, remaining: leg.steps[fromStep]?.distanceMeters ?? 0 }
    for (let i = fromStep; i <= last; i++) {
        const p = projectOntoPath(stepPaths[i] ?? [], pos)
        if (p.offset < best.offset) best = { stepIndex: i, offset: p.offset, remaining: p.remaining }
    }

    const after = leg.steps.slice(best.stepIndex + 1).reduce((sum, s) => sum + s.distanceMeters, 0)
    return {
        stepIndex: best.stepIndex,
        toManeuver: best.remaining,
        remaining: best.remaining + after,
        // Poor GPS fixes can be tens of meters out, so never call off-route inside the accuracy circle
        offRoute: best.offset > Math.max(OFF_ROUTE_M, accuracy),
    }
}

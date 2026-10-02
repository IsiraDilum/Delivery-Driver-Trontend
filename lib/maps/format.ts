import type { LatLng } from './types'

export function formatDistance(meters: number) {
    if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`
    return `${(meters / 1000).toFixed(1)} km`
}

export function formatDuration(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60))
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} h ${m} min` : `${h} h`
}

const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

/** "6:55 AM" */
export function formatClock(timestamp: number) {
    return clock.format(timestamp)
}

/** { time: "6:55", period: "AM" } */
export function formatClockParts(timestamp: number) {
    const parts = clock.formatToParts(timestamp)
    return {
        time: parts
            .filter((p) => p.type !== 'dayPeriod')
            .map((p) => p.value)
            .join('')
            .trim(),
        period: parts.find((p) => p.type === 'dayPeriod')?.value ?? '',
    }
}

/** Great-circle distance in meters. */
export function distanceBetween(a: LatLng, b: LatLng) {
    const R = 6371000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(b.lat - a.lat)
    const dLng = toRad(b.lng - a.lng)
    const h =
        Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(h))
}

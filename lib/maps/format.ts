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

const longDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

/** "Friday, 2 October" */
export function formatLongDate(timestamp: number) {
    const p = Object.fromEntries(longDate.formatToParts(timestamp).map((x) => [x.type, x.value]))
    return `${p.weekday}, ${p.day} ${p.month}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "25 Sep" */
export function formatDayMonth(timestamp: number) {
    const d = new Date(timestamp)
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** "25 Sep 2026" */
export function formatShortDate(timestamp: number) {
    return `${formatDayMonth(timestamp)} ${new Date(timestamp).getFullYear()}`
}

/** "Good morning" / "Good afternoon" / "Good evening" for the given time */
export function greeting(timestamp: number) {
    const hour = new Date(timestamp).getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
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

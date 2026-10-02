import type { LatLng, RouteRequest, RouteResult } from './types'

// Server-only: reads the private key. Import from route handlers / server code only.

const ROUTES_ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes'

// The Routes API bills by the fields requested, so only ask for what the UI uses.
const FIELD_MASK = [
    'routes.distanceMeters',
    'routes.duration',
    'routes.polyline.encodedPolyline',
    'routes.legs.distanceMeters',
    'routes.legs.duration',
    'routes.legs.steps.distanceMeters',
    'routes.legs.steps.staticDuration',
    'routes.legs.steps.navigationInstruction',
    'routes.legs.steps.startLocation',
    'routes.legs.steps.endLocation',
    'routes.legs.steps.polyline.encodedPolyline',
].join(',')

type ApiLatLng = { latLng?: { latitude?: number; longitude?: number } }

type ApiStep = {
    distanceMeters?: number
    staticDuration?: string
    startLocation?: ApiLatLng
    endLocation?: ApiLatLng
    navigationInstruction?: { maneuver?: string; instructions?: string }
    polyline?: { encodedPolyline?: string }
}

type ApiRoute = {
    distanceMeters?: number
    duration?: string
    polyline?: { encodedPolyline?: string }
    legs?: { distanceMeters?: number; duration?: string; steps?: ApiStep[] }[]
}

type ApiResponse = { routes?: ApiRoute[]; error?: { message?: string } }

export class RoutesApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message)
        this.name = 'RoutesApiError'
    }
}

function toWaypoint({ lat, lng }: LatLng) {
    return { location: { latLng: { latitude: lat, longitude: lng } } }
}

function fromApiLatLng(p?: ApiLatLng): LatLng {
    return { lat: p?.latLng?.latitude ?? 0, lng: p?.latLng?.longitude ?? 0 }
}

// Durations come back as "863s"
function parseSeconds(duration?: string) {
    return duration ? Math.round(parseFloat(duration)) : 0
}

export async function computeRoute({ origin, stops }: RouteRequest): Promise<RouteResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) throw new RoutesApiError('GOOGLE_MAPS_API_KEY is not set', 500)

    const destination = stops[stops.length - 1]
    const res = await fetch(ROUTES_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({
            origin: toWaypoint(origin),
            destination: toWaypoint(destination),
            intermediates: stops.slice(0, -1).map(toWaypoint),
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            languageCode: 'en',
            units: 'METRIC',
        }),
        cache: 'no-store',
    })

    const data = (await res.json().catch(() => ({}))) as ApiResponse
    if (!res.ok) {
        console.error('Routes API error', res.status, data.error?.message)
        throw new RoutesApiError('Could not calculate the route', 502)
    }

    const route = data.routes?.[0]
    if (!route) throw new RoutesApiError('No drivable route found for these stops', 404)

    return {
        distanceMeters: route.distanceMeters ?? 0,
        durationSeconds: parseSeconds(route.duration),
        encodedPolyline: route.polyline?.encodedPolyline ?? '',
        legs: (route.legs ?? []).map((leg) => ({
            distanceMeters: leg.distanceMeters ?? 0,
            durationSeconds: parseSeconds(leg.duration),
            steps: (leg.steps ?? []).map((step) => ({
                distanceMeters: step.distanceMeters ?? 0,
                durationSeconds: parseSeconds(step.staticDuration),
                // Extra lines are landmark hints ("Pass by …"); the first line is the maneuver
                instruction: step.navigationInstruction?.instructions?.split('\n')[0] ?? '',
                maneuver: step.navigationInstruction?.maneuver ?? 'STRAIGHT',
                start: fromApiLatLng(step.startLocation),
                end: fromApiLatLng(step.endLocation),
                polyline: step.polyline?.encodedPolyline ?? '',
            })),
        })),
    }
}

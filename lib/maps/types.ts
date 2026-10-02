export type LatLng = { lat: number; lng: number }

export type RouteStep = {
    distanceMeters: number
    durationSeconds: number
    instruction: string
    maneuver: string
    start: LatLng
    end: LatLng
    /** Encoded road geometry of this step, used to track progress along it */
    polyline: string
}

export type RouteLeg = {
    distanceMeters: number
    durationSeconds: number
    steps: RouteStep[]
}

export type RouteResult = {
    distanceMeters: number
    durationSeconds: number
    encodedPolyline: string
    legs: RouteLeg[]
}

export type RouteRequest = {
    origin: LatLng
    stops: LatLng[]
}

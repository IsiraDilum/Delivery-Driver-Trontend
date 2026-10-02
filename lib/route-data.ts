import type { LatLng, RouteRequest } from '@/lib/maps/types'

export type Stop = {
    id: string
    name: string
    address: string
    location: LatLng
    packages: number
    window: string
    instructions: string
    category: string
}

export const ROUTE_ID = 'LP-6387'

export const DEPOT = {
    name: 'Peliyagoda depot',
    location: { lat: 6.9682715, lng: 79.888416 },
}

export const STOPS: Stop[] = [
    {
        id: 'northgate-market',
        name: 'Northgate Market',
        address: '42 Negombo Road, Peliyagoda',
        location: { lat: 6.9621995, lng: 79.8815489 },
        packages: 5,
        window: '6:30–8:00 AM',
        instructions: 'Rear loading bay · enter from Station Road',
        category: 'Fresh',
    },
    {
        id: 'riverside-grocer',
        name: 'Riverside Grocer',
        address: '14 Grandpass Road, Colombo 14',
        location: { lat: 6.9438708, lng: 79.8696259 },
        packages: 4,
        window: '6:00–8:00 AM',
        instructions: 'Curbside unloading · contact receiver on arrival',
        category: 'Fresh',
    },
    {
        id: 'harbour-foods',
        name: 'Harbour Foods',
        address: 'George R. de Silva Mawatha, Colombo 13',
        location: { lat: 6.9477493, lng: 79.8613645 },
        packages: 6,
        window: '8:00–10:00 AM',
        instructions: 'Side gate · ask security for the goods-in desk',
        category: 'Frozen',
    },
    {
        id: 'pettah-central',
        name: 'Pettah Central Mart',
        address: '11 Main Street, Colombo 11',
        location: { lat: 6.9371198, lng: 79.8496385 },
        packages: 4,
        window: '9:00–11:00 AM',
        instructions: 'Short-stay bay on Main Street · max 15 minutes',
        category: 'Dry',
    },
]

// Until stop progress comes from the backend, the driver is always on the first stop.
export const CURRENT_STOP_INDEX = 0

export const TOTAL_PACKAGES = STOPS.reduce((sum, s) => sum + s.packages, 0)

/** The full day's route, starting from the depot. */
export const PLANNED_ROUTE: RouteRequest = {
    origin: DEPOT.location,
    stops: STOPS.map((s) => s.location),
}

'use client'

import { useEffect, useRef } from 'react'
import {
    AdvancedMarker,
    APILoadingStatus,
    ColorScheme,
    Map,
    Polyline,
    useApiLoadingStatus,
    useMap,
} from '@vis.gl/react-google-maps'
import { Warehouse } from 'lucide-react'
import type { LatLng, RouteResult } from '@/lib/maps/types'
import type { Stop } from '@/lib/route-data'
import { useIsDarkTheme } from '@/lib/use-is-dark-theme'
import { MAPS_API_KEY, MAPS_MAP_ID } from './maps-provider'

type Props = {
    route: RouteResult | null
    stops: Stop[]
    /** Index into `stops` of the stop the driver is heading to */
    activeIndex?: number
    depot?: LatLng
    driver?: LatLng | null
    /** Points the camera frames; defaults to the depot and every stop */
    fitPoints?: LatLng[]
    /** The camera re-frames when this changes (or the map resizes), not on every GPS update, so it doesn't fight the user's panning */
    fitKey?: string
    padding?: google.maps.Padding
    /** Full gestures for the navigation screen; overview maps need two fingers so the page can scroll */
    interactive?: boolean
    /** `fit` frames `fitPoints`, `follow` tracks `driver` like a satnav, `free` leaves the camera to the user */
    camera?: 'fit' | 'follow' | 'free'
    /** Called when the user drags the map, e.g. to pause following */
    onUserPan?: () => void
    status?: string | null
}

const FOLLOW_ZOOM = 17

export function RouteMap(props: Props) {
    if (!MAPS_API_KEY) {
        return <MapStatus message="Map unavailable · NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set" />
    }
    return <RouteMapInner {...props} />
}

function RouteMapInner({
    route,
    stops,
    activeIndex = 0,
    depot,
    driver,
    fitPoints,
    fitKey,
    padding = { top: 44, right: 44, bottom: 44, left: 44 },
    interactive = false,
    camera = 'fit',
    onUserPan,
    status,
}: Props) {
    const isDark = useIsDarkTheme()
    const apiStatus = useApiLoadingStatus()

    if (apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE) {
        return <MapStatus message="Google Maps failed to load · check the API key and enabled APIs" />
    }

    const points = fitPoints ?? [...(depot ? [depot] : []), ...stops.map((s) => s.location)]

    return (
        <div className="map-canvas">
            <Map
                mapId={MAPS_MAP_ID}
                defaultBounds={{ ...boundsOf(points), padding }}
                isFractionalZoomEnabled
                disableDefaultUI
                clickableIcons={false}
                gestureHandling={interactive ? 'greedy' : 'cooperative'}
                colorScheme={isDark ? ColorScheme.DARK : ColorScheme.LIGHT}
                style={{ width: '100%', height: '100%' }}
            >
                {camera === 'fit' && (
                    <FitBounds points={points} padding={padding} fitKey={fitKey ?? stops.map((s) => s.id).join()} />
                )}
                {camera === 'follow' && driver && <FollowCamera position={driver} />}
                {onUserPan && <UserPanListener onUserPan={onUserPan} />}

                {route?.encodedPolyline && (
                    <>
                        <Polyline
                            encodedPath={route.encodedPolyline}
                            strokeColor={isDark ? '#141a16' : '#ffffff'}
                            strokeOpacity={0.9}
                            strokeWeight={9}
                            zIndex={1}
                        />
                        <Polyline
                            encodedPath={route.encodedPolyline}
                            strokeColor={isDark ? '#9d7bff' : '#6734ed'}
                            strokeWeight={5}
                            zIndex={2}
                        />
                    </>
                )}

                {depot && (
                    <AdvancedMarker position={depot} title="Depot" anchorLeft="-50%" anchorTop="-50%" zIndex={5}>
                        <div className="map-marker map-marker-depot">
                            <Warehouse size={16} aria-hidden="true" />
                        </div>
                    </AdvancedMarker>
                )}

                {stops.map((stop, i) => (
                    <AdvancedMarker
                        key={stop.id}
                        position={stop.location}
                        title={`Stop ${i + 1}: ${stop.name}`}
                        anchorLeft="-50%"
                        anchorTop="-50%"
                        zIndex={i === activeIndex ? 20 : 10}
                    >
                        <div
                            className={[
                                'map-marker',
                                i === activeIndex && 'active',
                                i < activeIndex && 'done',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {i + 1}
                        </div>
                    </AdvancedMarker>
                ))}

                {driver && (
                    <AdvancedMarker position={driver} title="Your location" anchorLeft="-50%" anchorTop="-50%" zIndex={30}>
                        <div className="map-marker-driver" />
                    </AdvancedMarker>
                )}
            </Map>
            {status && <span className="map-label">{status}</span>}
        </div>
    )
}

// A single point would zoom in to street level, so pad the box to roughly 1 km
const MIN_SPAN_DEG = 0.01

function boundsOf(points: LatLng[]): google.maps.LatLngBoundsLiteral {
    const lats = points.map((p) => p.lat)
    const lngs = points.map((p) => p.lng)
    let [south, north, west, east] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
    if (north - south < MIN_SPAN_DEG) [south, north] = [south - MIN_SPAN_DEG / 2, north + MIN_SPAN_DEG / 2]
    if (east - west < MIN_SPAN_DEG) [west, east] = [west - MIN_SPAN_DEG / 2, east + MIN_SPAN_DEG / 2]
    return { south, north, west, east }
}

/**
 * `defaultBounds` only gives a rough first frame: it's applied before the map has its final size.
 * Frame again whenever the map's container is resized, and when `fitKey` changes.
 */
function FitBounds({ points, padding, fitKey }: { points: LatLng[]; padding: google.maps.Padding; fitKey: string }) {
    const map = useMap()
    const latest = useRef({ points, padding })
    latest.current = { points, padding }

    useEffect(() => {
        if (!map) return
        const div = map.getDiv()
        const observer = new ResizeObserver(() => {
            const { points, padding } = latest.current
            if (points.length === 0 || !div.clientWidth || !div.clientHeight) return
            map.fitBounds(boundsOf(points), padding)
        })
        // Fires once immediately with the current size, then on every resize
        observer.observe(div)
        return () => observer.disconnect()
    }, [map, fitKey])

    return null
}

/** Keeps the driver in the middle of the map. Zooms in on mount, then pans smoothly with each GPS update. */
function FollowCamera({ position }: { position: LatLng }) {
    const map = useMap()
    const zoomedMap = useRef<google.maps.Map | null>(null)

    useEffect(() => {
        if (!map) return
        if (zoomedMap.current !== map) {
            zoomedMap.current = map
            map.moveCamera({ center: position, zoom: FOLLOW_ZOOM })
        } else {
            map.panTo(position)
        }
    }, [map, position.lat, position.lng])

    return null
}

function UserPanListener({ onUserPan }: { onUserPan: () => void }) {
    const map = useMap()
    useEffect(() => {
        if (!map) return
        const listener = map.addListener('dragstart', onUserPan)
        return () => listener.remove()
    }, [map, onUserPan])
    return null
}

function MapStatus({ message }: { message: string }) {
    return (
        <div className="map-canvas map-unavailable" role="status">
            <span className="map-label">{message}</span>
        </div>
    )
}

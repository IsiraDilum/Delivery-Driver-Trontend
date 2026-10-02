'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowUp,
    ArrowUpLeft,
    ArrowUpRight,
    BellRing,
    CheckCheck,
    Clock3,
    CornerUpLeft,
    CornerUpRight,
    LocateFixed,
    MapPin,
    Merge,
    Navigation,
    Redo2,
    RotateCcw,
    RotateCw,
    Ship,
    Undo2,
    Volume2,
    VolumeX,
    X,
    type LucideIcon,
} from 'lucide-react'
import { useModal } from '@/components/app-shell'
import { RouteMap } from '@/components/maps/route-map'
import { distanceBetween, formatClock, formatDistance, formatDuration } from '@/lib/maps/format'
import { decodePolyline, trackProgress, type NavProgress } from '@/lib/maps/navigation'
import type { LatLng } from '@/lib/maps/types'
import { useGeolocation } from '@/lib/maps/use-geolocation'
import { useRoute } from '@/lib/maps/use-route'
import { speak, spokenDistance, stopSpeaking } from '@/lib/maps/voice'
import { CURRENT_STOP_INDEX, DEPOT, STOPS } from '@/lib/route-data'
import { useWakeLock } from '@/lib/use-wake-lock'

// Before navigation starts, refresh the preview route after the driver has moved this far
const PREVIEW_REROUTE_M = 250
// While navigating, recalculate at most this often when the driver leaves the route
const OFF_ROUTE_RETRY_MS = 10_000
// Skip the reroute on "Start" if the current route already begins this close to the driver
const START_REROUTE_M = 30
const ARRIVAL_RADIUS_M = 60
// Within this distance the prompt becomes "Turn right onto …" instead of "In 300 metres, …"
const PROMPT_NOW_M = 80

const MANEUVER_ICONS: Record<string, LucideIcon> = {
    TURN_LEFT: CornerUpLeft,
    TURN_SHARP_LEFT: CornerUpLeft,
    TURN_RIGHT: CornerUpRight,
    TURN_SHARP_RIGHT: CornerUpRight,
    TURN_SLIGHT_LEFT: ArrowUpLeft,
    FORK_LEFT: ArrowUpLeft,
    RAMP_LEFT: ArrowUpLeft,
    TURN_SLIGHT_RIGHT: ArrowUpRight,
    FORK_RIGHT: ArrowUpRight,
    RAMP_RIGHT: ArrowUpRight,
    UTURN_LEFT: Undo2,
    UTURN_RIGHT: Redo2,
    ROUNDABOUT_LEFT: RotateCcw,
    ROUNDABOUT_RIGHT: RotateCw,
    MERGE: Merge,
    FERRY: Ship,
    FERRY_TRAIN: Ship,
    DESTINATION: MapPin,
}

const stop = STOPS[CURRENT_STOP_INDEX]
const remainingStops = STOPS.slice(CURRENT_STOP_INDEX).map((s) => s.location)

export default function RouteMapPage() {
    const setModal = useModal()
    const geo = useGeolocation()
    const [navigating, setNavigating] = useState(false)
    const [following, setFollowing] = useState(true)
    const [muted, setMuted] = useState(false)
    useWakeLock(navigating)

    // Where the current route was calculated from. The depot is used until (or unless) GPS is available.
    const [routeOrigin, setRouteOrigin] = useState<LatLng>(DEPOT.location)
    const [hasGpsRoute, setHasGpsRoute] = useState(false)
    const lastRerouteAt = useRef(0)

    const request = useMemo(() => ({ origin: routeOrigin, stops: remainingStops }), [routeOrigin])
    const { route, fetchedAt, error } = useRoute(request)
    const leg = route?.legs[0]
    const stepPaths = useMemo(() => leg?.steps.map((s) => decodePolyline(s.polyline)) ?? [], [leg])

    // Furthest step reached on the current route, so progress never jumps backwards
    const [stepFloor, setStepFloor] = useState({ routeAt: 0, index: 0 })
    const fromStep = stepFloor.routeAt === fetchedAt ? stepFloor.index : 0

    const progress = useMemo<NavProgress | null>(() => {
        if (!leg) return null
        if (!geo.position) {
            return {
                stepIndex: 0,
                toManeuver: leg.steps[0]?.distanceMeters ?? 0,
                remaining: leg.distanceMeters,
                offRoute: false,
            }
        }
        return trackProgress(leg, stepPaths, geo.position, fromStep, geo.accuracy ?? 0)
    }, [leg, stepPaths, geo.position, geo.accuracy, fromStep])

    useEffect(() => {
        if (progress && progress.stepIndex > fromStep) {
            setStepFloor({ routeAt: fetchedAt, index: progress.stepIndex })
        }
    }, [progress, fromStep, fetchedAt])

    const reroute = useCallback((from: LatLng) => {
        lastRerouteAt.current = Date.now()
        setRouteOrigin(from)
        setHasGpsRoute(true)
    }, [])

    useEffect(() => {
        const pos = geo.position
        if (!pos) return
        const shouldReroute =
            !hasGpsRoute ||
            (navigating
                ? !!progress?.offRoute && Date.now() - lastRerouteAt.current > OFF_ROUTE_RETRY_MS
                : distanceBetween(routeOrigin, pos) > PREVIEW_REROUTE_M)
        if (shouldReroute) reroute(pos)
    }, [geo.position, hasGpsRoute, navigating, progress?.offRoute, routeOrigin, reroute])

    const steps = leg?.steps ?? []
    const stepIndex = progress?.stepIndex ?? 0
    // A step's instruction describes the maneuver at its start, so the upcoming turn is on the next step
    const maneuverStep = steps[stepIndex + 1]
    const thenStep = steps[stepIndex + 2]
    // Some steps (often the last) come back without an instruction
    const instruction = maneuverStep?.instruction || `Arrive at ${stop.name}`
    const thenInstruction = thenStep ? thenStep.instruction || `arrive at ${stop.name}` : ''

    const arrived =
        !!geo.position &&
        (distanceBetween(geo.position, stop.location) < ARRIVAL_RADIUS_M ||
            (navigating && !!progress && !progress.offRoute && progress.remaining < 30))

    const remainingSeconds =
        leg && progress && leg.distanceMeters
            ? (leg.durationSeconds * progress.remaining) / leg.distanceMeters
            : null
    const eta =
        remainingSeconds !== null ? Math.max(fetchedAt, geo.timestamp ?? 0) + remainingSeconds * 1000 : null

    // Voice guidance: each prompt is spoken once per step of each route
    const announced = useRef(new Set<string>())
    const say = useCallback(
        (key: string, text: string, interrupt = false) => {
            if (announced.current.has(key)) return
            announced.current.add(key)
            if (!muted) speak(text, { interrupt })
        },
        [muted]
    )

    useEffect(() => {
        if (!navigating || !progress || !leg) return
        if (arrived) {
            say(`arrived:${stop.id}`, `You have arrived at ${stop.name}`, true)
            return
        }
        if (progress.offRoute) {
            say(`off-route:${fetchedAt}`, 'Recalculating route', true)
            return
        }
        const key = `${fetchedAt}:${stepIndex}`
        if (progress.toManeuver <= PROMPT_NOW_M) {
            say(`${key}:now`, instruction, true)
        } else {
            // A heads-up given close to the turn makes the "now" prompt redundant
            if (progress.toManeuver < PROMPT_NOW_M * 2) announced.current.add(`${key}:now`)
            say(`${key}:ahead`, `In ${spokenDistance(progress.toManeuver)}, ${instruction}`)
        }
    }, [navigating, progress, leg, arrived, fetchedAt, stepIndex, instruction, say])

    useEffect(() => {
        if (muted) stopSpeaking()
    }, [muted])

    // Stop talking if the driver leaves the screen mid-route
    useEffect(() => stopSpeaking, [])

    function startNavigation() {
        announced.current.clear()
        setFollowing(true)
        setNavigating(true)
        if (geo.position && distanceBetween(routeOrigin, geo.position) > START_REROUTE_M) reroute(geo.position)
        // Speaking from the tap also unlocks speech on iOS, which blocks audio not started by a gesture
        if (!muted) speak(`Starting navigation to ${stop.name}`, { interrupt: true })
    }

    function endNavigation() {
        setNavigating(false)
        stopSpeaking()
    }

    const pauseFollowing = useCallback(() => setFollowing(false), [])

    const ManeuverIcon = arrived ? CheckCheck : MANEUVER_ICONS[maneuverStep?.maneuver || 'DESTINATION'] ?? ArrowUp
    const locationBlocked = geo.status === 'denied' || geo.status === 'unavailable'

    const gpsLabel = {
        pending: navigating ? 'Waiting for GPS…' : 'Locating…',
        active: progress?.offRoute && navigating ? 'Off route · recalculating' : `GPS ±${Math.round(geo.accuracy ?? 0)} m`,
        denied: 'Location off · route from depot',
        unavailable: 'No GPS · route from depot',
    }[geo.status]

    return (
        <main className={navigating ? 'content nav-page navigating' : 'content nav-page'}>
            <header className="nav-topbar">
                <Link href="/route" className="nav-back" aria-label="Back to route overview">
                    <ArrowLeft size={20} aria-hidden="true" />
                </Link>
                <h1>Navigation</h1>
                <span className="nav-progress">
                    Stop {CURRENT_STOP_INDEX + 1} of {STOPS.length}
                </span>
            </header>

            <div className="map nav-map" aria-label={`Navigation map to ${stop.name}`}>
                <RouteMap
                    route={route}
                    stops={STOPS}
                    activeIndex={CURRENT_STOP_INDEX}
                    depot={geo.position ? undefined : DEPOT.location}
                    driver={geo.position}
                    fitPoints={[geo.position ?? DEPOT.location, stop.location]}
                    fitKey={`${stop.id}:${geo.position ? 'gps' : 'depot'}`}
                    padding={{ top: 160, right: 44, bottom: 80, left: 44 }}
                    interactive
                    camera={navigating && geo.position ? (following ? 'follow' : 'free') : 'fit'}
                    onUserPan={navigating ? pauseFollowing : undefined}
                />

                <div className={navigating ? 'nav-turn navigating' : 'nav-turn'} aria-live="polite">
                    <span className="nav-turn-icon">
                        <ManeuverIcon size={navigating ? 28 : 22} aria-hidden="true" />
                    </span>
                    <div className="nav-turn-text">
                        {arrived ? (
                            <>
                                <strong>You&apos;ve arrived</strong>
                                <span>{stop.name}</span>
                            </>
                        ) : error && !route ? (
                            <>
                                <strong>Route unavailable</strong>
                                <span>{error}</span>
                            </>
                        ) : progress ? (
                            <>
                                <strong>{formatDistance(progress.toManeuver)}</strong>
                                <span>{instruction}</span>
                                {navigating && thenInstruction && (
                                    <em className="nav-turn-then">
                                        Then {thenInstruction.charAt(0).toLowerCase() + thenInstruction.slice(1)}
                                    </em>
                                )}
                            </>
                        ) : (
                            <>
                                <strong>Calculating route…</strong>
                                <span>{stop.address}</span>
                            </>
                        )}
                    </div>
                </div>

                {navigating && geo.position && !following && (
                    <button type="button" className="nav-map-button nav-recenter" onClick={() => setFollowing(true)}>
                        <LocateFixed size={18} aria-hidden="true" /> Recenter
                    </button>
                )}

                {navigating && (
                    <button
                        type="button"
                        className="nav-map-button nav-mute"
                        onClick={() => setMuted((m) => !m)}
                        aria-pressed={muted}
                        aria-label={muted ? 'Unmute voice guidance' : 'Mute voice guidance'}
                    >
                        {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
                    </button>
                )}

                <span className="nav-gps">{gpsLabel}</span>

                <button
                    type="button"
                    className="nav-emergency"
                    onClick={() => setModal('incident')}
                    aria-label="Report an emergency"
                >
                    <BellRing size={20} aria-hidden="true" />
                    Emergency
                </button>
            </div>

            <section className="nav-card" aria-label="Current stop details">
                {!navigating && (
                    <div className="nav-card-row">
                        <span className="status-purple">
                            STOP {CURRENT_STOP_INDEX + 1} · {stop.category.toUpperCase()}
                        </span>
                        <small>{progress ? `${formatDistance(progress.remaining)} away` : '—'}</small>
                    </div>
                )}

                <div className="nav-card-row nav-card-main">
                    <div>
                        <h2>{stop.name}</h2>
                        <p>{stop.address}</p>
                    </div>
                    <div className="nav-eta">
                        <strong>{eta ? formatClock(eta) : '--:--'}</strong>
                        <small>ETA</small>
                    </div>
                </div>

                {navigating ? (
                    <div className="nav-trip-stats">
                        <span>
                            <b>{progress ? formatDistance(progress.remaining) : '—'}</b> to go
                        </span>
                        <span>
                            <b>{remainingSeconds !== null ? formatDuration(remainingSeconds) : '—'}</b> drive
                        </span>
                        <span>
                            <b>{stop.window}</b> window
                        </span>
                    </div>
                ) : (
                    <span className="nav-window">
                        <Clock3 size={16} aria-hidden="true" /> Delivery window {stop.window}
                    </span>
                )}

                {arrived && (
                    <Link href="/delivery" className="nav-cta">
                        <CheckCheck size={18} aria-hidden="true" /> Confirm delivery
                    </Link>
                )}

                {navigating ? (
                    <button type="button" className="nav-cta secondary" onClick={endNavigation}>
                        <X size={18} aria-hidden="true" /> End navigation
                    </button>
                ) : (
                    !arrived && (
                        <>
                            <button
                                type="button"
                                className="nav-cta"
                                onClick={startNavigation}
                                disabled={!route || locationBlocked}
                            >
                                <Navigation size={18} aria-hidden="true" /> Start navigation
                            </button>
                            {locationBlocked && (
                                <p className="helper center">Turn on location to get turn-by-turn directions.</p>
                            )}
                        </>
                    )
                )}
            </section>
        </main>
    )
}

'use client'

import Link from 'next/link'
import { ArrowRight, BellRing, MapPin, SlidersHorizontal } from 'lucide-react'
import { useModal } from '@/components/app-shell'
import { RouteMap } from '@/components/maps/route-map'
import { formatDistance, formatDuration } from '@/lib/maps/format'
import { useRoute } from '@/lib/maps/use-route'
import { CURRENT_STOP_INDEX, DEPOT, PLANNED_ROUTE, STOPS } from '@/lib/route-data'

export default function RoutePage() {
    const setModal = useModal()
    const { route, error } = useRoute(PLANNED_ROUTE)

    return (
        <main className="content route-page">
            <div className="page-heading">
                <div>
                    <h1>Your route</h1>
                    <p>One stop at a time. You&apos;re on track.</p>
                </div>
                <button
                    className="alert-tile"
                    onClick={() => setModal('incident')}
                    aria-label="Open emergency incident report"
                >
                    <BellRing size={35} />
                </button>
            </div>

            <section className="panel map-panel">
                <div className="card-row">
                    <h2>Route at a glance</h2>
                    <Link href="/route/map" className="text-button">
                        View route <ArrowRight size={24} />
                    </Link>
                </div>
                <div className="map" aria-label={`Route map with ${STOPS.length} stops`}>
                    <RouteMap
                        route={route}
                        stops={STOPS}
                        activeIndex={CURRENT_STOP_INDEX}
                        depot={DEPOT.location}
                        status={error ?? (route ? null : 'Loading route…')}
                    />
                </div>
                <div className="map-footer">
          <span>
            <MapPin size={24} />
              {DEPOT.name}
          </span>
                    <b>
                        {STOPS.length} stops
                        {route && ` · ${formatDistance(route.distanceMeters)} · ${formatDuration(route.durationSeconds)}`}
                    </b>
                </div>
            </section>

            <section className="panel sequence">
                <div className="card-row">
                    <h2>Stop sequence</h2>
                    <SlidersHorizontal size={26} />
                </div>
                {STOPS.map((s, i) => {
                    const leg = route?.legs[i]
                    return (
                        <div className="sequence-row" key={s.id}>
                            <span className={i === CURRENT_STOP_INDEX ? 'number active' : 'number'}>{i + 1}</span>
                            <div>
                                <h3>{s.name}</h3>
                                <p>
                                    {s.packages} packages · {s.window}
                                    {leg && ` · ${formatDistance(leg.distanceMeters)}, ${formatDuration(leg.durationSeconds)} drive`}
                                </p>
                                <p>{s.instructions}</p>
                            </div>
                        </div>
                    )
                })}
            </section>
        </main>
    )
}

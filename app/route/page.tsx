'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BellRing, MapPin, SlidersHorizontal } from 'lucide-react'
import { useModal } from '@/components/app-shell'
import { RouteMap } from '@/components/maps/route-map'
import { formatDistance, formatDuration } from '@/lib/maps/format'
import { useRoute } from '@/lib/maps/use-route'
import { CURRENT_STOP_INDEX, DEPOT, PLANNED_ROUTE, STOPS, type Stop } from '@/lib/route-data'

type SortKey = 'route' | 'window' | 'packages'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'route', label: 'Route order' },
    { key: 'window', label: 'Earliest window' },
    { key: 'packages', label: 'Most packages' },
]

const CATEGORIES = [...new Set(STOPS.map((s) => s.category))]

/** Minutes since midnight for the start of a window like "6:30–8:00 AM" or "11:00 AM–1:00 PM". */
function windowStart(window: string) {
    const [start, end = ''] = window.split('–')
    const period = start.match(/AM|PM/)?.[0] ?? end.match(/AM|PM/)?.[0] ?? 'AM'
    const [h, m = 0] = start.replace(/AM|PM/, '').trim().split(':').map(Number)
    return ((h % 12) + (period === 'PM' ? 12 : 0)) * 60 + m
}

const SORTERS: Record<SortKey, (a: Stop, b: Stop) => number> = {
    route: () => 0,
    window: (a, b) => windowStart(a.window) - windowStart(b.window),
    packages: (a, b) => b.packages - a.packages,
}

export default function RoutePage() {
    const setModal = useModal()
    const { route, error } = useRoute(PLANNED_ROUTE)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [sort, setSort] = useState<SortKey>('route')
    const [category, setCategory] = useState<string | null>(null)
    const customised = sort !== 'route' || category !== null

    // Keep each stop's route position so its number stays the same when re-sorted
    const visibleStops = STOPS.map((stop, index) => ({ stop, index }))
        .filter(({ stop }) => !category || stop.category === category)
        .sort((a, b) => SORTERS[sort](a.stop, b.stop) || a.index - b.index)

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
                    <button
                        type="button"
                        className={optionsOpen || customised ? 'filter-toggle active' : 'filter-toggle'}
                        onClick={() => setOptionsOpen((open) => !open)}
                        aria-expanded={optionsOpen}
                        aria-controls="sequence-options"
                        aria-label="Sort and filter stops"
                    >
                        <SlidersHorizontal size={20} />
                        {customised && <span className="filter-toggle-dot" aria-hidden="true" />}
                    </button>
                </div>

                {optionsOpen && (
                    <div className="filter-panel" id="sequence-options">
                        <div className="chip-group" role="group" aria-label="Sort stops">
                            <span>Sort</span>
                            <div>
                                {SORT_OPTIONS.map((o) => (
                                    <button
                                        key={o.key}
                                        type="button"
                                        className="chip"
                                        aria-pressed={sort === o.key}
                                        onClick={() => setSort(o.key)}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="chip-group" role="group" aria-label="Filter stops by category">
                            <span>Show</span>
                            <div>
                                {[null, ...CATEGORIES].map((c) => (
                                    <button
                                        key={c ?? 'all'}
                                        type="button"
                                        className="chip"
                                        aria-pressed={category === c}
                                        onClick={() => setCategory(c)}
                                    >
                                        {c ?? 'All stops'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {customised && (
                            <button
                                type="button"
                                className="filter-reset"
                                onClick={() => {
                                    setSort('route')
                                    setCategory(null)
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                )}

                {customised && (
                    <p className="filter-summary">
                        Showing {visibleStops.length} of {STOPS.length} stops
                        {sort !== 'route' && ` · ${SORT_OPTIONS.find((o) => o.key === sort)?.label.toLowerCase()}`}
                    </p>
                )}

                {visibleStops.map(({ stop: s, index: i }) => {
                    const leg = route?.legs[i]
                    return (
                        <div className="sequence-row" key={s.id}>
                            <span className={i === CURRENT_STOP_INDEX ? 'number active' : 'number'}>{i + 1}</span>
                            <div>
                                <h3>{s.name}</h3>
                                <p>
                                    {s.packages} packages · {s.category} · {s.window}
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

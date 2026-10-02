'use client'

import { useState } from 'react'
import {
    ArrowRight,
    ClipboardList,
    Clock3,
    Navigation,
    Package,
    Route as RouteIcon,
    SlidersHorizontal,
    UploadCloud,
} from 'lucide-react'
import { formatDayMonth, formatShortDate } from '@/lib/maps/format'
import { useNow } from '@/lib/use-now'
import { JourneysPanel } from './journeys-panel'
import { TRIPS } from './trips'

type PeriodKey = '7d' | '30d' | 'all'

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
    { key: '7d', label: 'Last 7 days', days: 7 },
    { key: '30d', label: 'Last 30 days', days: 30 },
    { key: 'all', label: 'All time', days: Infinity },
]
const DEFAULT_PERIOD: PeriodKey = '30d'
const DAY = 86_400_000

export default function HistoryPage() {
    const now = useNow()
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [period, setPeriod] = useState<PeriodKey>(DEFAULT_PERIOD)
    const activePeriod = PERIODS.find((p) => p.key === period) ?? PERIODS[1]
    const customised = period !== DEFAULT_PERIOD

    const trips = TRIPS.filter((t) => t.daysAgo <= activePeriod.days)
    const count = trips.length
    const sum = (pick: (t: (typeof trips)[number]) => number) => trips.reduce((total, t) => total + pick(t), 0)
    const onTimeRate = count ? Math.round(sum((t) => t.onTime) / count) : null

    // Trip dates need the device's clock, so they're left out until it's available
    let range = activePeriod.label
    if (now !== null && count) {
        const newest = formatDayMonth(now - Math.min(...trips.map((t) => t.daysAgo)) * DAY)
        const oldest = formatDayMonth(now - Math.max(...trips.map((t) => t.daysAgo)) * DAY)
        range = newest === oldest ? newest : `${oldest} – ${newest}`
    }

    const metrics = [
        { label: 'Recent trips', value: String(count), unit: '', desc: count ? range : 'No trips in this period', Icon: RouteIcon },
        { label: 'On-time rate', value: onTimeRate === null ? '—' : String(onTimeRate), unit: onTimeRate === null ? '' : '%', desc: 'Average across trips', Icon: Clock3 },
        { label: 'Distance', value: String(sum((t) => t.km)), unit: 'km', desc: 'Completed trips', Icon: Navigation },
        { label: 'Packages', value: String(sum((t) => t.packages)), unit: '', desc: 'Handed over', Icon: Package },
    ]

    const journeys = trips.map((t) => ({
        id: t.id,
        meta: now === null ? t.duration : `${formatShortDate(now - t.daysAgo * DAY)} · ${t.duration}`,
        stops: t.stops,
        km: t.km,
        onTime: t.onTime,
    }))

    return (
        <main className="content history-page">
            <div className="page-heading">
                <div>
                    <h1>Trip history</h1>
                    <p className="eyebrow">{customised ? activePeriod.label.toUpperCase() : 'YOUR WORK, ALL IN ONE PLACE'}</p>
                </div>
                <button
                    type="button"
                    className={filtersOpen || customised ? 'filter-toggle active' : 'filter-toggle'}
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-expanded={filtersOpen}
                    aria-controls="history-filters"
                    aria-label="Filter trip history"
                >
                    <SlidersHorizontal size={20} />
                    {customised && <span className="filter-toggle-dot" aria-hidden="true" />}
                </button>
            </div>

            {filtersOpen && (
                <div className="filter-panel history-filters" id="history-filters">
                    <div className="chip-group" role="group" aria-label="Time period">
                        <span>Period</span>
                        <div>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    className="chip"
                                    aria-pressed={period === p.key}
                                    onClick={() => setPeriod(p.key)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {customised && (
                        <button type="button" className="filter-reset" onClick={() => setPeriod(DEFAULT_PERIOD)}>
                            Reset
                        </button>
                    )}
                </div>
            )}

            <div className="metric-grid">
                {metrics.map(({ label, value, unit, desc, Icon }) => (
                    <section className="metric-card" key={label}>
                        <div>
                            <Icon size={25} />
                            {label}
                        </div>
                        <b>
                            {value}
                            {unit && <small>{unit}</small>}
                        </b>
                        <p>{desc}</p>
                    </section>
                ))}
            </div>

            <JourneysPanel trips={journeys} />

            <section className="panel reports">
                <div className="card-row">
                    <h2>Reports &amp; records</h2>
                    <ClipboardList size={24} />
                </div>
                <div className="empty-state">
                    <ClipboardList size={42} />
                    <p>No reports yet</p>
                    <small>Your fine and fuel records will appear here.</small>
                </div>
            </section>

            <section className="panel sync-card">
                <UploadCloud size={24} />
                <div>
                    <b>Your records are up to date</b>
                    <p>Demo records stay on this device.</p>
                    <button>
                        View sync queue <ArrowRight size={18} />
                    </button>
                </div>
            </section>
        </main>
    )
}
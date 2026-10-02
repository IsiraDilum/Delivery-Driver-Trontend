'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Truck } from 'lucide-react'

type Trip = { id: string; meta: string; stops: number; km: number; onTime: number }

type FilterKey = 'all' | 'onTime' | 'delayed'

const FILTERS: { key: FilterKey; label: string; matches: (t: Trip) => boolean }[] = [
    { key: 'all', label: 'All trips', matches: () => true },
    { key: 'onTime', label: 'Fully on time', matches: (t) => t.onTime === 100 },
    { key: 'delayed', label: 'With delays', matches: (t) => t.onTime < 100 },
]

export function JourneysPanel({ trips: allTrips }: { trips: Trip[] }) {
    const [filter, setFilter] = useState<FilterKey>('all')
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0]
    const trips = allTrips.filter(active.matches)

    // Close on a tap outside the menu or Escape
    useEffect(() => {
        if (!open) return
        const onPointer = (e: PointerEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('pointerdown', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('pointerdown', onPointer)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <section className="panel journeys">
            <div className="card-row">
                <h2>Recent journeys</h2>
                <div className="select-menu" ref={menuRef}>
                    <button
                        type="button"
                        className={open ? 'select-button open' : 'select-button'}
                        onClick={() => setOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                    >
                        {active.label} <ChevronDown size={20} />
                    </button>
                    {open && (
                        <div className="select-options" role="listbox" aria-label="Filter journeys">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    type="button"
                                    role="option"
                                    aria-selected={f.key === filter}
                                    onClick={() => {
                                        setFilter(f.key)
                                        setOpen(false)
                                    }}
                                >
                                    {f.label}
                                    <span className="select-count">{allTrips.filter(f.matches).length}</span>
                                    {f.key === filter && <Check size={16} aria-hidden="true" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {trips.map((t) => (
                <div className="journey" key={t.id}>
                    <div className="truck-icon">
                        <Truck size={26} />
                    </div>
                    <div>
                        <h3>{t.id}</h3>
                        <p>{t.meta}</p>
                        <b>
                            {t.stops} stops · {t.km} km
                        </b>
                    </div>
                    <span className={t.onTime === 100 ? 'status-green' : 'status-amber'}>{t.onTime}% on time</span>
                </div>
            ))}
            {trips.length === 0 && (
                <p className="journeys-empty">
                    {allTrips.length === 0 ? 'No trips in this period.' : 'No trips match this filter.'}
                </p>
            )}
        </section>
    )
}

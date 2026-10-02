'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BellRing,
  ChevronRight,
  Clock3,
  Fuel,
  Navigation,
  Package,
  Route as RouteIcon,
} from 'lucide-react'
import { useModal } from '@/components/app-shell'
import { formatClockParts, formatDistance, formatLongDate, greeting } from '@/lib/maps/format'
import { useRoute } from '@/lib/maps/use-route'
import { useNow } from '@/lib/use-now'
import { CURRENT_STOP_INDEX, PLANNED_ROUTE, ROUTE_ID, STOPS, TOTAL_PACKAGES } from '@/lib/route-data'

const nextStop = STOPS[CURRENT_STOP_INDEX]

export default function HomePage() {
  const setModal = useModal()
  const now = useNow()
  const { route, fetchedAt } = useRoute(PLANNED_ROUTE)
  const nextLeg = route?.legs[CURRENT_STOP_INDEX]
  const eta = nextLeg ? formatClockParts(fetchedAt + nextLeg.durationSeconds * 1000) : null

  return (
      <main className="content home-page">
        <p className="eyebrow">{now ? formatLongDate(now).toUpperCase() : '\u00A0'}</p>
        <h1>
          {now ? greeting(now) : 'Hello'}, Ravi<span className="dot">.</span>
        </h1>
        <p className="subhead">Let&apos;s make every stop count.</p>

        <section className="route-card purple-card">
          <div className="card-row">
  <span>
    <RouteIcon size={20} /> TODAY&apos;S ROUTE
  </span>
            <Link href="/route/map" className="outline-pill">
              Ready to go
            </Link>
          </div>
          <div className="route-id">
            {ROUTE_ID} <small>Peliyagoda → Colombo</small>
          </div>
          <div className="stats">
            <div>
              <b>{String(STOPS.length).padStart(2, '0')}</b>
              <span>delivery stops</span>
            </div>
            <div>
              <b>{TOTAL_PACKAGES}</b>
              <span>packages</span>
            </div>
            <div>
              <b>
                {route ? (route.distanceMeters / 1000).toFixed(1) : '--'}<small>km</small>
              </b>
              <span>planned distance</span>
            </div>
          </div>
          <div className="route-note">
            <Clock3 size={16} /> First delivery before 8:00 AM
          </div>
        </section>

        <div className="quick-actions">
          <button onClick={() => setModal('fine')}>
            <Fuel size={20} />
            Log refuel <ChevronRight size={18} />
          </button>
          <button onClick={() => setModal('incident')}>
            <BellRing size={20} />
            Report a fine <ChevronRight size={18} />
          </button>
        </div>

        <section className="next-stop">
          <div className="card-row">
            <h2>Your next stop</h2>
            <span className="step-pill">
              {CURRENT_STOP_INDEX + 1} / {STOPS.length}
            </span>
          </div>
          <div className="stop-main">
            <div>
              <h3>{nextStop.name}</h3>
              <p>{nextStop.address}</p>
            </div>
            <div className="eta">
              <b>{eta ? eta.time : '--:--'}</b>
              <span>{eta ? `${eta.period} · ETA` : 'ETA'}</span>
            </div>
          </div>
          <div className="stop-meta">
          <span>
            <Package size={16} />
            {nextStop.packages} packages
          </span>
            <span>
            <Navigation size={16} />
              {nextLeg ? `${formatDistance(nextLeg.distanceMeters)} away` : '—'}
          </span>
            <em>{nextStop.category}</em>
          </div>
          <Link href="/route/map" className="primary-button">
            Start journey <ArrowRight size={20} />
          </Link>
        </section>
      </main>
  )
}
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

export default function HomePage() {
  const setModal = useModal()

  return (
      <main className="content home-page">
        <p className="eyebrow">TUESDAY, 29 SEPTEMBER</p>
        <h1>
          Good morning, Ravi<span className="dot">.</span>
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
            LP-6387 <small>Peliyagoda → Colombo</small>
          </div>
          <div className="stats">
            <div>
              <b>04</b>
              <span>delivery stops</span>
            </div>
            <div>
              <b>19</b>
              <span>packages</span>
            </div>
            <div>
              <b>
                14.8<small>km</small>
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
            <span className="step-pill">1 / 4</span>
          </div>
          <div className="stop-main">
            <div>
              <h3>Northgate Market</h3>
              <p>42 Negombo Road, Peliyagoda</p>
            </div>
            <div className="eta">
              <b>6:55</b>
              <span>AM · ETA</span>
            </div>
          </div>
          <div className="stop-meta">
          <span>
            <Package size={16} />5 packages
          </span>
            <span>
            <Navigation size={16} />
            3.2 km away
          </span>
            <em>Fresh</em>
          </div>
          <Link href="/route/map" className="primary-button">
            Start journey <ArrowRight size={20} />
          </Link>
        </section>
      </main>
  )
}
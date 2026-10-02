'use client'

import Link from 'next/link'
import { ArrowLeft, CornerUpRight, BellRing, Clock3, Navigation } from 'lucide-react'
import { useModal } from '@/components/app-shell'

export default function RouteMapPage() {
    const setModal = useModal()

    return (
        <main className="content nav-page">
            <header className="nav-topbar">
                <Link href="/route" className="nav-back" aria-label="Back to route overview">
                    <ArrowLeft size={20} aria-hidden="true" />
                </Link>
                <h1>Navigation</h1>
                <span className="nav-progress">Stop 1 of 4</span>
            </header>

            <div className="map nav-map" role="img" aria-label="Route map with four stops">
                <div className="river" />
                <div className="roads" />
                <div className="route-line" />

                <span className="map-label label-river">Kelani River</span>
                <span className="map-label label-street">Main Street</span>

                <div className="map-stop nav-stop-one">1</div>
                <div className="map-stop stop-two">2</div>
                <div className="map-stop stop-three">3</div>
                <div className="map-stop stop-four">4</div>

                <div className="nav-turn" aria-live="polite">
                    <span className="nav-turn-icon">
                        <CornerUpRight size={22} aria-hidden="true" />
                    </span>
                    <div className="nav-turn-text">
                        <strong>450 m</strong>
                        <span>Turn right onto Station Road</span>
                    </div>
                </div>

                <span className="nav-demo">Demo route</span>

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
                <div className="nav-card-row">
                    <span className="status-purple">STOP 1 · FRESH</span>
                    <small>3.2 km away</small>
                </div>

                <div className="nav-card-row nav-card-main">
                    <div>
                        <h2>Northgate Market</h2>
                        <p>42 Negombo Road, Peliyagoda</p>
                    </div>
                    <div className="nav-eta">
                        <strong>6:55 AM</strong>
                        <small>ETA</small>
                    </div>
                </div>

                <span className="nav-window">
                    <Clock3 size={16} aria-hidden="true" /> Delivery window 6:30–8:00 AM
                </span>

                <button type="button" className="nav-cta">
                    <Navigation size={18} aria-hidden="true" /> Start navigation
                </button>
            </section>
        </main>
    )
}